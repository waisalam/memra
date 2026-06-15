// lib/embeddings.ts
// Replaced @xenova/transformers (breaks on Vercel — model too large for serverless)
// Now uses HuggingFace Inference API with the SAME model (all-MiniLM-L6-v2)
// Same 384 dimensions — no database changes needed

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not set in environment variables')
  }

  const res = await fetch(
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true }
      })
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`HuggingFace embedding API failed: ${res.status} — ${errorText}`)
  }

  const data = await res.json()

  // HuggingFace sometimes returns a nested array — flatten it
  const embedding: number[] = Array.isArray(data[0]) ? data[0] : data

  if (!Array.isArray(embedding)) {
    throw new Error(`Unexpected embedding response shape: ${JSON.stringify(data).slice(0, 200)}`)
  }

  if (embedding.length !== 384) {
    throw new Error(`Expected 384 dimensions, got ${embedding.length}`)
  }

  return embedding
}