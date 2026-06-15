# Memra — Persistent Memory for AI Agents

> Give any AI permanent memory with one API call

## The Problem

Every AI API call starts fresh. No memory. No context.
Users repeat themselves every session. Agents lose all progress on restart.
Developers waste weeks building state management from scratch.

## The Solution

**BEFORE** (without Memra):
```typescript
const reply = await ai.chat(userMessage)
// AI has no idea who this user is or what happened before
```

**AFTER** (with Memra):
```typescript
const { context } = await memory.getContext(userId, userMessage)
const reply = await ai.chat(userMessage, context)
// AI remembers everything about this user. Forever.
```

## How It Works

```
User Message
     ↓
Memra API
     ↓
Generate embedding (@xenova/transformers)
     ↓
pgvector semantic search (NeonDB)
     ↓
Top 5 relevant memories returned
     ↓
Inject into AI prompt
     ↓
AI replies with full context
     ↓
Save new messages back to Memra
```

## Quick Start

```bash
npm install @memra-client/client
```

```typescript
import { MemoryClient } from '@memra-client/client'

const memory = new MemoryClient({ apiKey: 'mk_live_your_key' })

// 1. Get relevant context before your AI call
const { context } = await memory.getContext('user_123', userMessage)

// 2. Call your AI with injected memory
const prompt = `
  Context from past conversations:
  ${context.map(m => m.content).join('\n')}

  Current message: ${userMessage}
`
const aiReply = await yourAI.chat(prompt)

// 3. Save the conversation turn
await memory.save('user_123', userMessage, aiReply)
```

## API Reference

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/memory/save | Save conversation turn | Required |
| GET | /api/memory/context | Semantic memory search | Required |
| GET | /api/memory/history | Raw message history | Required |
| DELETE | /api/memory/forget | Delete user memories | Required |
| POST | /api/keys/create | Create API key | — |
| GET | /api/keys/list | List API keys | — |
| POST | /api/chat/respond | AI response with memory | Required |

## Architecture Decisions

**NeonDB + pgvector** chosen over ChromaDB because:
- Single infrastructure (no second server)
- 3× faster (no Python overhead)
- Already using Postgres for everything else
- pgvector cosine search is production proven at scale

**@xenova/transformers** chosen over Python SentenceTransformers:
- Runs natively in Node.js
- Same model quality (all-MiniLM-L6-v2)
- No Python runtime needed
- No second process or Docker container

**Prisma + $queryRaw hybrid** because:
- Prisma doesn't support vector type natively
- `$queryRaw` used only for vector operations
- All other DB operations use standard Prisma
- Best of both worlds

## Local Development

1. Clone repo: `git clone https://github.com/yourname/memra`
2. Install deps: `npm install`
3. Copy env: `cp .env.example .env.local`
4. Fill in NeonDB connection strings in `.env.local`
5. Fill in `GROQ_API_KEY` and `OPENROUTER_API_KEY`
6. Enable pgvector in NeonDB console: `CREATE EXTENSION vector;`
7. Run migration: `npx prisma migrate dev --name init`
8. Add embedding column (run in NeonDB SQL editor):
   ```sql
   ALTER TABLE "Memory" ADD COLUMN embedding vector(384);
   CREATE INDEX ON "Memory" USING ivfflat (embedding vector_cosine_ops);
   ```
9. Start dev server: `npm run dev`
10. Open http://localhost:3000/demo to test

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Add all env variables in Vercel dashboard
4. Deploy

## Performance

| Step | Time |
|------|------|
| Embedding generation | ~80ms |
| pgvector search | ~30ms |
| Network overhead | ~15ms |
| **Total** | **~125ms** |

## AI Providers

- **Primary**: Groq (`openai/gpt-oss-120b`) — fast inference, automatic fallback on failure
- **Fallback**: OpenRouter (`nex-agi/nex-n2-pro:free`) — used when Groq is unavailable
- No vendor lock-in — swap any provider in `/api/chat/respond`

## Roadmap

- [ ] Dashboard with usage analytics
- [ ] Rate limiting per API key
- [ ] Memory summarization (compress old memories via AI)
- [ ] MCP server support
- [ ] Self-host Docker option
- [ ] Webhook support for memory events
- [ ] SDKs for Python, Go, Rust

## License

MIT
