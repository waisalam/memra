export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const start = Date.now()
  const { userMessage, context = [], history = [] } = await req.json()

  if (!userMessage) {
    return Response.json({ error: 'userMessage is required' }, { status: 400 })
  }

  const systemPrompt = `You are a helpful AI assistant with memory.
${
  context.length > 0
    ? `Here is relevant context from past conversations:\n${context
        .map((m: { role: string; content: string }) => `- ${m.role}: ${m.content}`)
        .join('\n')}\nUse this to personalize your response.`
    : 'No previous context available.'
}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-5),
    { role: 'user', content: userMessage },
  ]

  // PRIMARY: Groq
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!groqRes.ok) throw new Error(`Groq error: ${groqRes.status}`)

    const groqData = await groqRes.json()
    const reply = groqData.choices[0]?.message?.content
    if (!reply) throw new Error('Empty response from Groq')

    return Response.json({ reply, provider: 'groq', latencyMs: Date.now() - start })
  } catch (groqError) {
    console.log('Groq failed, falling back to OpenRouter:', groqError)

    // FALLBACK: OpenRouter
    try {
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
          'X-Title': 'Memra',
        },
        body: JSON.stringify({
          model: 'nex-agi/nex-n2-pro:free',
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      })

      if (!orRes.ok) throw new Error(`OpenRouter error: ${orRes.status}`)

      const orData = await orRes.json()
      const reply = orData.choices[0]?.message?.content
      if (!reply) throw new Error('Empty response from OpenRouter')

      return Response.json({ reply, provider: 'openrouter', latencyMs: Date.now() - start })
    } catch (orError) {
      console.error('Both providers failed:', orError)
      return Response.json(
        { error: 'AI service temporarily unavailable', fallbackUsed: true, retryAfter: 30 },
        { status: 503 }
      )
    }
  }
}
