const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('GET /api/logs/:id', () => {
    let createdLogId;
    let sessionCookie;

    beforeAll(async () => {
        // Clean relevant tables before test run
        await prisma.turn.deleteMany({});
        await prisma.writer.deleteMany({});
        await prisma.log.deleteMany({});

        // Create a log to fetch later
        const res = await request(app).post('/api/logs').send({
            title: 'Test Log for Detail API',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
            category: 'FREEWRITING'
        });
        
        createdLogId = res.body.id;
        sessionCookie = res.headers['set-cookie'];
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('returns 404 for a non-existent log', async () => {
        const res = await request(app).get('/api/logs/non-existent-id-123');
        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    it('fetches a single log with its turns and participants', async () => {
        const res = await request(app).get(`/api/logs/${createdLogId}`);
        
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(createdLogId);
        expect(res.body.title).toBe('Test Log for Detail API');
        expect(res.body.category).toBe('FREEWRITING');
        expect(res.body.accessMode).toBe('OPEN');
        expect(res.body.turnMode).toBe('FREESTYLE');
        
        // Should include writers (empty since no one has joined/submitted yet)
        expect(res.body.writers).toBeDefined();
        expect(Array.isArray(res.body.writers)).toBe(true);
        expect(res.body.writers.length).toBe(0);

        // Should include turns array
        expect(res.body.turns).toBeDefined();
        expect(Array.isArray(res.body.turns)).toBe(true);

        // Should expose isMyTurn (true for a fresh log with no writers)
        expect(res.body.isMyTurn).toBe(true);

        // nextWriter should be null (no participants yet)
        expect(res.body.nextWriter).toBeNull();

        // creatorToken must NOT be exposed
        expect(res.body.creatorToken).toBeUndefined();
    });
});
