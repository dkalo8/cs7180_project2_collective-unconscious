const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with mock logs...');

  // Create a structured log
  const structuredLog = await prisma.log.create({
    data: {
      title: 'A Story of Four Elements',
      category: 'Poem',
      turnMode: 'STRUCTURED',
      accessMode: 'PUBLIC',
      status: 'COMPLETED',
      perTurnLengthLimit: 200,
      turnLimit: 2,
      writers: {
        create: [
          { sessionToken: 'seed-token-1', nickname: 'Fire', colorHex: '#FF5733', joinOrder: 1 },
          { sessionToken: 'seed-token-2', nickname: 'Water', colorHex: '#3380FF', joinOrder: 2 },
          { sessionToken: 'seed-token-3', nickname: 'Earth', colorHex: '#33FF57', joinOrder: 3 },
          { sessionToken: 'seed-token-4', nickname: 'Air', colorHex: '#D4D0C8', joinOrder: 4 },
        ]
      }
    },
    include: {
      writers: true
    }
  });

  const [w1, w2, w3, w4] = structuredLog.writers;

  await prisma.turn.createMany({
    data: [
      { content: 'Flames rose from the ancient crater.', logId: structuredLog.id, writerId: w1.id, turnOrder: 1, isOutOfRotation: true },
      { content: 'Only to be quenched by a sudden, violent rain.', logId: structuredLog.id, writerId: w2.id, turnOrder: 2, isOutOfRotation: true },
      { content: 'The ground absorbed it all, sprouting green life.', logId: structuredLog.id, writerId: w3.id, turnOrder: 3, isOutOfRotation: true },
      { content: 'And the wind carried the seeds far and wide.', logId: structuredLog.id, writerId: w4.id, turnOrder: 4, isOutOfRotation: true },
      // Round 2
      { content: 'The fires sparked anew in the distant forest.', logId: structuredLog.id, writerId: w1.id, turnOrder: 5, isOutOfRotation: false },
      { content: 'A river diverted its course to stop the spread.', logId: structuredLog.id, writerId: w2.id, turnOrder: 6, isOutOfRotation: false },
      { content: 'Mudslides formed, shifting the very geography.', logId: structuredLog.id, writerId: w3.id, turnOrder: 7, isOutOfRotation: false },
      { content: 'Until a gentle breeze settled the chaotic world.', logId: structuredLog.id, writerId: w4.id, turnOrder: 8, isOutOfRotation: false },
    ]
  });

  // Create a freestyle log
  const freestyleLog = await prisma.log.create({
    data: {
      title: 'Echoes in the Void',
      category: 'Freewriting',
      turnMode: 'FREESTYLE',
      accessMode: 'PUBLIC',
      status: 'ACTIVE',
      perTurnLengthLimit: 300,
      writers: {
        create: [
          { sessionToken: 'seed-token-a', nickname: 'Alice', colorHex: '#800080', joinOrder: 1 },
          { sessionToken: 'seed-token-b', nickname: 'Bob', colorHex: '#FF8C00', joinOrder: 2 }
        ]
      }
    },
    include: {
      writers: true
    }
  });

  const [wa, wb] = freestyleLog.writers;

  await prisma.turn.createMany({
    data: [
      { content: 'Hello... is anyone there?', logId: freestyleLog.id, writerId: wa.id, turnOrder: 1, isOutOfRotation: true },
      { content: 'I can hear you.', logId: freestyleLog.id, writerId: wb.id, turnOrder: 2, isOutOfRotation: true },
      { content: 'Where are we?', logId: freestyleLog.id, writerId: wa.id, turnOrder: 3, isOutOfRotation: false },
    ]
  });

  console.log('Seeding complete. Check the UI!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
