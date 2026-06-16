export const listSessionsTool = {
  name: 'memra_list_sessions',
  description: 'List your saved Memra context sessions',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Number of sessions to return (max 20)',
        default: 10,
      },
    },
  },
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export async function handleListSessions(
  args: Record<string, unknown>,
  api: typeof import('../api')
): Promise<string> {
  const limit = (args.limit as number) ?? 10
  const result = await api.listSessions(limit)

  if (result.sessions.length === 0) {
    return `📭 No sessions saved yet.\n\nUse memra_save_context to save your first session.`
  }

  const lines = result.sessions.map(
    (s, i) =>
      `${i + 1}. [${s.tool}] ${s.title}\n   ${s.messageCount} messages · ${relativeTime(s.createdAt)}\n   ID: ${s.id}${s.summary ? `\n   ${s.summary}` : ''}`
  )

  return `📚 Your Memra Sessions (${result.count} total)\n\n${lines.join('\n\n')}\n\nUse memra_resume with a session ID to load one.`
}
