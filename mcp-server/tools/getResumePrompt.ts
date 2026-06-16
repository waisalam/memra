export const resumeTool = {
  name: 'memra_resume',
  description: `Load a previous session's resume prompt to continue where you left off.

WHEN TO CALL THIS:
- At the start of a new chat session
- User says "load last session", "resume", "continue from before"
- User says "what were we working on?"

Returns the resume prompt — paste it or use it as context.
Requires Memra Pro plan.`,
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description:
          'Specific session ID to resume (optional — loads most recent if not provided)',
      },
    },
  },
}

export async function handleResume(
  args: Record<string, unknown>,
  api: typeof import('../api')
): Promise<string> {
  const sessionId = args.sessionId as string | undefined
  const result = await api.getResumePrompt(sessionId)

  return `🚀 Resume Prompt for: ${result.title}

Tool: ${result.tool} · ${result.messageCount} messages

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${result.resumePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary: ${result.summary}

Last messages:
${result.lastFiveMessages.map((m) => `[${m.role}]: ${m.content.slice(0, 100)}`).join('\n')}`
}
