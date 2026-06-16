export const saveMemoryTool = {
  name: 'memra_save_memory',
  description: `Save important information to persistent Memra memory.

WHEN TO CALL THIS:
- User says "remember this", "always do this", "save this preference"
- Architecture decisions that should persist across sessions
- Coding style preferences and conventions
- Tech stack choices and reasons
- Any fact the user wants the AI to always know

Unlike context sessions, memories are searched semantically
and retrieved based on relevance to current queries.`,
  inputSchema: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'User identifier for memory namespace',
      },
      userMessage: {
        type: 'string',
        description: 'The information to remember (user side)',
      },
      aiReply: {
        type: 'string',
        description: 'Your acknowledgment of what was saved',
      },
      agentId: {
        type: 'string',
        description: 'Optional agent/project namespace',
      },
    },
    required: ['userId', 'userMessage', 'aiReply'],
  },
}

export async function handleSaveMemory(
  args: Record<string, unknown>,
  api: typeof import('../api')
): Promise<string> {
  const userId = args.userId as string
  const userMessage = args.userMessage as string
  const aiReply = args.aiReply as string
  const agentId = args.agentId as string | undefined

  if (!userId || !userMessage || !aiReply) {
    return '❌ Error: userId, userMessage, and aiReply are required'
  }

  await api.saveMemory(userId, userMessage, aiReply, agentId)
  return `✅ Saved to Memra memory\n\nStored: "${userMessage.slice(0, 80)}${userMessage.length > 80 ? '...' : ''}"\nUse memra_get_memory to retrieve this later.`
}
