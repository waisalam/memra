export const getMemoryTool = {
  name: 'memra_get_memory',
  description: `Retrieve semantically relevant memories from Memra.

Uses Cohere semantic search server-side — write natural language queries, not keywords.

GOOD QUERIES:
"how we decided to structure the authentication system"
"the user's preferred coding style and naming conventions"
"what database and ORM we chose for this project"

BAD QUERIES (too short):
"auth" "database" "style"

WHEN TO CALL THIS:
- Start of a session to load relevant context
- Before making decisions that were previously discussed
- When user asks if you remember something specific`,
  inputSchema: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'User identifier to search memories for',
      },
      query: {
        type: 'string',
        description: 'Natural language query to search memories',
      },
      agentId: {
        type: 'string',
        description: 'Optional agent/project filter',
      },
      limit: {
        type: 'number',
        description: 'Max memories to return (plan dependent)',
        default: 5,
      },
    },
    required: ['userId', 'query'],
  },
}

export async function handleGetMemory(
  args: Record<string, unknown>,
  api: typeof import('../api')
): Promise<string> {
  const userId = args.userId as string
  const query = args.query as string
  const agentId = args.agentId as string | undefined
  const limit = (args.limit as number) ?? 5

  if (!userId || !query) {
    return '❌ Error: userId and query are required'
  }

  const result = await api.getMemory(userId, query, agentId, limit)

  if (result.context.length === 0) {
    return `🔍 No relevant memories found for: "${query}"\n\nUse memra_save_memory to store information for future retrieval.`
  }

  const lines = result.context.map((m, i) => {
    const sim = m.similarity ? ` (${Math.round(m.similarity * 100)}% match)` : ''
    return `${i + 1}.${sim}\n[${m.role}]: ${m.content}`
  })

  return `🧠 Found ${result.count} memories (${result.latencyMs}ms)\n\nQuery: "${query}"\n\n${lines.join('\n\n')}`
}
