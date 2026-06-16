export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'
import { checkAndIncrementUsage } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'mcp') {
    return Response.json({ error: 'Wrong API key type. Context endpoints require an MCP key (mk_mcp_...). Get one at: https://memra-rho.vercel.app/dashboard/keys', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId, plan } = validated

  try {
    await checkAndIncrementUsage(accountId, plan)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('RATE_LIMIT:')) {
      return Response.json(
        { error: 'Monthly API limit reached', plan, upgradeUrl: 'https://usememra.com/pricing' },
        { status: 429 }
      )
    }
  }

  const body = await req.json()
  const { messages, tool = 'other', title } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: 'messages must be a non-empty array of {role, content} objects' },
      { status: 400 }
    )
  }

  for (const m of messages) {
    if (!m.role || !m.content) {
      return Response.json(
        { error: 'messages must be a non-empty array of {role, content} objects' },
        { status: 400 }
      )
    }
  }

  const tokenCount = Math.round(
    messages.reduce((sum: number, m: { content: string }) => sum + m.content.split(/\s+/).length, 0) * 1.3
  )

  const autoTitle: string =
    title ??
    (messages.find((m: { role: string }) => m.role === 'user')?.content?.slice(0, 60) ?? 'Untitled Session')

  // Free plan session limit
  if (plan === 'free') {
    const count = await prisma.contextSession.count({ where: { userId: accountId } })
    if (count >= 5) {
      return Response.json(
        {
          error: 'Free plan limit: 5 sessions maximum',
          current: count,
          upgradeUrl: 'https://usememra.com/pricing',
        },
        { status: 403 }
      )
    }
  }

  let summary: string | null = null
  let resumePrompt: string | null = null

  if (plan === 'pro' || plan === 'enterprise') {
    try {
      const lastTen = messages.slice(-10)
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          max_tokens: 800,
          messages: [
            {
              role: 'system',
              content: `You are summarizing a developer coding session.
Return ONLY valid JSON, no markdown, no explanation, just JSON:
{
  "summary": "150 word max summary of what was built and decided",
  "resumePrompt": "Complete self-contained prompt a developer pastes at the start of a new AI chat to continue this session. Include: what we were building, current state, key decisions, tech stack, next immediate steps. Make it specific and actionable."
}`,
            },
            {
              role: 'user',
              content: JSON.stringify(lastTen),
            },
          ],
        }),
      })
      if (groqRes.ok) {
        const groqData = await groqRes.json()
        const raw: string = groqData.choices?.[0]?.message?.content ?? ''
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        summary = parsed.summary ?? null
        resumePrompt = parsed.resumePrompt ?? null
      }
    } catch (err) {
      console.error('Groq summarization failed:', err)
    }
  }

  const session = await prisma.contextSession.create({
    data: {
      userId: accountId,
      title: autoTitle,
      tool,
      messages,
      summary,
      resumePrompt,
      tokenCount,
      messageCount: messages.length,
    },
  })

  return Response.json({
    sessionId: session.id,
    title: session.title,
    summary: session.summary,
    resumePrompt: session.resumePrompt,
    messageCount: session.messageCount,
    tokenCount: session.tokenCount,
  })
}
