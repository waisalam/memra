import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

await prisma.$executeRawUnsafe(`ALTER TABLE "Memory" ADD COLUMN IF NOT EXISTS embedding vector(384)`)
await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS memory_embedding_idx ON "Memory" USING ivfflat (embedding vector_cosine_ops)`)
console.log('Embedding column and index ready.')
await prisma.$disconnect()
