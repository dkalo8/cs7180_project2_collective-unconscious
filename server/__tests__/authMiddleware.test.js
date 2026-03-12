require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cookieParser = require('cookie-parser');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

const prisma = new PrismaClient();

// Mock middleware implementations to satisfy tests initially, then we will actually build them.
const { sessionMiddleware, requireAuth, requireWriter } = require('../src/middleware/auth');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

app.get('/api/test-session', (req, res) => {
    res.status(200).json({ token: req.sessionToken });
});

app.get('/api/test-require-auth', requireAuth, (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/api/test-require-writer/:logId', requireWriter, (req, res) => {
    res.status(200).json({ writerId: req.writer.id });
});

app.post('/api/test-require-writer-body', requireWriter, (req, res) => {
    res.status(200).json({ writerId: req.writer.id });
});

describe('Authentication Middleware', () => {
    let testLog;

    beforeAll(async () => {
        // Create a test log for requireWriter tests
        testLog = await prisma.log.create({
            data: {
                title: 'Test Log for Auth Middleware',
                accessMode: 'OPEN'
            }
        });
    });

    afterAll(async () => {
        await prisma.writer.deleteMany({ where: { logId: testLog.id } });
        await prisma.log.deleteMany({ where: { id: testLog.id } });
        await prisma.$disconnect();
    });

    describe('sessionMiddleware', () => {
        it('should generate a new UUIDv4 sessionToken and set it as an HTTP-only, Lax cookie if none provided', async () => {
            const response = await request(app).get('/api/test-session');

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
            expect(uuidValidate(response.body.token)).toBe(true);
            
            // Check cookie formatting
            const setCookieHeader = response.headers['set-cookie'];
            expect(setCookieHeader).toBeDefined();
            expect(setCookieHeader[0]).toMatch(/sessionToken=[a-f0-9-]+;/);
            expect(setCookieHeader[0]).toMatch(/HttpOnly/i);
            expect(setCookieHeader[0]).toMatch(/SameSite=lax/i);
            expect(setCookieHeader[0]).toMatch(/Max-Age=/i);
        });

        it('should persist an existing valid sessionToken and not generate a new cookie', async () => {
            const existingToken = uuidv4();
            const response = await request(app)
                .get('/api/test-session')
                .set('Cookie', `sessionToken=${existingToken}`);

            expect(response.status).toBe(200);
            expect(response.body.token).toBe(existingToken);
            // Should not set a new cookie since it's already present
            expect(response.headers['set-cookie']).toBeUndefined();
        });
        
        it('should preserve non-UUID tokens in non-production (dev token switcher support)', async () => {
            const forgedToken = "my-creator-token";
            const response = await request(app)
                .get('/api/test-session')
                .set('Cookie', `sessionToken=${forgedToken}`);

            expect(response.status).toBe(200);
            expect(response.body.token).toBe(forgedToken);
            expect(response.headers['set-cookie']).toBeUndefined();
        });

        it('should discard non-UUID tokens and renew in production', async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const forgedToken = "not-a-uuid";
            const response = await request(app)
                .get('/api/test-session')
                .set('Cookie', `sessionToken=${forgedToken}`);

            process.env.NODE_ENV = originalEnv;

            expect(response.status).toBe(200);
            expect(uuidValidate(response.body.token)).toBe(true);
            expect(response.body.token).not.toBe(forgedToken);
            expect(response.headers['set-cookie']).toBeDefined();
        });
    });

    describe('requireAuth', () => {
        it('should allow access if sessionToken is present and a valid UUID', async () => {
            const token = uuidv4();
            const response = await request(app)
                .get('/api/test-require-auth')
                .set('Cookie', `sessionToken=${token}`);
                
            expect(response.status).toBe(200);
        });
        
        // This case tests what happens if sessionMiddleware wasn't applied or failed
        it('should return 401 Unauthorized if sessionToken is missing entirely (simulating unprotected/raw route error)', async () => {
            // We need a raw express app WITHOUT sessionMiddleware to test purely requireAuth behavior
            const rawApp = express();
            rawApp.get('/api/raw-require-auth', requireAuth, (req, res) => res.status(200).send('OK'));
            
            const response = await request(rawApp).get('/api/raw-require-auth');
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized: Invalid or missing session token');
        });
        
        it('should allow non-UUID tokens in non-production (dev token switcher support)', async () => {
            const rawApp = express();
            rawApp.use((req, res, next) => {
                req.sessionToken = 'my-creator-token';
                next();
            });
            rawApp.get('/api/raw-require-auth', requireAuth, (req, res) => res.status(200).send('OK'));

            const response = await request(rawApp).get('/api/raw-require-auth');
            expect(response.status).toBe(200);
        });

        it('should return 401 if sessionToken is not a valid UUID in production', async () => {
            const rawApp = express();
            rawApp.use((req, res, next) => {
                req.sessionToken = 'invalid-fake-uuid';
                next();
            });
            rawApp.get('/api/raw-require-auth', requireAuth, (req, res) => res.status(200).send('OK'));

            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const response = await request(rawApp).get('/api/raw-require-auth');
            expect(response.status).toBe(401);

            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('requireWriter', () => {
        let testToken;

        beforeEach(() => {
            testToken = uuidv4();
        });

        it('should return 400 Bad Request if logId is missing', async () => {
            const rawApp = express();
            rawApp.post('/api/raw-require-writer', (req, res, next) => {
                req.sessionToken = testToken;
                next();
            }, requireWriter, (req, res) => res.status(200).send('OK'));

            const response = await request(rawApp).post('/api/raw-require-writer');
            expect(response.status).toBe(400);
        });

        it('should create a new Writer record if one does not exist for the token+logId', async () => {
            const response = await request(app)
                .post(`/api/test-require-writer/${testLog.id}`)
                .set('Cookie', `sessionToken=${testToken}`);

            expect(response.status).toBe(200);
            expect(response.body.writerId).toBeDefined();

            // Verify in database
            const writer = await prisma.writer.findUnique({
                where: { id: response.body.writerId }
            });
            expect(writer).toBeDefined();
            expect(writer.sessionToken).toBe(testToken);
            expect(writer.logId).toBe(testLog.id);
            expect(writer.colorHex).toBeDefined(); // Assuming we assign a default
        });

        it('should resolve the existing Writer object if the sessionToken+logId matches', async () => {
            // First time: creates the writer
            const response1 = await request(app)
                .post(`/api/test-require-writer/${testLog.id}`)
                .set('Cookie', `sessionToken=${testToken}`);
            
            const firstWriterId = response1.body.writerId;

            // Second time: should resolve the same writer without creating a new one
            const response2 = await request(app)
                .post(`/api/test-require-writer/${testLog.id}`)
                .set('Cookie', `sessionToken=${testToken}`);

            expect(response2.status).toBe(200);
            expect(response2.body.writerId).toBe(firstWriterId);

            // Verify count in DB is exactly 1 for this token+log
            const count = await prisma.writer.count({
                where: { sessionToken: testToken, logId: testLog.id }
            });
            expect(count).toBe(1);
        });
        
        it('should extract logId from req.body if not in req.params', async () => {
             const response = await request(app)
                .post(`/api/test-require-writer-body`)
                .send({ logId: testLog.id })
                .set('Cookie', `sessionToken=${testToken}`);

            expect(response.status).toBe(200);
        });
        
        it('should return 404 Not Found if logId does not exist in DB', async () => {
             const nonExistentLogId = uuidv4();
             const response = await request(app)
                .post(`/api/test-require-writer/${nonExistentLogId}`)
                .set('Cookie', `sessionToken=${testToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Log not found");
        });
    });
});
