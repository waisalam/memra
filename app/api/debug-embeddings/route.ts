// app/api/debug-embedding/route.ts
export async function GET() {
  const apiKey = process.env.HUGGINGFACE_API_KEY!

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout
try {
  const pingRes = await fetch('https://httpbin.org/get')
  console.log('Basic connectivity:', pingRes.status)
} catch (e) {
  console.log('No outbound internet at all:', e)
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
          inputs: 'hello world',
          options: { wait_for_model: true }
        }),
        signal: controller.signal
      }
    )
    clearTimeout(timeout)

    return Response.json({
      httpStatus: res.status,
      ok: res.ok,
      body: await res.text()
    })

  } catch (err) {
    return Response.json({
      fetchError: err instanceof Error ? err.message : String(err),
      errorName: err instanceof Error ? err.name : 'unknown',
      // Test if ANY external fetch works
      hint: 'Testing basic connectivity...'
    }, { status: 500 })
  }
}