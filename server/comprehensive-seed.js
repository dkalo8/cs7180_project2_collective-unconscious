/**
 * Comprehensive seed for frontend testing.
 *
 * HOW TO USE:
 *   node server/comprehensive-seed.js
 *
 * SESSION TOKEN CHEAT SHEET (set cookie "sessionToken" in DevTools → Application → Cookies):
 *   "my-creator-token"   → you ARE the Keeper of logs marked with [CREATOR]
 *   "my-writer-token"    → you are a participant (Writer A) in multi-writer logs
 *   "my-solo-token"      → you are the only writer in the solo log
 *   anything else        → you are a newcomer (can join open/active logs)
 *
 * SCENARIO COVERAGE:
 *   1.  Completed STRUCTURED log — 3 writers, all turns done, reaction icons
 *   2.  Active FREESTYLE — 3 writers, mid-story, last turn by writer-C → writer-A & B can write
 *   3.  Active STRUCTURED — 3 writers, rotation in progress, it's writer-B's turn
 *   4.  Solo log — 1 writer joined, no more turns (shows "waiting for next one to write")
 *   5.  Brand new log — 0 writers, 0 turns (shows "Waiting for the first writer...")
 *   6.  PRIVATE log — active, has access code printed to console
 *   7.  Log with turn limit — STRUCTURED, turnLimit=6, 5 turns done (1 left)
 *   8.  Log with participant limit — FREESTYLE, participantLimit=2, both slots filled
 *   9.  STRUCTURED log with a skip — skip turn visible in DB but hidden from UI
 *  10.  [CREATOR] Active FREESTYLE — creatorToken = "my-creator-token" → Close Log button
 *  11.  [CREATOR] Active STRUCTURED — creatorToken = "my-creator-token", writer-A = "my-creator-token"
 *  12.  Completed log as creator — Close Log button must NOT appear
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CREATOR_TOKEN = 'my-creator-token';
const WRITER_TOKEN  = 'my-writer-token';
const SOLO_TOKEN    = 'my-solo-token';

async function main() {
    console.log('Wiping existing data...');
    await prisma.turn.deleteMany();
    await prisma.writer.deleteMany();
    await prisma.log.deleteMany();

    // ─────────────────────────────────────────────────────────────
    // 1. Completed STRUCTURED Haiku — 3 writers, all done
    // ─────────────────────────────────────────────────────────────
    const log1 = await prisma.log.create({
        data: {
            title: '[1] COMPLETED STRUCTURED — Dawn on the Platform',
            category: 'Haiku',
            accessMode: 'OPEN',
            turnMode: 'STRUCTURED',
            participantLimit: 3,
            turnLimit: 3,
            seed: 'Write a haiku about the morning commute.',
            status: 'COMPLETED',
            creatorToken: 'seed-creator-1',
            writers: {
                create: [
                    { sessionToken: 'seed-s1', nickname: 'Sleepy Fox',    colorHex: '#E53935', joinOrder: 1 },
                    { sessionToken: 'seed-s2', nickname: 'Jittery Owl',   colorHex: '#1E88E5', joinOrder: 2 },
                    { sessionToken: 'seed-s3', nickname: 'Observant Cat', colorHex: '#43A047', joinOrder: 3 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l1w1, l1w2, l1w3] = log1.writers;
    await prisma.turn.createMany({ data: [
        { content: 'Cold wind sweeps the track,',          logId: log1.id, writerId: l1w1.id, turnOrder: 1 },
        { content: 'Coffee warms my numb fingers,',        logId: log1.id, writerId: l1w2.id, turnOrder: 2 },
        { content: 'Train arrives at last.',               logId: log1.id, writerId: l1w3.id, turnOrder: 3 },
    ]});
    console.log(`✓ [1] Completed STRUCTURED Haiku: "${log1.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 2. Active FREESTYLE — 3 writers, last turn by writer-C
    //    → "my-writer-token" is writer-A, so it IS their turn
    // ─────────────────────────────────────────────────────────────
    const log2 = await prisma.log.create({
        data: {
            title: '[2] ACTIVE FREESTYLE (my-writer-token) — The Clockwork City',
            category: 'Short Novel',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
            perTurnLengthLimit: 300,
            seed: 'A city where the gears never stop turning — until today.',
            status: 'ACTIVE',
            creatorToken: 'seed-creator-2',
            writers: {
                create: [
                    { sessionToken: WRITER_TOKEN,  nickname: 'Rustic Gear',   colorHex: '#FF8C00', joinOrder: 1 },
                    { sessionToken: 'seed-s5',     nickname: 'Silent Spring',  colorHex: '#800080', joinOrder: 2 },
                    { sessionToken: 'seed-s6',     nickname: 'Iron Sparrow',   colorHex: '#00ACC1', joinOrder: 3 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l2w1, l2w2, l2w3] = log2.writers;
    await prisma.turn.createMany({ data: [
        { content: 'Elias woke to a sound he had never heard before: silence.', logId: log2.id, writerId: l2w1.id, turnOrder: 1, isOutOfRotation: true },
        { content: 'Down below, the massive copper pendulums of Market Square hung frozen mid-swing.', logId: log2.id, writerId: l2w2.id, turnOrder: 2, isOutOfRotation: true },
        { content: 'A child poked one of the pendulums. It swayed, then stopped again — as if the city itself refused to continue.', logId: log2.id, writerId: l2w3.id, turnOrder: 3, isOutOfRotation: false },
    ]});
    console.log(`✓ [2] Active FREESTYLE 3 writers (last turn by Iron Sparrow): "${log2.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 3. Active STRUCTURED — 3 writers, it's writer-B's turn
    //    → "my-writer-token" is writer-A (NOT their turn)
    // ─────────────────────────────────────────────────────────────
    const log3 = await prisma.log.create({
        data: {
            title: '[3] ACTIVE STRUCTURED (my-writer-token) — Voices in the Rain',
            category: 'Poem',
            accessMode: 'OPEN',
            turnMode: 'STRUCTURED',
            perTurnLengthLimit: 200,
            status: 'ACTIVE',
            creatorToken: 'seed-creator-3',
            writers: {
                create: [
                    { sessionToken: WRITER_TOKEN, nickname: 'Morning Mist',  colorHex: '#5E35B1', joinOrder: 1 },
                    { sessionToken: 'seed-s8',    nickname: 'Dusk Heron',    colorHex: '#D81B60', joinOrder: 2 },
                    { sessionToken: 'seed-s9',    nickname: 'Quiet Thunder', colorHex: '#6D4C41', joinOrder: 3 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l3w1, l3w2, l3w3] = log3.writers;
    await prisma.turn.createMany({ data: [
        { content: 'Rain taps the window,',       logId: log3.id, writerId: l3w1.id, turnOrder: 1, isOutOfRotation: true },
        { content: 'Leaves curl like sleeping hands,', logId: log3.id, writerId: l3w2.id, turnOrder: 2, isOutOfRotation: true },
        { content: 'Earth breathes out at last.',  logId: log3.id, writerId: l3w3.id, turnOrder: 3, isOutOfRotation: true },
        // Round 2 — writer-A went, now it's writer-B's turn
        { content: 'A streetlamp flickers twice,', logId: log3.id, writerId: l3w1.id, turnOrder: 4, isOutOfRotation: false },
    ]});
    console.log(`✓ [3] Active STRUCTURED (next: Dusk Heron / writer-B): "${log3.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 4. Solo log — 1 writer, no one else joined
    //    → shows "Waiting for the next one to write..."
    // ─────────────────────────────────────────────────────────────
    const log4 = await prisma.log.create({
        data: {
            title: '[4] ACTIVE FREESTYLE (my-solo-token) — Alone at the Edge of Things',
            category: 'Freewriting',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
            status: 'ACTIVE',
            creatorToken: SOLO_TOKEN,
            writers: {
                create: [
                    { sessionToken: SOLO_TOKEN, nickname: 'Lone Wolf', colorHex: '#78909C', joinOrder: 1 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l4w1] = log4.writers;
    await prisma.turn.createMany({ data: [
        { content: 'I started writing and waited. Nobody came.', logId: log4.id, writerId: l4w1.id, turnOrder: 1, isOutOfRotation: true },
    ]});
    console.log(`✓ [4] Solo log (1 writer, shows "waiting for next one"): "${log4.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 5. Brand new log — 0 writers, 0 turns
    //    → shows "Waiting for the first writer..."
    // ─────────────────────────────────────────────────────────────
    const log5 = await prisma.log.create({
        data: {
            title: '[5] BRAND NEW — 0 writers 0 turns — An Empty Stage',
            category: 'Freewriting',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
            seed: 'Begin wherever the silence takes you.',
            status: 'ACTIVE',
            creatorToken: 'seed-creator-5',
        },
    });
    console.log(`✓ [5] Brand new log (0 writers, 0 turns): "${log5.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 6. PRIVATE log — access code printed to console
    // ─────────────────────────────────────────────────────────────
    const accessCode = 'ABC123';
    const log6 = await prisma.log.create({
        data: {
            title: '[6] PRIVATE FREESTYLE — Secret Society Minutes',
            category: 'Freewriting',
            accessMode: 'PRIVATE',
            turnMode: 'FREESTYLE',
            accessCode,
            status: 'ACTIVE',
            creatorToken: 'seed-creator-6',
            writers: {
                create: [
                    { sessionToken: 'seed-s12', nickname: 'Veiled Scribe',  colorHex: '#37474F', joinOrder: 1 },
                    { sessionToken: 'seed-s13', nickname: 'Masked Witness', colorHex: '#BF360C', joinOrder: 2 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l6w1, l6w2] = log6.writers;
    await prisma.turn.createMany({ data: [
        { content: 'The meeting began at midnight, as always.', logId: log6.id, writerId: l6w1.id, turnOrder: 1, isOutOfRotation: true },
        { content: 'The chair noted that two members had not returned from the previous expedition.', logId: log6.id, writerId: l6w2.id, turnOrder: 2, isOutOfRotation: true },
    ]});
    console.log(`✓ [6] PRIVATE log (access code: ${accessCode}): "${log6.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 7. Log with turn limit — STRUCTURED, turnLimit=6, 5 done
    //    → 1 turn remaining before auto-close
    // ─────────────────────────────────────────────────────────────
    const log7 = await prisma.log.create({
        data: {
            title: '[7] STRUCTURED turnLimit=6 (5/6 done) — Last Verse Standing',
            category: 'Poem',
            accessMode: 'OPEN',
            turnMode: 'STRUCTURED',
            turnLimit: 6,
            status: 'ACTIVE',
            creatorToken: 'seed-creator-7',
            writers: {
                create: [
                    { sessionToken: 'seed-s14', nickname: 'Red Pen',   colorHex: '#E53935', joinOrder: 1 },
                    { sessionToken: 'seed-s15', nickname: 'Blue Ink',  colorHex: '#1E88E5', joinOrder: 2 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l7w1, l7w2] = log7.writers;
    await prisma.turn.createMany({ data: [
        { content: 'In the beginning there was a word,',     logId: log7.id, writerId: l7w1.id, turnOrder: 1, isOutOfRotation: true },
        { content: 'and the word was borrowed.',              logId: log7.id, writerId: l7w2.id, turnOrder: 2, isOutOfRotation: true },
        { content: 'It passed from mouth to mouth,',         logId: log7.id, writerId: l7w1.id, turnOrder: 3, isOutOfRotation: false },
        { content: 'growing heavier each time.',             logId: log7.id, writerId: l7w2.id, turnOrder: 4, isOutOfRotation: false },
        { content: 'Until no one could carry it anymore,',   logId: log7.id, writerId: l7w1.id, turnOrder: 5, isOutOfRotation: false },
    ]});
    console.log(`✓ [7] STRUCTURED with turnLimit=6, 5/6 turns done: "${log7.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 8. Participant limit — participantLimit=2, both slots filled
    //    → newcomer cannot join (isMyTurn=false)
    // ─────────────────────────────────────────────────────────────
    const log8 = await prisma.log.create({
        data: {
            title: '[8] FREESTYLE participantLimit=2 (full) — Table for Two',
            category: 'Freewriting',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
            participantLimit: 2,
            status: 'ACTIVE',
            creatorToken: 'seed-creator-8',
            writers: {
                create: [
                    { sessionToken: 'seed-s16', nickname: 'Left Chair',  colorHex: '#00897B', joinOrder: 1 },
                    { sessionToken: 'seed-s17', nickname: 'Right Chair', colorHex: '#F4511E', joinOrder: 2 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l8w1, l8w2] = log8.writers;
    await prisma.turn.createMany({ data: [
        { content: 'Two strangers sat across from each other and said nothing for a long time.', logId: log8.id, writerId: l8w1.id, turnOrder: 1, isOutOfRotation: true },
        { content: '"Nice weather," she said finally, looking at the rain.', logId: log8.id, writerId: l8w2.id, turnOrder: 2, isOutOfRotation: true },
        { content: '"Is it?" he replied, not looking up.', logId: log8.id, writerId: l8w1.id, turnOrder: 3, isOutOfRotation: false },
    ]});
    console.log(`✓ [8] Full participant limit (2/2, newcomer locked out): "${log8.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 9. STRUCTURED log with a skip — skip is invisible in UI
    // ─────────────────────────────────────────────────────────────
    const log9 = await prisma.log.create({
        data: {
            title: '[9] STRUCTURED with skip turn — The Gap in the Story',
            category: 'Short Novel',
            accessMode: 'OPEN',
            turnMode: 'STRUCTURED',
            status: 'ACTIVE',
            creatorToken: 'seed-creator-9',
            writers: {
                create: [
                    { sessionToken: 'seed-s18', nickname: 'Chapter One', colorHex: '#6A1B9A', joinOrder: 1 },
                    { sessionToken: 'seed-s19', nickname: 'Chapter Two', colorHex: '#AD1457', joinOrder: 2 },
                    { sessionToken: 'seed-s20', nickname: 'Epilogue',    colorHex: '#2E7D32', joinOrder: 3 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l9w1, l9w2, l9w3] = log9.writers;
    await prisma.turn.createMany({ data: [
        { content: 'The detective entered the room and immediately knew something was wrong.',    logId: log9.id, writerId: l9w1.id, turnOrder: 1, isOutOfRotation: true },
        { content: 'The window was open, but it had been locked from the inside.',               logId: log9.id, writerId: l9w2.id, turnOrder: 2, isOutOfRotation: true },
        { content: 'A skip — Chapter Two missed their turn.',                                    logId: log9.id, writerId: l9w2.id, turnOrder: 3, isSkip: true,  isOutOfRotation: false },
        { content: '"Someone was here," he muttered, "and they left through time."',             logId: log9.id, writerId: l9w3.id, turnOrder: 4, isOutOfRotation: false },
    ]});
    console.log(`✓ [9] STRUCTURED with a skip turn (hidden in UI): "${log9.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 10. [CREATOR] Active FREESTYLE — you are the Keeper
    //     Set cookie sessionToken = "my-creator-token"
    //     → Close Log button appears, Write Zone active
    // ─────────────────────────────────────────────────────────────
    const log10 = await prisma.log.create({
        data: {
            title: '[10] CREATOR ACTIVE FREESTYLE (my-creator-token) — Close Log visible',
            category: 'Freewriting',
            accessMode: 'OPEN',
            turnMode: 'FREESTYLE',
            status: 'ACTIVE',
            creatorToken: CREATOR_TOKEN,
            writers: {
                create: [
                    { sessionToken: CREATOR_TOKEN, nickname: 'Keeper',        colorHex: '#FF0000', joinOrder: 1 },
                    { sessionToken: 'seed-s21',    nickname: 'Other Writer',  colorHex: '#0000FF', joinOrder: 2 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l10w1, l10w2] = log10.writers;
    await prisma.turn.createMany({ data: [
        { content: 'The Keeper opened the log and began.', logId: log10.id, writerId: l10w1.id, turnOrder: 1, isOutOfRotation: true },
        { content: 'The other writer joined and added a line.', logId: log10.id, writerId: l10w2.id, turnOrder: 2, isOutOfRotation: true },
    ]});
    console.log(`✓ [10] [CREATOR] Active FREESTYLE (token: ${CREATOR_TOKEN}): "${log10.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 11. [CREATOR] Active STRUCTURED — you are the Keeper & writer-1
    //     Set cookie sessionToken = "my-creator-token"
    //     → Close Log button + Skip button both visible
    // ─────────────────────────────────────────────────────────────
    const log11 = await prisma.log.create({
        data: {
            title: '[11] CREATOR ACTIVE STRUCTURED (my-creator-token) — Skip + Close Log visible',
            category: 'Poem',
            accessMode: 'OPEN',
            turnMode: 'STRUCTURED',
            status: 'ACTIVE',
            creatorToken: CREATOR_TOKEN,
            writers: {
                create: [
                    { sessionToken: CREATOR_TOKEN, nickname: 'Keeper',   colorHex: '#FF0000', joinOrder: 1 },
                    { sessionToken: 'seed-s22',    nickname: 'Guest A',  colorHex: '#009688', joinOrder: 2 },
                    { sessionToken: 'seed-s23',    nickname: 'Guest B',  colorHex: '#FF9800', joinOrder: 3 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l11w1, l11w2, l11w3] = log11.writers;
    await prisma.turn.createMany({ data: [
        { content: 'The keeper planted a seed beneath the frost.', logId: log11.id, writerId: l11w1.id, turnOrder: 1, isOutOfRotation: true },
        { content: 'Guest A watched the clouds.',                   logId: log11.id, writerId: l11w2.id, turnOrder: 2, isOutOfRotation: true },
        { content: 'Guest B heard a distant bell.',                 logId: log11.id, writerId: l11w3.id, turnOrder: 3, isOutOfRotation: true },
        // Round 2 — Keeper wrote again, now it's Guest A's turn
        { content: 'The keeper knelt and listened to the soil.',    logId: log11.id, writerId: l11w1.id, turnOrder: 4, isOutOfRotation: false },
    ]});
    console.log(`✓ [11] [CREATOR] Active STRUCTURED (Skip + Close Log, token: ${CREATOR_TOKEN}): "${log11.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 12. Completed log as creator — Close Log button must NOT appear
    // ─────────────────────────────────────────────────────────────
    const log12 = await prisma.log.create({
        data: {
            title: '[12] CREATOR COMPLETED (my-creator-token) — No Close Log button',
            category: 'Haiku',
            accessMode: 'OPEN',
            turnMode: 'STRUCTURED',
            turnLimit: 2,
            status: 'COMPLETED',
            creatorToken: CREATOR_TOKEN,
            writers: {
                create: [
                    { sessionToken: CREATOR_TOKEN, nickname: 'Keeper', colorHex: '#FF0000', joinOrder: 1 },
                    { sessionToken: 'seed-s24',    nickname: 'Ender',  colorHex: '#607D8B', joinOrder: 2 },
                ],
            },
        },
        include: { writers: true },
    });
    const [l12w1, l12w2] = log12.writers;
    await prisma.turn.createMany({ data: [
        { content: 'All good things must end —', logId: log12.id, writerId: l12w1.id, turnOrder: 1 },
        { content: 'even the sky knows when to stop.', logId: log12.id, writerId: l12w2.id, turnOrder: 2 },
    ]});
    console.log(`✓ [12] Completed log as creator (no Close Log button, token: ${CREATOR_TOKEN}): "${log12.title}"`);

    console.log('\n=== SEED COMPLETE ===');
    console.log('\nSession tokens to test with (set in DevTools → Application → Cookies → sessionToken):');
    console.log(`  ${CREATOR_TOKEN.padEnd(25)} → Keeper of logs [10], [11], [12]`);
    console.log(`  ${WRITER_TOKEN.padEnd(25)} → Writer-A in logs [2] and [3]`);
    console.log(`  ${SOLO_TOKEN.padEnd(25)} → Solo writer in log [4]`);
    console.log('  (any other value)          → newcomer who can join open active logs');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
