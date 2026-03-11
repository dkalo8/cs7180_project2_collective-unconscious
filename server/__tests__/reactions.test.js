const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SYMBOLS = ['✦', '◎', '∿', '⌖'];

describe('Symbol reactions on completed logs (S1-10)', () => {
    let completedLogId;
    let activeLogId;
    let sessionCookie;

    beforeAll(async () => {
        await prisma.reaction.deleteMany({});
        await prisma.turn.deleteMany({});
        await prisma.writer.deleteMany({});
        await prisma.log.deleteMany({});

        // Create a completed log
        const res = await request(app).post('/api/logs').send({
            title: 'Completed Reactions Log',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
        });
        sessionCookie = res.headers['set-cookie'];
        completedLogId = res.body.id;

        // Force it to COMPLETED status
        await prisma.log.update({
            where: { id: completedLogId },
            data: { status: 'COMPLETED' },
        });

        // Create an active log
        const res2 = await request(app).post('/api/logs').send({
            title: 'Active Log',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
        });
        activeLogId = res2.body.id;
    });

    afterAll(async () => {
        await prisma.reaction.deleteMany({});
        await prisma.turn.deleteMany({});
        await prisma.writer.deleteMany({});
        await prisma.log.deleteMany({});
        await prisma.$disconnect();
    });

    it('POST /api/logs/:id/reactions — adds a reaction to a completed log', async () => {
        const res = await request(app)
            .post(`/api/logs/${completedLogId}/reactions`)
            .set('Cookie', sessionCookie)
            .send({ symbol: '✦' });

        expect(res.status).toBe(201);
        expect(res.body.symbol).toBe('✦');
        expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/logs/:id — returns reactions counts on a log', async () => {
        const res = await request(app).get(`/api/logs/${completedLogId}`);
        expect(res.status).toBe(200);
        expect(res.body.reactions).toBeDefined();
        expect(res.body.reactions['✦']).toBeGreaterThanOrEqual(1);
    });

    it('DELETE /api/logs/:id/reactions — removes a reaction from a completed log', async () => {
        const res = await request(app)
            .delete(`/api/logs/${completedLogId}/reactions`)
            .set('Cookie', sessionCookie)
            .send({ symbol: '✦' });

        expect(res.status).toBe(200);
        expect(res.body.count).toBeDefined();
    });

    it('POST /api/logs/:id/reactions — rejects invalid symbol', async () => {
        const res = await request(app)
            .post(`/api/logs/${completedLogId}/reactions`)
            .set('Cookie', sessionCookie)
            .send({ symbol: '🔥' });

        expect(res.status).toBe(400);
    });

    it('POST /api/logs/:id/reactions — rejects reaction on active log', async () => {
        const res = await request(app)
            .post(`/api/logs/${activeLogId}/reactions`)
            .set('Cookie', sessionCookie)
            .send({ symbol: '◎' });

        expect(res.status).toBe(403);
    });

    it('POST /api/logs/:id/reactions — same session cannot react twice with same symbol', async () => {
        // First reaction
        await request(app)
            .post(`/api/logs/${completedLogId}/reactions`)
            .set('Cookie', sessionCookie)
            .send({ symbol: '◎' });

        // Second attempt with same symbol and session
        const res = await request(app)
            .post(`/api/logs/${completedLogId}/reactions`)
            .set('Cookie', sessionCookie)
            .send({ symbol: '◎' });

        expect(res.status).toBe(409);
    });
});
