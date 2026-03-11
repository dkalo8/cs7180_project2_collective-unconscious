const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');
const prisma = new PrismaClient();

describe('Moderation API', () => {
    let logId;
    let turnId;
    const adminSecret = 'test-admin-secret';
    process.env.ADMIN_SECRET = adminSecret;

    beforeAll(async () => {
        // Create a log and a turn to report
        const log = await prisma.log.create({
            data: {
                title: 'Moderation Test Log',
                accessMode: 'OPEN',
                turnMode: 'FREESTYLE',
            },
        });
        logId = log.id;

        const writer = await prisma.writer.create({
            data: {
                sessionToken: 'test-session-token',
                logId: log.id,
                colorHex: '#000000',
                joinOrder: 1,
            },
        });

        const turn = await prisma.turn.create({
            data: {
                content: 'Inappropriate content',
                turnOrder: 1,
                logId: log.id,
                writerId: writer.id,
            },
        });
        turnId = turn.id;
    });

    afterAll(async () => {
        await prisma.report.deleteMany();
        await prisma.moderationAction.deleteMany();
        await prisma.turn.deleteMany();
        await prisma.writer.deleteMany();
        await prisma.log.deleteMany();
        await prisma.$disconnect();
    });

    describe('POST /api/reports', () => {
        it('should create a report for a turn', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Cookie', ['sessionToken=reporter-token'])
                .send({
                    targetType: 'TURN',
                    targetId: turnId,
                    reason: 'hateful',
                });

            expect(res.status).toBe(201);
            expect(res.body.reason).toBe('hateful');
            expect(res.body.targetId).toBe(turnId);
            expect(res.body.status).toBe('PENDING');
        });

        it('should reject reports with missing fields', async () => {
            const res = await request(app)
                .post('/api/reports')
                .send({ targetType: 'TURN' });
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/moderation/queue', () => {
        it('should return 401/403 without admin auth', async () => {
            const res = await request(app).get('/api/moderation/queue');
            expect(res.status).toBe(401);
        });

        it('should return pending reports with correct admin secret', async () => {
            const res = await request(app)
                .get('/api/moderation/queue')
                .set('x-admin-secret', adminSecret);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].targetSummary).toBeDefined();
        });
    });

    describe('POST /api/moderation/action', () => {
        let reportId;

        it('should hide a turn when ACTIONED', async () => {
            const report = await prisma.report.findFirst({ where: { status: 'PENDING' } });
            reportId = report.id;

            const res = await request(app)
                .post('/api/moderation/action')
                .set('x-admin-secret', adminSecret)
                .send({
                    reportId,
                    action: 'HIDE_TURN',
                    note: 'Confirmed inappropriate',
                });

            expect(res.status).toBe(200);
            
            // Verify turn is hidden
            const turn = await prisma.turn.findUnique({ where: { id: turnId } });
            expect(turn.isHidden).toBe(true);

            // Verify report is actioned
            const actionedReport = await prisma.report.findUnique({ where: { id: reportId } });
            expect(actionedReport.status).toBe('ACTIONED');
        });

        it('should redact content in getLogById after hiding', async () => {
            const res = await request(app).get(`/api/logs/${logId}`);
            const hiddenTurn = res.body.turns.find(t => t.id === turnId);
            expect(hiddenTurn.content).toBe('[content removed]');
        });
        
        it('should NOT redact content in getLogById for admins', async () => {
            const res = await request(app)
                .get(`/api/logs/${logId}`)
                .set('x-admin-secret', adminSecret);
            const hiddenTurn = res.body.turns.find(t => t.id === turnId);
            expect(hiddenTurn.content).toBe('Inappropriate content');
        });
    });
});
