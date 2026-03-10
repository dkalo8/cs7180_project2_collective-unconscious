const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Database Schema Validation (Issue #2)', () => {
  beforeAll(async () => {
    // Clear the db before tests
    await prisma.turn.deleteMany();
    await prisma.writer.deleteMany();
    await prisma.log.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should successfully create a Log, Writer, and Turn', async () => {
    // 1. Create a Log
    const log = await prisma.log.create({
      data: {
        title: 'Test Log',
        category: 'Freewriting',
        accessMode: 'OPEN',
        turnMode: 'FREESTYLE',
      },
    });
    expect(log.id).toBeDefined();
    expect(log.title).toBe('Test Log');

    // 2. Create a Writer
    const writer = await prisma.writer.create({
      data: {
        sessionToken: 'test-session-token',
        nickname: 'Test User',
        colorHex: '#000000',
        logId: log.id,
        joinOrder: 1,
      },
    });
    expect(writer.id).toBeDefined();
    expect(writer.sessionToken).toBe('test-session-token');

    // 3. Create a Turn
    const turn = await prisma.turn.create({
      data: {
        content: 'This is a test turn.',
        turnOrder: 1,
        logId: log.id,
        writerId: writer.id,
      },
    });
    expect(turn.id).toBeDefined();
    expect(turn.content).toBe('This is a test turn.');

    // 4. Verify relations
    const fetchedLog = await prisma.log.findUnique({
      where: { id: log.id },
      include: { writers: true, turns: true },
    });
    expect(fetchedLog.writers.length).toBe(1);
    expect(fetchedLog.turns.length).toBe(1);
    expect(fetchedLog.turns[0].content).toBe('This is a test turn.');
    
    // Cleanup afterwards so we don't mess up dev DB too much
    await prisma.turn.deleteMany();
    await prisma.writer.deleteMany();
    await prisma.log.deleteMany();
  });
});
