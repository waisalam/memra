// app/api/debug-embedding/route.ts

export async function GET() {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    return Response.json({
      step: 'env_check',
      error: 'HUGGINGFACE_API_KEY is undefined on this deployment',
      hint: 'Env var exists in Vercel settings but deployment does not have it',
      allEnvKeys: Object.keys(process.env)
        .filter(k => 
          k.includes('HUGGING') || 
          k.includes('MEMRA') || 
          k.includes('DATABASE') ||
          k.includes('NEXTAUTH')
        )
    }, { status: 500 })
  }

  // Key exists — now test HuggingFace
  try {
    const res = await fetch(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'hello world test',
          options: { wait_for_model: true }
        })
      }
    )

    const rawText = await res.text()

    let parsed
    try { parsed = JSON.parse(rawText) } catch { parsed = null }

    const embedding = Array.isArray(parsed)
      ? (Array.isArray(parsed[0]) ? parsed[0] : parsed)
      : null

    return Response.json({
      step: 'huggingface_call',
      keyFound: true,
      keyPrefix: apiKey.slice(0, 10) + '...',
      httpStatus: res.status,
      httpOk: res.ok,
      responsePreview: rawText.slice(0, 300),
      embeddingLength: embedding ? embedding.length : 'not an array',
      embeddingWorking: embedding && embedding.length === 384
    })

  } catch (err) {
    return Response.json({
      step: 'huggingface_call',
      keyFound: true,
      keyPrefix: apiKey.slice(0, 10) + '...',
      fetchError: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
}