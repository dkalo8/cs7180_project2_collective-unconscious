const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('POST /api/logs', () => {
    let sessionCookie;

    beforeAll(async () => {
        // Clean relevant tables before test run
        await prisma.turn.deleteMany({});
        await prisma.writer.deleteMany({});
        await prisma.log.deleteMany({});
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('creates a valid public log with server-side default category', async () => {
        const res = await request(app).post('/api/logs').send({
            title: 'My Public Log',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
        });

        // Capture cookie for subsequent requests
        sessionCookie = res.headers['set-cookie'];

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('My Public Log');
        expect(res.body.category).toBe('Freewriting'); // server-side default
        expect(res.body.accessCode).toBeNull();
        // Keeper should be Writer #1 with red color
        expect(res.body.Keeper).toBeDefined();
        expect(res.body.Keeper.joinOrder).toBe(1);
        expect(res.body.Keeper.colorHex).toBe('#FF0000');
    });

    it('creates a private log and returns a 6-char access code', async () => {
        const res = await request(app)
            .post('/api/logs')
            .set('Cookie', sessionCookie)
            .send({
                title: 'Secret Log',
                accessMode: 'PRIVATE',
                turnMode: 'STRUCTURED',
            });

        expect(res.status).toBe(201);
        expect(res.body.accessMode).toBe('PRIVATE');
        expect(typeof res.body.accessCode).toBe('string');
        expect(res.body.accessCode).toHaveLength(6);
    });

    it('accepts a valid capped participant limit (>= 2)', async () => {
        const res = await request(app).post('/api/logs').send({
            title: 'Capped Log',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
            participantLimit: 5,
        });

        expect(res.status).toBe(201);
        expect(res.body.participantLimit).toBe(5);
    });

    it('rejects participantLimit < 2', async () => {
        const res = await request(app).post('/api/logs').send({
            title: 'Too Few',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
            participantLimit: 1,
        });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.participantLimit).toBeDefined();
    });

    it('rejects a missing title', async () => {
        const res = await request(app).post('/api/logs').send({
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
        });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.title).toBeDefined();
    });

    it('rejects a missing turnMode', async () => {
        const res = await request(app).post('/api/logs').send({
            title: 'No Turn Mode',
            accessMode: 'OPEN',
        });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});
