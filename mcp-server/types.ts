export interface MemraConfig {
  apiKey: string
  baseUrl: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ContextSession {
  id: string
  title: string
  tool: string
  summary?: string | null
  resumePrompt?: string | null
  messageCount: number
  tokenCount: number
  createdAt: string
}

export interface SaveContextResult {
  sessionId: string
  title: string
  summary: string | null
  resumePrompt: string | null
  messageCount: number
  tokenCount: number
}

export interface ResumeResult {
  sessionId: string
  title: string
  tool: string
  resumePrompt: string
  summary: string
  messageCount: number
  lastFiveMessages: Message[]
}

export interface Memory {
  id: string
  content: string
  role: string
  createdAt: string
  similarity?: number
}
