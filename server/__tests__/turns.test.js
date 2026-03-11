const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('POST /api/logs/:id/turns', () => {
    let keeperCookie;
    let writer2Cookie;
    let writer3Cookie;
    
    let structuredLogId;
    let freestyleLogId;

    beforeAll(async () => {
        // Clean relevant tables before test run
        await prisma.turn.deleteMany({});
        await prisma.writer.deleteMany({});
        await prisma.log.deleteMany({});
        
        const structRes = await request(app).post('/api/logs').send({
            title: 'Structured Log',
            accessMode: 'OPEN',
            turnMode: 'STRUCTURED',
            turnLimit: 8,
            perTurnLengthLimit: 140
        });
        
        structuredLogId = structRes.body.id;
        const cookieArray = structRes.headers['set-cookie'];
        
        const keeperTokenMatch = cookieArray ? cookieArray[0].match(/sessionToken=([^;]+)/) : null;
        const keeperToken = keeperTokenMatch ? keeperTokenMatch[1] : null;
        keeperCookie = [`sessionToken=${keeperToken}`];

        const freeRes = await request(app).post('/api/logs').set('Cookie', keeperCookie).send({
            title: 'Freestyle Log',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE'
        });
        freestyleLogId = freeRes.body.id;
        
        // Because we removed automatic Keeper creation during POST /api/logs,
        // we must manually explicitly create the Keeper writer here for tests to behave as expected.
        const keeperWriter = await prisma.writer.create({
            data: {
                sessionToken: keeperToken,
                logId: structuredLogId,
                joinOrder: 1,
                colorHex: '#FF0000',
            }
        });
        
        await prisma.writer.create({
            data: {
                sessionToken: keeperToken,
                logId: freestyleLogId,
                joinOrder: 1,
                colorHex: '#FF0000',
            }
        });
        
        // 2. We need to create Writer2 and Writer3 for both logs using fixed UUID mock tokens.
        const w2Session = '11111111-1111-4111-8111-111111111111';
        writer2Cookie = [`sessionToken=${w2Session}`]; 
        await prisma.writer.createMany({
            data: [
                { logId: structuredLogId, sessionToken: w2Session, joinOrder: 2, colorHex: '#FF8C00' },
                { logId: freestyleLogId, sessionToken: w2Session, joinOrder: 2, colorHex: '#FF8C00' }
            ]
        });

        const w3Session = '22222222-2222-4222-8222-222222222222';
        writer3Cookie = [`sessionToken=${w3Session}`];
        await prisma.writer.createMany({
            data: [
                { logId: structuredLogId, sessionToken: w3Session, joinOrder: 3, colorHex: '#0000FF' },
                { logId: freestyleLogId, sessionToken: w3Session, joinOrder: 3, colorHex: '#0000FF' }
            ]
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('General Validation', () => {
        it('rejects turns for non-existent logs', async () => {
             const res = await request(app)
                .post('/api/logs/invalid-id-here/turns')
                .set('Cookie', keeperCookie)
                .send({ content: 'Hello' });
            expect(res.status).toBe(404);
        });

        it('implicitly joins non-participants and accepts their first turn', async () => {
            const randomCookie = ['sessionToken=random123'];
             const res = await request(app)
                .post(`/api/logs/${freestyleLogId}/turns`)
                .set('Cookie', randomCookie)
                .send({ content: 'Hello from a new person!' });
            expect(res.status).toBe(201);
            
            // Verify the writer was created
            const newWriter = await prisma.writer.findFirst({
                where: { logId: freestyleLogId },
                orderBy: { joinOrder: 'desc' }
            });
            expect(newWriter).toBeDefined();
            expect(newWriter.colorHex).toBe('#d4d0c8'); // Default color
        });

        it('rejects submissions that exceed perTurnLengthLimit', async () => {
            const longText = 'A'.repeat(150);
            const res = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', keeperCookie) // Keeper is first
                .send({ content: longText });
            
            expect(res.status).toBe(422);
            expect(res.body.error).toMatch(/exceeds maximum length/i);
        });
    });

    describe('Freestyle Mode Rules', () => {
        it('allows anyone to submit the first turn', async () => {
            const res = await request(app)
                .post(`/api/logs/${freestyleLogId}/turns`)
                .set('Cookie', keeperCookie)
                .send({ content: 'Freestyle Start' });
            expect(res.status).toBe(201);
            expect(res.body.turns).toHaveLength(2); // Implicit join was the first turn
        });

        it('rejects consecutive turns by the same writer', async () => {
             const res = await request(app)
                .post(`/api/logs/${freestyleLogId}/turns`)
                .set('Cookie', keeperCookie)
                .send({ content: 'I am writing twice' });
            
            expect(res.status).toBe(403);
            expect(res.body.error).toMatch(/Consecutive turns/i);
        });

        it('allows a different writer to submit', async () => {
             const res = await request(app)
                .post(`/api/logs/${freestyleLogId}/turns`)
                .set('Cookie', writer2Cookie)
                .send({ content: 'Freestyle Second' });
            
            expect(res.status).toBe(201);
            expect(res.body.turns).toHaveLength(3);
        });
    });

    describe('Structured Mode Rules', () => {
        it('requires Keeper to go first (Writer #1)', async () => {
            // W2 tries to go first
            const wrongRes = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', writer2Cookie)
                .send({ content: 'Let me go first!' });
            expect(wrongRes.status).toBe(403);
            expect(wrongRes.body.error).toMatch(/Not your turn/i);

            // Keeper goes
            const rightRes = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', keeperCookie)
                .send({ content: 'Keeper 1' });
            
            expect(rightRes.status).toBe(201);
            expect(rightRes.body.turns).toHaveLength(1);
        });

        it('requires Writer #2 to go second', async () => {
            // W1 tries to go again
            const wrongRes = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', keeperCookie)
                .send({ content: 'Me again' });
            expect(wrongRes.status).toBe(403);

            // W3 tries to jump the line
            const wrongRes3 = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', writer3Cookie)
                .send({ content: 'Me skip' });
            expect(wrongRes3.status).toBe(403);

            // W2 goes
            const rightRes = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', writer2Cookie)
                .send({ content: 'Writer 2', nickname: 'Fast W2' });
            expect(rightRes.status).toBe(201);
            expect(rightRes.body.turns).toHaveLength(2);

            // Check if nickname got saved
            const writer2 = await prisma.writer.findFirst({ where: { logId: structuredLogId, joinOrder: 2 } });
            expect(writer2.nickname).toBe('Fast W2');
        });

        it('requires Writer #3 to go third (Mid-log joins)', async () => {
            // Suppose Writer 4 joins mid-log right now
            const w4Session = '33333333-3333-4333-8333-333333333333';
            const writer4Cookie = [`sessionToken=${w4Session}`];
            await prisma.writer.create({
                data: { logId: structuredLogId, sessionToken: w4Session, joinOrder: 4, colorHex: '#008000' }
            });

            // W3 goes
            const rightRes = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', writer3Cookie)
                .send({ content: 'Writer 3' });
            expect(rightRes.status).toBe(201);
        });

        it('includes newly joined writers in the queue', async () => {
            const w4Session = '33333333-3333-4333-8333-333333333333';
            const writer4Cookie = [`sessionToken=${w4Session}`];
            
            // W4 goes (after W3)
            const rightRes = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', writer4Cookie)
                .send({ content: 'Writer 4 jumps in' });
            expect(rightRes.status).toBe(201);
        });

        it('wraps around to Keeper to start Round 2', async () => {
            const rightRes = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', keeperCookie)
                .send({ content: 'Keeper 2' });
            expect(rightRes.status).toBe(201);
        });
        
        it('closes the log when turn limit is hit', async () => {
            // With turnLimit=8, we already have Keeper1, W2, W3, W4, Keeper2 = 5 turns.
            // Now W2, W3, W4 submit (6, 7, 8). On turn 8, log should complete.
            const w4SessionCookie = [`sessionToken=33333333-3333-4333-8333-333333333333`];
            await request(app).post(`/api/logs/${structuredLogId}/turns`).set('Cookie', writer2Cookie).send({ content: 'w2 2' });
            await request(app).post(`/api/logs/${structuredLogId}/turns`).set('Cookie', writer3Cookie).send({ content: 'w3 2' });
            const finalRes = await request(app).post(`/api/logs/${structuredLogId}/turns`).set('Cookie', w4SessionCookie).send({ content: 'w4 2' });

            expect(finalRes.status).toBe(201);

            const log = await prisma.log.findUnique({ where: { id: structuredLogId } });
            expect(log.status).toBe('COMPLETED');

            // Further submissions should fail
            const lateRes = await request(app)
                .post(`/api/logs/${structuredLogId}/turns`)
                .set('Cookie', keeperCookie)
                .send({ content: 'Late' });
            expect(lateRes.status).toBe(403);
            expect(lateRes.body.error).toMatch(/completed/i);
        });
    });

    describe('Skip and Edge Cases', () => {
        let skipLogId;
        beforeAll(async () => {
            const skipRes = await request(app).post('/api/logs').set('Cookie', keeperCookie).send({
                title: 'Skip Log',
                accessMode: 'OPEN',
                turnMode: 'STRUCTURED'
            });
            skipLogId = skipRes.body.id;
            
            const keeperTokenMatch = keeperCookie[0].match(/sessionToken=([^;]+)/);
            const kToken = keeperTokenMatch ? keeperTokenMatch[1] : keeperCookie[0].split('=')[1];
            
            await prisma.writer.create({
                data: {
                    logId: skipLogId,
                    sessionToken: kToken,
                    joinOrder: 1,
                    colorHex: '#FF0000'
                }
            });
            
            await prisma.writer.createMany({
                data: [
                    { logId: skipLogId, sessionToken: 'w2-skip', joinOrder: 2, colorHex: '#AAAAAA' },
                    { logId: skipLogId, sessionToken: 'w3-skip', joinOrder: 3, colorHex: '#BBBBBB' }
                ]
            });
        });

        it('Keeper can skip the current waiting writer', async () => {
            // Keeper goes first
            await request(app).post(`/api/logs/${skipLogId}/turns`).set('Cookie', keeperCookie).send({ content: 'K' });
            
            // W2 is next. Keeper skips W2.
            const skipRes = await request(app).post(`/api/logs/${skipLogId}/skip`).set('Cookie', keeperCookie);
            expect(skipRes.status).toBe(200);
            
            // Now W3 should be able to go.
            const w3Res = await request(app).post(`/api/logs/${skipLogId}/turns`).set('Cookie', ['sessionToken=w3-skip']).send({ content: 'W3' });
            expect(w3Res.status).toBe(201);
        });

        it('Non-keepers cannot skip turns', async () => {
            const skipRes = await request(app).post(`/api/logs/${skipLogId}/skip`).set('Cookie', ['sessionToken=w2-skip']);
            expect(skipRes.status).toBe(403);
            expect(skipRes.body.error).toMatch(/Keeper/);
        });
    });
});
