#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { config } from './config'
import * as api from './api'
import { saveContextTool, handleSaveContext } from './tools/saveContext'
import { resumeTool, handleResume } from './tools/getResumePrompt'
import { listSessionsTool, handleListSessions } from './tools/listSessions'
import { saveMemoryTool, handleSaveMemory } from './tools/saveMemory'
import { getMemoryTool, handleGetMemory } from './tools/getMemory'

const server = new Server(
  { name: 'memra', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

process.stderr.write(`🧠 Memra MCP Server v0.1.0\n`)
process.stderr.write(`📡 API: ${config.baseUrl}\n`)
process.stderr.write(`🔑 Key: ${config.apiKey.slice(0, 10)}...\n`)
process.stderr.write(`✅ Ready — 5 tools available\n`)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [saveContextTool, resumeTool, listSessionsTool, saveMemoryTool, getMemoryTool],
}))

function parseError(err: unknown): string {
  if (!(err instanceof Error)) return 'Unknown error occurred'
  const msg = err.message
  if (msg.startsWith('KEY_TYPE_ERROR:'))
    return `🔑 Wrong Key Type\n\n${msg.replace('KEY_TYPE_ERROR:', '')}\n\nGet an MCP key at: https://memra-rho.vercel.app/dashboard/keys`
  if (msg.startsWith('PLAN_LIMIT:'))
    return `⚠️ Plan Limit\n\n${msg.replace('PLAN_LIMIT:', '')}\n\nUpgrade: https://memra-rho.vercel.app/pricing`
  if (msg.startsWith('RATE_LIMIT:'))
    return `⏱️ Rate Limit Reached\n\n${msg.replace('RATE_LIMIT:', '')}\n\nUpgrade: https://memra-rho.vercel.app/pricing`
  if (msg.startsWith('NETWORK_ERROR:'))
    return `🌐 Connection Error\n\n${msg.replace('NETWORK_ERROR:', '')}`
  if (msg.startsWith('NOT_FOUND:'))
    return `🔍 Not Found\n\n${msg.replace('NOT_FOUND:', '')}`
  if (msg.startsWith('SERVER_ERROR:'))
    return `🔴 Server Error\n\nSomething went wrong. Try again.\nhttps://usememra.com/status`
  return `❌ Error: ${msg}`
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  try {
    let text: string
    switch (name) {
      case 'memra_save_context':
        text = await handleSaveContext(args ?? {}, api)
        break
      case 'memra_resume':
        text = await handleResume(args ?? {}, api)
        break
      case 'memra_list_sessions':
        text = await handleListSessions(args ?? {}, api)
        break
      case 'memra_save_memory':
        text = await handleSaveMemory(args ?? {}, api)
        break
      case 'memra_get_memory':
        text = await handleGetMemory(args ?? {}, api)
        break
      default:
        text = `Unknown tool: ${name}`
    }
    return { content: [{ type: 'text', text }] }
  } catch (err) {
    return { content: [{ type: 'text', text: parseError(err) }] }
  }
})

const transport = new StdioServerTransport()
server.connect(transport)
