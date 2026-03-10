import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with initial data...')

  // Clean up existing data first
  await prisma.turn.deleteMany()
  await prisma.writer.deleteMany()
  await prisma.log.deleteMany()

  // 1. Create a structured Haiku log
  const logHaiku = await prisma.log.create({
    data: {
      title: 'Dawn on the Platform',
      category: 'Haiku',
      accessMode: 'OPEN',
      turnMode: 'STRUCTURED',
      participantLimit: 3,
      roundLimit: 1, // One round of 3 turns completes the haiku
      seed: 'Write a haiku about the morning commute.',
      status: 'COMPLETED',
    },
  })

  const writerHaiku1 = await prisma.writer.create({
    data: {
      sessionToken: 'seed-session-1',
      nickname: 'Sleepy Fox',
      colorHex: '#FF0000', // Red
      logId: logHaiku.id,
      joinOrder: 1,
    },
  })

  const writerHaiku2 = await prisma.writer.create({
    data: {
      sessionToken: 'seed-session-2',
      nickname: 'Jittery Owl',
      colorHex: '#0000FF', // Blue
      logId: logHaiku.id,
      joinOrder: 2,
    },
  })

  const writerHaiku3 = await prisma.writer.create({
    data: {
      sessionToken: 'seed-session-3',
      nickname: 'Observant Cat',
      colorHex: '#008000', // Green
      logId: logHaiku.id,
      joinOrder: 3,
    },
  })

  // Turns for Haiku log
  await prisma.turn.create({
    data: {
      content: 'Cold wind sweeps the track,\n',
      turnOrder: 1,
      logId: logHaiku.id,
      writerId: writerHaiku1.id,
    },
  })

  await prisma.turn.create({
    data: {
      content: 'Coffee warms my numb fingers,\n',
      turnOrder: 2,
      logId: logHaiku.id,
      writerId: writerHaiku2.id,
    },
  })

  await prisma.turn.create({
    data: {
      content: 'Train arrives at last.',
      turnOrder: 3,
      logId: logHaiku.id,
      writerId: writerHaiku3.id,
    },
  })

  // 2. Create an active Freestyle Short Novel log
  const logNovel = await prisma.log.create({
    data: {
      title: 'The Clockwork City',
      category: 'Short Novel',
      accessMode: 'OPEN',
      turnMode: 'FREESTYLE',
      perTurnLengthLimit: 300,
      seed: 'A city where the gears never stop turning, until today.',
      status: 'ACTIVE',
    },
  })

  const writerNovel1 = await prisma.writer.create({
    data: {
      sessionToken: 'seed-session-4',
      nickname: 'Rustic Gear',
      colorHex: '#FF8C00', // Orange 
      logId: logNovel.id,
      joinOrder: 1,
    },
  })

  const writerNovel2 = await prisma.writer.create({
    data: {
      sessionToken: 'seed-session-5',
      nickname: 'Silent Spring',
      colorHex: '#800080', // Purple
      logId: logNovel.id,
      joinOrder: 2,
    },
  })

  // Turns for Freestyle log
  await prisma.turn.create({
    data: {
      content: 'Elias woke to a sound he had never heard before: silence. For all his thirty years, the background hum of the great brass cogs had been his lullaby. Today, the world was still. ',
      turnOrder: 1,
      logId: logNovel.id,
      writerId: writerNovel1.id,
    },
  })

  await prisma.turn.create({
    data: {
      content: 'He stepped to the window of his tiny flat. Down below, the massive copper pendulums of Market Square hung frozen mid-swing. The usual steam vents were quiet. It was as if time itself had struck a bargain with the city, and won. ',
      turnOrder: 2,
      logId: logNovel.id,
      writerId: writerNovel2.id,
    },
  })
  
  console.log('Seed data inserted successfully:')
  console.log(`- 1 Completed Haiku Log ("${logHaiku.title}")`)
  console.log(`- 1 Active Short Novel Log ("${logNovel.title}")`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
