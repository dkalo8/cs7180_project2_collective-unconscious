/**
 * mock-skip.js
 *
 * Seeds the most recently created STRUCTURED log with 3 mock writers
 * who submit turns via the HTTP API (so they are real participants).
 *
 * Usage: node mock-skip.js
 * Run from the /server directory while the Express server is running on port 3000.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

const BASE_URL = 'http://localhost:3000';

async function postTurn(logId, sessionToken, content, nickname, colorHex) {
    const res = await fetch(`${BASE_URL}/api/logs/${logId}/turns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `sessionToken=${sessionToken}`
        },
        body: JSON.stringify({ content, nickname, colorHex })
    });
    const body = await res.json();
    if (!res.ok) {
        throw new Error(`Turn failed (${res.status}): ${JSON.stringify(body)}`);
    }
    return body;
}

async function run() {
    try {
        console.log('Finding the most recently created STRUCTURED log...');
        const log = await prisma.log.findFirst({
            where: { turnMode: 'STRUCTURED' },
            orderBy: { createdAt: 'desc' },
        });

        if (!log) {
            console.error('No STRUCTURED logs found! Create one at http://localhost:5173/create first.');
            process.exit(1);
        }

        console.log(`Found Log: "${log.title}" (${log.id})`);
        console.log(`Creator Token: ${log.creatorToken}`);

        // Wipe existing writers/turns for a clean demo
        await prisma.turn.deleteMany({ where: { logId: log.id } });
        await prisma.writer.deleteMany({ where: { logId: log.id } });

        const aliceToken = uuidv4();
        const bobToken = uuidv4();
        const charlieToken = uuidv4();

        console.log('\nSubmitting turns via the API...\n');

        // Alice submits → Writer #1 (pink)
        await postTurn(log.id, aliceToken, 'The city woke up before its people did — lights buzzing, trains groaning, coffee machines sighing.', 'Alice', '#E91E63');
        console.log('  ✓ Alice (#1, pink) submitted');

        // Bob submits → Writer #2 (blue) — out-of-rotation join
        await postTurn(log.id, bobToken, 'Somewhere between platform nine and the escalator, a man lost his shoe. He kept walking.', 'Bob', '#2196F3');
        console.log('  ✓ Bob (#2, blue) joined + submitted');

        // Charlie submits → Writer #3 (green) — out-of-rotation join
        await postTurn(log.id, charlieToken, 'The shoe sat there like a philosophical question nobody wanted to answer.', 'Charlie', '#4CAF50');
        console.log('  ✓ Charlie (#3, green) joined + submitted');

        // Alice submits again (it's her turn in rotation: A was last in-rotation, so next is B)
        // Wait — Alice was the only in-rotation turn. So next in rotation after Alice is… Bob (who now exists).
        // Actually Bob and Charlie's first turns were isOutOfRotation. So the last in-rotation turn is Alice's first turn.
        // Next expected = Bob (#2).
        // So let's NOT submit as Alice next. Instead, let Bob go (it's his rotation turn).
        await postTurn(log.id, bobToken, 'A pigeon picked it up. It looked important now.', 'Bob', '#2196F3');
        console.log('  ✓ Bob (#2) submitted (rotation turn)');

        // Now it's Charlie's turn in rotation
        await postTurn(log.id, charlieToken, 'Nobody films pigeons with shoes. That is the tragedy of modern life.', 'Charlie', '#4CAF50');
        console.log('  ✓ Charlie (#3) submitted (rotation turn)');

        // Now it's Alice's turn in rotation
        await postTurn(log.id, aliceToken, 'The man, meanwhile, had reached his office shoeless. His boss said nothing. Some mornings are like that.', 'Alice', '#E91E63');
        console.log('  ✓ Alice (#1) submitted (rotation turn)');

        // Now it's Bob's turn. The Keeper (you) can skip Bob.
        console.log('\n--- DONE ---');
        console.log(`Log ID: ${log.id}`);
        console.log('It is now BOB\'s turn in the rotation. You (the Creator) should see the "Skip Turn" controls.');
        console.log(`Open: http://localhost:5173/logs/${log.id}`);

    } catch (e) {
        console.error('Error:', e.message || e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
