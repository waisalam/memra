import { config } from './config'
import type { SaveContextResult, ResumeResult, ContextSession, Memory, Message } from './types'

const headers = () => ({
  'Content-Type': 'application/json',
  'x-api-key': config.apiKey,
})

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>
  let msg = res.statusText
  let code: string | undefined
  try {
    const body = await res.json() as { error?: string; code?: string }
    msg = body.error ?? msg
    code = body.code
  } catch {}
  if (res.status === 403) {
    if (code === 'WRONG_KEY_TYPE') throw new Error('KEY_TYPE_ERROR:' + msg)
    throw new Error('PLAN_LIMIT:' + msg)
  }
  if (res.status === 402) throw new Error('PLAN_LIMIT:' + msg)
  if (res.status === 429) throw new Error('RATE_LIMIT:' + msg)
  if (res.status === 404) throw new Error('NOT_FOUND:' + msg)
  if (res.status >= 500) throw new Error('SERVER_ERROR:' + msg)
  throw new Error('API_ERROR:' + res.status + ' ' + msg)
}

export async function saveContext(
  messages: Message[],
  tool: string,
  title?: string
): Promise<SaveContextResult> {
  try {
    const res = await fetch(`${config.baseUrl}/context/save`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ messages, tool, title }),
    })
    return handleResponse<SaveContextResult>(res)
  } catch (err) {
    if (err instanceof Error && err.message.includes(':')) throw err
    throw new Error('NETWORK_ERROR:Cannot reach Memra API')
  }
}

export async function getResumePrompt(sessionId?: string): Promise<ResumeResult> {
  try {
    const res = await fetch(`${config.baseUrl}/context/resume`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ sessionId }),
    })
    return handleResponse<ResumeResult>(res)
  } catch (err) {
    if (err instanceof Error && err.message.includes(':')) throw err
    throw new Error('NETWORK_ERROR:Cannot reach Memra API')
  }
}

export async function listSessions(
  limit: number = 10
): Promise<{ sessions: ContextSession[]; count: number }> {
  try {
    const res = await fetch(`${config.baseUrl}/context/list?limit=${limit}`, {
      headers: headers(),
    })
    return handleResponse(res)
  } catch (err) {
    if (err instanceof Error && err.message.includes(':')) throw err
    throw new Error('NETWORK_ERROR:Cannot reach Memra API')
  }
}

export async function saveMemory(
  userId: string,
  userMessage: string,
  aiReply: string,
  agentId?: string
): Promise<{ success: boolean; saved: number }> {
  try {
    const res = await fetch(`${config.baseUrl}/memory/save`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ userId, userMessage, aiReply, agentId }),
    })
    return handleResponse(res)
  } catch (err) {
    if (err instanceof Error && err.message.includes(':')) throw err
    throw new Error('NETWORK_ERROR:Cannot reach Memra API')
  }
}

export async function getMemory(
  userId: string,
  query: string,
  agentId?: string,
  limit?: number
): Promise<{ context: Memory[]; count: number; latencyMs: number }> {
  try {
    const params = new URLSearchParams({
      userId,
      query,
      ...(agentId ? { agentId } : {}),
      limit: String(limit ?? 5),
    })
    const res = await fetch(`${config.baseUrl}/memory/context?${params}`, {
      headers: headers(),
    })
    return handleResponse(res)
  } catch (err) {
    if (err instanceof Error && err.message.includes(':')) throw err
    throw new Error('NETWORK_ERROR:Cannot reach Memra API')
  }
}
