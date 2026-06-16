# Memra MCP Server

Give Claude Code, Cursor, and Windsurf persistent memory across chat sessions.

## The problem it solves

AI coding assistants forget everything when the context window fills. Memra lets you save your session before it's lost, then instantly resume in a new chat with full context — no re-explaining your codebase, decisions, or preferences.

## Install

```bash
npm install -g @memra/mcp-server
```

> ⚠️ **Important:** Use an MCP key (`mk_mcp_...`), not a Memory API key (`mk_mem_...`).  
> Go to Dashboard → **MCP Keys tab** to create one.

## Get an API key

Visit [memra-rho.vercel.app/dashboard/keys](https://memra-rho.vercel.app/dashboard/keys) — free account, no credit card required.  
On the keys page, switch to the **MCP Keys** tab and create a key starting with `mk_mcp_`.

## Setup

### Claude Code

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "memra": {
      "command": "memra-mcp",
      "env": { "MEMRA_API_KEY": "mk_mcp_your_key_here" }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "memra": {
      "command": "memra-mcp",
      "env": { "MEMRA_API_KEY": "mk_mcp_your_key_here" }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "memra": {
      "command": "memra-mcp",
      "env": { "MEMRA_API_KEY": "mk_mcp_your_key_here" }
    }
  }
}
```

## Tools (Claude uses these automatically)

| Tool | When Claude uses it |
|------|---------------------|
| `memra_save_context` | Context window filling, user says "save our session" |
| `memra_resume` | Start of chat, user says "resume" or "what were we working on?" |
| `memra_list_sessions` | User asks to see saved sessions |
| `memra_save_memory` | User says "remember this", "always do X", "save this preference" |
| `memra_get_memory` | Before decisions, start of session, "do you remember...?" |

## Plan comparison

| Feature | Free | Pro ($29/mo) |
|---------|------|--------------|
| Sessions | 5 max | Unlimited |
| AI summaries | ❌ | ✅ Groq-powered |
| Resume prompts | ❌ | ✅ Auto-generated |
| Memories | 100 | 50,000 |
| API calls/month | 200 | 10,000 |

## Troubleshooting

**Key not found**
```
❌ Memra API Key Missing
```
Make sure `MEMRA_API_KEY` is set in your MCP config's `env` block, not as a shell variable.

**Wrong key type**
```
🔑 Wrong Key Type
```
You're using a Memory API key (`mk_mem_...`) instead of an MCP key (`mk_mcp_...`). Create an MCP key at [memra-rho.vercel.app/dashboard/keys](https://memra-rho.vercel.app/dashboard/keys).

**Connection error**
```
🌐 Connection Error: Cannot reach Memra API
```
Check your internet connection.

**Plan limit**
```
⚠️ Plan Limit: Free plan limit: 5 sessions maximum
```
Upgrade at [memra-rho.vercel.app/pricing](https://memra-rho.vercel.app/pricing) or delete old sessions with `memra_list_sessions`.

---

[memra-rho.vercel.app](https://memra-rho.vercel.app) · [Dashboard](https://memra-rho.vercel.app/dashboard) · [Pricing](https://memra-rho.vercel.app/pricing)
