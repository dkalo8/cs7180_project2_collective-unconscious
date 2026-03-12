const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Creator & Join Order Scenarios (Join == First Turn)', () => {
    let creatorCookie, userACookie, userBCookie, userCCookie;

    beforeAll(async () => {
        // Clear db
        await prisma.turn.deleteMany();
        await prisma.writer.deleteMany();
        await prisma.log.deleteMany();

        const { v4: uuidv4 } = require('uuid');
        const cTok = uuidv4();
        const aTok = uuidv4();
        const bTok = uuidv4();
        const cJoinTok = uuidv4();

        creatorCookie = [`sessionToken=${cTok}`];
        userACookie = [`sessionToken=${aTok}`];
        userBCookie = [`sessionToken=${bTok}`];
        userCCookie = [`sessionToken=${cJoinTok}`];

        global.testTokens = { cTok, aTok, bTok, cJoinTok };
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    // Helper to create a log
    const createLog = async (turnMode, turnLimit = null) => {
        const res = await request(app).post('/api/logs').set('Cookie', creatorCookie).send({
            title: `Scenario Log ${turnMode}`,
            accessMode: 'OPEN',
            turnMode,
            turnLimit
        });
        return res.body.id;
    };

    // Helper to submit a turn
    const submitTurn = async (logId, cookie, content) => {
        return await request(app).post(`/api/logs/${logId}/turns`).set('Cookie', cookie).send({ content });
    };

    // Helper to skip a turn
    const skipTurnCall = async (logId, cookie) => {
        return await request(app).post(`/api/logs/${logId}/skip`).set('Cookie', cookie);
    };

    it('Scenario 1 (Happy Path - Freestyle): User A submits first (Writer #1), Creator submits second (Writer #2)', async () => {
        const logId = await createLog('FREESTYLE');

        const resA = await submitTurn(logId, userACookie, 'User A line 1');
        expect(resA.status).toBe(201);

        const resC = await submitTurn(logId, creatorCookie, 'Creator line 1');
        expect(resC.status).toBe(201);

        const logDetail = await request(app).get(`/api/logs/${logId}`);
        const writers = logDetail.body.writers;
        expect(writers).toHaveLength(2);
        const writerA = await prisma.writer.findFirst({ where: { logId, sessionToken: global.testTokens.aTok } });
        const writerC = await prisma.writer.findFirst({ where: { logId, sessionToken: global.testTokens.cTok } });
        expect(writerA.joinOrder).toBe(1);
        expect(writerC.joinOrder).toBe(2);
    });

    it('Scenario 2 (Happy Path - Structured): A submits first (in-rotation), B joins (OOR), Creator joins (OOR)', async () => {
        const logId = await createLog('STRUCTURED');

        // A submits first → in-rotation (no prior in-rotation turns)
        const resA = await submitTurn(logId, userACookie, 'A1');
        expect(resA.status).toBe(201);

        // B submits (new joiner, A's turn exists → B is out-of-rotation)
        const resB = await submitTurn(logId, userBCookie, 'B1');
        expect(resB.status).toBe(201);

        // Creator submits (new joiner → out-of-rotation)
        const resC = await submitTurn(logId, creatorCookie, 'C1');
        expect(resC.status).toBe(201);

        const logDetail = await request(app).get(`/api/logs/${logId}`);
        const writers = logDetail.body.writers;
        expect(writers).toHaveLength(3);
        const writerA = await prisma.writer.findFirst({ where: { logId, sessionToken: global.testTokens.aTok } });
        const writerB = await prisma.writer.findFirst({ where: { logId, sessionToken: global.testTokens.bTok } });
        const writerC = await prisma.writer.findFirst({ where: { logId, sessionToken: global.testTokens.cTok } });
        expect(writerA.joinOrder).toBe(1);
        expect(writerB.joinOrder).toBe(2);
        expect(writerC.joinOrder).toBe(3);
    });

    it('Scenario 3 (Structured Strict): after OOR joins, rotation resumes correctly', async () => {
        const logId = await createLog('STRUCTURED');

        // A submits A1 → in-rotation (first ever)
        await submitTurn(logId, userACookie, 'A1');
        // B submits B1 → isOutOfRotation (A1 is in-rotation)
        await submitTurn(logId, userBCookie, 'B1');

        // B just wrote (OOR). Pointer was going to B, but B just wrote,
        // so system advances pointer to A to avoid consecutive same-writer.
        const resB2early = await submitTurn(logId, userBCookie, 'B tries again too soon');
        expect(resB2early.status).toBe(403);
        expect(resB2early.body.error).toMatch(/Not your turn/i);

        // A goes (pointer was advanced to A)
        const resA2 = await submitTurn(logId, userACookie, 'A2');
        expect(resA2.status).toBe(201);

        // Now B's rotation turn
        const resB2 = await submitTurn(logId, userBCookie, 'B2');
        expect(resB2.status).toBe(201);

        // A's turn again. B can't go.
        const resBbad = await submitTurn(logId, userBCookie, 'B tries out of order');
        expect(resBbad.status).toBe(403);

        const resA3 = await submitTurn(logId, userACookie, 'A3');
        expect(resA3.status).toBe(201);

        const logDetail = await request(app).get(`/api/logs/${logId}`);
        expect(logDetail.body.writers).toHaveLength(2);
    });

    it('Scenario 4 (Happy Path - Creator is #1): Creator submits first, A submits second', async () => {
        const logId = await createLog('STRUCTURED');

        await submitTurn(logId, creatorCookie, 'Creator goes first'); // Creator #1 (in-rotation)
        await submitTurn(logId, userACookie, 'A goes second'); // A #2 (OOR since Creator is in-rotation)

        const logDetail = await request(app).get(`/api/logs/${logId}`);
        const writers = logDetail.body.writers;
        expect(writers).toHaveLength(2);
        const writerC = await prisma.writer.findFirst({ where: { logId, sessionToken: global.testTokens.cTok } });
        expect(writerC.joinOrder).toBe(1);
    });

    it('Scenario 5 (Creator Skipping): A and B join, Creator skips next expected', async () => {
        const logId = await createLog('STRUCTURED');

        await submitTurn(logId, userACookie, 'A1'); // A #1 (in-rotation)
        await submitTurn(logId, userBCookie, 'B1'); // B #2 (OOR)

        // After B1(OOR): B is in alreadyWroteIds, pointer advances past B → next = A.
        // Creator skips A.
        const skipRes = await skipTurnCall(logId, creatorCookie);
        expect(skipRes.status).toBe(200);

        // After A-skip (in-rotation), alreadyWroteIds since A-skip = {} → next = B.
        const resB = await submitTurn(logId, userBCookie, 'B2');
        expect(resB.status).toBe(201);

        // Now it's A's turn
        const resA = await submitTurn(logId, userACookie, 'A2');
        expect(resA.status).toBe(201);
    });

    it('Scenario 6 (Edge Case - Non-Creator Skipping Fails): User A tries to skip', async () => {
        const logId = await createLog('STRUCTURED');

        await submitTurn(logId, userACookie, 'A1');
        await submitTurn(logId, userBCookie, 'B1');

        const skipRes = await skipTurnCall(logId, userACookie);
        expect(skipRes.status).toBe(403);
        expect(skipRes.body.error).toMatch(/Keeper/i);
    });

    it('Scenario 7 (Mid-Round Join): C joins late via OOR, rotation resumes', async () => {
        const logId = await createLog('STRUCTURED');

        await submitTurn(logId, userACookie, 'A1'); // A #1 (in-rotation)
        await submitTurn(logId, userBCookie, 'B1'); // B #2 (OOR)

        // C joins (OOR). Now alreadyWroteIds since A1 = {B, C}.
        const resC = await submitTurn(logId, userCCookie, 'C1 jumps in');
        expect(resC.status).toBe(201);

        // B and C both wrote OOR → pointer advances past both → next = A
        const resA2 = await submitTurn(logId, userACookie, 'A2 rotation turn');
        expect(resA2.status).toBe(201);

        // After A2 (in-rotation): alreadyWroteIds = {} → next = B
        const resB2 = await submitTurn(logId, userBCookie, 'B2 rotation turn');
        expect(resB2.status).toBe(201);

        // Now it's C's turn
        const resC2 = await submitTurn(logId, userCCookie, 'C2 rotation turn');
        expect(resC2.status).toBe(201);

        const writerC = await prisma.writer.findFirst({ where: { logId, sessionToken: global.testTokens.cJoinTok } });
        expect(writerC.joinOrder).toBe(3);
    });

    it('Scenario 8 (Creator Joins Late): Creator creates, A and B play, Creator joins as #3', async () => {
        const logId = await createLog('STRUCTURED');

        await submitTurn(logId, userACookie, 'A1'); // A #1 (in-rotation)
        await submitTurn(logId, userBCookie, 'B1'); // B #2 (OOR)

        // B takes rotation turn  
        await submitTurn(logId, userBCookie, 'B2');
        // A takes rotation turn
        await submitTurn(logId, userACookie, 'A2');

        // Creator joins (OOR)
        const resC = await submitTurn(logId, creatorCookie, 'Creator joins late');
        expect(resC.status).toBe(201);

        const logDetail = await request(app).get(`/api/logs/${logId}`);
        const writers = logDetail.body.writers;
        expect(writers).toHaveLength(3);
        const writerC = await prisma.writer.findFirst({ where: { logId, sessionToken: global.testTokens.cTok } });
        expect(writerC.joinOrder).toBe(3);
    });

    it('Scenario 9 (Rotation after skip): A #1, B #2, C #3. B is skipped, C goes, A goes', async () => {
        const logId = await createLog('STRUCTURED');

        await submitTurn(logId, userACookie, 'A1'); // #1 (in-rotation)
        await submitTurn(logId, userBCookie, 'B1'); // #2 (OOR)
        await submitTurn(logId, userCCookie, 'C1'); // #3 (OOR)

        // B rotation turn, then C rotation turn, then A rotation turn → completes round
        await submitTurn(logId, userBCookie, 'B2');
        await submitTurn(logId, userCCookie, 'C2');
        await submitTurn(logId, userACookie, 'A2');

        // Round 2: B is next. Creator skips B.
        await skipTurnCall(logId, creatorCookie);

        // Now C's turn
        const resC = await submitTurn(logId, userCCookie, 'C3');
        expect(resC.status).toBe(201);

        // Then A
        const resA = await submitTurn(logId, userACookie, 'A3');
        expect(resA.status).toBe(201);
    });

    it('Scenario 10 (Log Completion): turnLimit = 4. A #1, B #2', async () => {
        const logId = await createLog('STRUCTURED', 4); // closes after 4 real turns

        // Turn 1: A1 (in-rotation)
        await submitTurn(logId, userACookie, 'A1');
        // Turn 2: B1 (OOR — pointer advances past B since B just wrote)
        await submitTurn(logId, userBCookie, 'B1');
        // Turn 3: A2 (A is next after pointer advance)
        await submitTurn(logId, userACookie, 'A2');
        // Turn 4: B2 (B's rotation turn) → 4th real turn → COMPLETED
        const finalRes = await submitTurn(logId, userBCookie, 'B2');
        expect(finalRes.status).toBe(201);

        const logDetail = await request(app).get(`/api/logs/${logId}`);
        expect(logDetail.body.status).toBe('COMPLETED');
        expect(logDetail.body.writers).toHaveLength(2);

        // Can't submit after completion
        const failRes = await submitTurn(logId, userCCookie, 'C tries to join late');
        expect(failRes.status).toBe(403);
        expect(failRes.body.error).toMatch(/completed/i);
    });
});
