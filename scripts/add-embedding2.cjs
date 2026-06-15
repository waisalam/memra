const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DIRECT_URL)

async function run() {
  await sql`ALTER TABLE "Memory" ADD COLUMN IF NOT EXISTS embedding vector(384)`
  await sql`CREATE INDEX IF NOT EXISTS mem_embed_idx ON "Memory" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`
  console.log('Embedding column + index ready.')
}

run().catch(e => { console.error(e.message); process.exit(1) })
