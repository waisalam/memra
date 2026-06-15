// lib/embeddings.ts
// Provider: Cohere embed-english-light-v3.0
// Dimensions: 384 — matches existing pgvector(384) column, no DB changes needed
// Free tier: 1000 calls/month at dashboard.cohere.com
// Works on Vercel — no network restrictions like HuggingFace

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.COHERE_API_KEY

  if (!apiKey) {
    throw new Error(
      'COHERE_API_KEY is not set. Add it to .env.local and Vercel environment variables.'
    )
  }

  // Cohere has a 96 token minimum context — pad short texts
  const input = text.trim().length < 10 ? text.trim() + ' memory context' : text.trim()

  const res = await fetch('https://api.cohere.com/v1/embed', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Client-Name': 'memra',
    },
    body: JSON.stringify({
      texts: [input],
      model:  'embed-english-v3.0',
      input_type: 'search_document',
      truncate: 'END',
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(
      `Cohere embedding API failed: ${res.status} — ${errorBody}`
    )
  }

  const data = await res.json()
  const embedding = data.embeddings?.[0]

  if (!Array.isArray(embedding)) {
    throw new Error(
      `Unexpected Cohere response shape: ${JSON.stringify(data).slice(0, 300)}`
    )
  }

  if (embedding.length !== 384) {
    throw new Error(
      `Expected 384 dimensions but got ${embedding.length}. Wrong model selected.`
    )
  }

  return embedding as number[]
}