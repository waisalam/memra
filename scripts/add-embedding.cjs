const { PrismaClient } = require('../generated/prisma')
const { PrismaNeon } = require('@prisma/adapter-neon')

async function run() {
  const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL })
  const prisma = new PrismaClient({ adapter })
  await prisma.$executeRawUnsafe('ALTER TABLE "Memory" ADD COLUMN IF NOT EXISTS embedding vector(384)')
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS mem_embed_idx ON "Memory" USING ivfflat (embedding vector_cosine_ops)')
  console.log('Embedding column + index ready.')
  await prisma.$disconnect()
}

run().catch(e => { console.error(e.message); process.exit(1) })
