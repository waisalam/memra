export const saveContextTool = {
  name: 'memra_save_context',
  description: `Save the current AI conversation to Memra before the context window fills up.

WHEN TO CALL THIS:
- Context window is getting full (you feel memory pressure)
- User says "save our session", "save context", "save this"
- About to hit token limits
- Switching to a new chat

WHAT HAPPENS:
- Free plan: saves messages, no summary (5 sessions max)
- Pro plan: saves + generates AI summary + resume prompt
- Resume prompt is what you paste in the next chat

Get API key (MCP tab): https://memra-rho.vercel.app/dashboard/keys`,
  inputSchema: {
    type: 'object',
    properties: {
      messages: {
        type: 'array',
        description: 'Array of conversation messages to save',
        items: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Who sent the message',
            },
            content: {
              type: 'string',
              description: 'The message content',
            },
          },
          required: ['role', 'content'],
        },
      },
      tool: {
        type: 'string',
        description: 'Which AI tool this session is from',
        enum: ['claude', 'chatgpt', 'copilot', 'cursor', 'windsurf', 'other'],
        default: 'claude',
      },
      title: {
        type: 'string',
        description: 'Optional session title (auto-generated if not provided)',
      },
    },
    required: ['messages'],
  },
}

export async function handleSaveContext(
  args: Record<string, unknown>,
  api: typeof import('../api')
): Promise<string> {
  const messages = args.messages as Array<{ role: string; content: string }>
  const tool = (args.tool as string) ?? 'claude'
  const title = args.title as string | undefined

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return '❌ Error: messages array is required and must not be empty'
  }

  const result = await api.saveContext(
    messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    tool,
    title
  )

  if (result.resumePrompt) {
    return `✅ Context saved to Memra!

📌 Session: ${result.sessionId}
📝 Title: ${result.title}
💬 ${result.messageCount} messages · ~${result.tokenCount} tokens

🧠 Summary:
${result.summary}

🚀 Resume Prompt (paste this in your next chat):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${result.resumePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use memra_resume to load this automatically next time.`
  }

  return `✅ Session saved to Memra!

📌 Session: ${result.sessionId}
📝 Title: ${result.title}
💬 ${result.messageCount} messages saved

⚠️ Free plan: no AI summary generated.
Upgrade to Pro for auto summaries + resume prompts:
https://memra-rho.vercel.app/pricing`
}
