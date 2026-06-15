// app/api/debug-embedding/route.ts
// TEMPORARY — delete after confirming embeddings work

export async function GET() {
  const cohereKey = process.env.COHERE_API_KEY
  const huggingfaceKey = process.env.HUGGINGFACE_API_KEY

  // Step 1 — check env
  if (!cohereKey) {
    return Response.json({
      step: 'env_check',
      error: 'COHERE_API_KEY is not set',
      huggingfaceKeyPresent: !!huggingfaceKey,
      hint: 'Add COHERE_API_KEY to Vercel → Settings → Environment Variables'
    }, { status: 500 })
  }

  // Step 2 — test basic outbound fetch first
  try {
    const pingRes = await fetch('https://httpbin.org/get', {
      signal: AbortSignal.timeout(5000)
    })
    if (!pingRes.ok) {
      return Response.json({
        step: 'connectivity_check',
        error: 'Basic outbound fetch failed',
        httpStatus: pingRes.status,
        hint: 'Vercel is blocking ALL outbound network calls from this deployment'
      }, { status: 500 })
    }
  } catch (err) {
    return Response.json({
      step: 'connectivity_check',
      error: 'No outbound internet access at all',
      detail: err instanceof Error ? err.message : String(err),
      hint: 'Check Vercel project Settings → Secure Compute (turn it off)'
    }, { status: 500 })
  }

  // Step 3 — test Cohere specifically
  try {
    const res = await fetch('https://api.cohere.com/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cohereKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: ['hello world test embedding'],
        model: 'embed-english-light-v3.0',
        input_type: 'search_document',
        truncate: 'END',
      }),
      signal: AbortSignal.timeout(15000)
    })

    const rawText = await res.text()
    let parsed: Record<string, unknown> = {}
    try { parsed = JSON.parse(rawText) } catch { parsed = { raw: rawText } }

    const embedding = (parsed.embeddings as number[][])?.[0]

    return Response.json({
      step: 'cohere_call',
      keyFound: true,
      keyPrefix: cohereKey.slice(0, 8) + '...',
      httpStatus: res.status,
      httpOk: res.ok,
      embeddingLength: Array.isArray(embedding) ? embedding.length : 'not an array',
      embeddingWorking: Array.isArray(embedding) && embedding.length === 384,
      first3Values: Array.isArray(embedding) ? embedding.slice(0, 3) : null,
      errorIfAny: res.ok ? null : rawText.slice(0, 300)
    })

  } catch (err) {
    return Response.json({
      step: 'cohere_call',
      keyFound: true,
      keyPrefix: cohereKey.slice(0, 8) + '...',
      fetchError: err instanceof Error ? err.message : String(err),
      hint: 'Cohere API unreachable from Vercel — network issue'
    }, { status: 500 })
  }
}