const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Discovery Feed API: GET /api/logs', () => {
    beforeAll(async () => {
        // Clear existing data
        await prisma.turn.deleteMany();
        await prisma.writer.deleteMany();
        await prisma.log.deleteMany();

        // Seed some test data
        await prisma.log.create({
            data: {
                title: 'Spring Haiku',
                category: 'HAIKU',
                status: 'ACTIVE',
                accessMode: 'OPEN',
                turnMode: 'FREESTYLE',
                createdAt: new Date('2026-03-01T10:00:00Z'),
            },
        });

        const privateLog = await prisma.log.create({
            data: {
                title: 'Secret Diary',
                category: 'FREEWRITING',
                status: 'ACTIVE',
                accessMode: 'PRIVATE',
                turnMode: 'FREESTYLE',
                accessCode: 'ABCDEF',
                createdAt: new Date('2026-03-02T10:00:00Z'),
            },
        });

        const completedLog = await prisma.log.create({
            data: {
                title: 'Finished Novel',
                category: 'SHORT_NOVEL',
                status: 'COMPLETED',
                accessMode: 'OPEN',
                turnMode: 'STRUCTURED',
                seed: 'Once upon a time...',
                createdAt: new Date('2026-03-03T10:00:00Z'),
            },
        });

        // Add writers and a turn for the completed log
        const writer = await prisma.writer.create({
            data: {
                sessionToken: 'test-token',
                logId: completedLog.id,
                joinOrder: 1,
                colorHex: '#FF0000',
            },
        });

        await prisma.turn.create({
            data: {
                content: 'There was a tiny mouse.',
                turnOrder: 1,
                logId: completedLog.id,
                writerId: writer.id,
            },
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should return a paginated list of all logs sorted newest-first', async () => {
        const res = await request(app).get('/api/logs');
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.length).toBe(3);
        
        // Sorting verification (newest first)
        expect(res.body.data[0].title).toBe('Finished Novel'); // Mar 3
        expect(res.body.data[1].title).toBe('Secret Diary');   // Mar 2
        expect(res.body.data[2].title).toBe('Spring Haiku');   // Mar 1
    });

    it('should include participant count and plain text excerpt', async () => {
        const res = await request(app).get('/api/logs');
        const completedLog = res.body.data.find((l) => l.title === 'Finished Novel');
        
        expect(completedLog).toBeDefined();
        expect(completedLog.participantCount).toBe(1);
        expect(completedLog.excerpt).toBe('There was a tiny mouse.');
    });

    it('should fall back to seed for excerpt if no turns exist', async () => {
        // Create a new log with a seed but no turns
        await prisma.log.create({
            data: {
                title: 'Seed Only Log',
                category: 'FREEWRITING',
                status: 'ACTIVE',
                accessMode: 'OPEN',
                turnMode: 'FREESTYLE',
                seed: 'A cold wind blew.',
                createdAt: new Date('2026-03-04T10:00:00Z'),
            },
        });

        const res = await request(app).get('/api/logs');
        const seedLog = res.body.data.find((l) => l.title === 'Seed Only Log');
        
        expect(seedLog).toBeDefined();
        expect(seedLog.participantCount).toBe(0);
        expect(seedLog.excerpt).toBe('A cold wind blew.');
    });

    it('should handle missing excerpt gracefully (no seed, no turns)', async () => {
        const res = await request(app).get('/api/logs');
        const emptyLog = res.body.data.find((l) => l.title === 'Spring Haiku');
        
        expect(emptyLog).toBeDefined();
        expect(emptyLog.excerpt).toBe('');
    });

    it('should filter by category if provided', async () => {
        const res = await request(app).get('/api/logs?category=HAIKU');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toBe('Spring Haiku');
    });

    it('should support pagination via page and limit', async () => {
        // We have 4 logs now (1 from seed fallback test, 3 from before).
        const resPage1 = await request(app).get('/api/logs?page=1&limit=2');
        expect(resPage1.status).toBe(200);
        expect(resPage1.body.data.length).toBe(2);
        expect(resPage1.body.pagination.page).toBe(1);
        expect(resPage1.body.pagination.totalPages).toBeGreaterThan(1);

        const resPage2 = await request(app).get('/api/logs?page=2&limit=2');
        expect(resPage2.status).toBe(200);
        expect(resPage2.body.data.length).toBe(2);
        expect(resPage2.body.pagination.page).toBe(2);
        expect(resPage2.body.pagination.totalPages).toBe(2);
    });

    it('should return pagination key with page, limit, total, totalPages', async () => {
        const res = await request(app).get('/api/logs?page=1&limit=5');
        expect(res.status).toBe(200);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.pagination.limit).toBe(5);
        expect(typeof res.body.pagination.total).toBe('number');
        expect(typeof res.body.pagination.totalPages).toBe('number');
        expect(res.body.pagination.totalPages).toBe(Math.ceil(res.body.pagination.total / 5));
    });

    it('should paginate correctly when combined with category filter', async () => {
        // Only 1 HAIKU log exists, so page=1&limit=1 should show totalPages=1
        const res = await request(app).get('/api/logs?category=HAIKU&page=1&limit=1');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.pagination.total).toBe(1);
        expect(res.body.pagination.totalPages).toBe(1);
    });

    it('should return empty data array (not 400) when page exceeds totalPages', async () => {
        const res = await request(app).get('/api/logs?page=9999&limit=20');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.page).toBe(9999);
    });

    it('should return 400 for invalid params: page=abc, limit=0, limit=101', async () => {
        const resPageAbc = await request(app).get('/api/logs?page=abc');
        expect(resPageAbc.status).toBe(400);

        const resLimitZero = await request(app).get('/api/logs?limit=0');
        expect(resLimitZero.status).toBe(400);

        const resLimitOver = await request(app).get('/api/logs?limit=101');
        expect(resLimitOver.status).toBe(400);
    });
});
