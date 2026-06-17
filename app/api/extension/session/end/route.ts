export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

function logCall(accountId: string, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/extension/session/end', method: 'POST', statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog extension/session/end]', e)
    }
  })()
}

export async function POST(req: NextRequest) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'extension') {
    return Response.json({ error: 'Wrong API key type. Extension endpoints require an Extension key (mk_ext_...).', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId, plan } = validated

  const body = await req.json()
  const { sessionId } = body

  if (!sessionId) {
    logCall(accountId, 400, Date.now() - start)
    return Response.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const session = await prisma.extensionSession.findUnique({
    where: { id: sessionId },
    include: { extensionMessages: { orderBy: { savedAt: 'desc' }, take: 20 } },
  })

  if (!session || session.accountId !== accountId) {
    logCall(accountId, 404, Date.now() - start)
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  let summary: string | null = null
  let resumePrompt: string | null = null

  if (plan === 'pro' || plan === 'enterprise') {
    try {
      const lastMessages = session.extensionMessages
        .reverse()
        .map((m) => ({ role: m.role, content: m.content.slice(0, 300) }))

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
              content: `You are summarizing a developer coding session from a VS Code AI extension.
Return ONLY valid JSON, no markdown, no explanation, just JSON:
{
  "summary": "150 word max summary of what was built and decided",
  "resumePrompt": "Complete self-contained prompt a developer pastes at the start of a new AI chat to continue this session. Include: what we were building, current state, key decisions, tech stack, next immediate steps. Make it specific and actionable."
}`,
            },
            {
              role: 'user',
              content: JSON.stringify(lastMessages),
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
      console.error('Groq summarization failed for extension session:', err)
    }
  }

  await prisma.extensionSession.update({
    where: { id: sessionId },
    data: {
      isActive: false,
      summary,
      resumePrompt,
    },
  })

  logCall(accountId, 200, Date.now() - start)
  return Response.json({
    success: true,
    summary,
    resumePrompt,
  })
}
