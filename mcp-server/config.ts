import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

function loadConfig(): { apiKey: string; baseUrl: string } {
  const envKey = process.env.MEMRA_API_KEY
  if (envKey) {
    return {
      apiKey: envKey,
      baseUrl: process.env.MEMRA_BASE_URL ?? 'https://memra-rho.vercel.app/api',
    }
  }

  try {
    const configPath = path.join(os.homedir(), '.memra', 'config.json')
    const raw = fs.readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    if (parsed.apiKey) {
      return {
        apiKey: parsed.apiKey,
        baseUrl: parsed.baseUrl ?? 'https://memra-rho.vercel.app/api',
      }
    }
  } catch {
    // File not found or invalid — continue to error
  }

  process.stderr.write(`
❌ Memra API Key Missing

Add your key to your MCP config:

Claude Code (.claude/mcp.json):
{
  "mcpServers": {
    "memra": {
      "command": "memra-mcp",
      "MEMRA_API_KEY": "mk_mcp_your_key" }
    }
  }
}

Get your free MCP key at: https://memra-rho.vercel.app/dashboard/keys
`)
  process.exit(1)
}

export const config = loadConfig()
