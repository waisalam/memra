'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

export type CodeLang = 'ts' | 'bash' | 'json'

type TokKind = 'kw' | 'str' | 'cmt' | 'num' | 'typ' | 'met' | 'jkey' | 'txt'
type Token = [TokKind, string]

const TOK_STYLE: Record<TokKind, CSSProperties> = {
  kw:   { color: '#93c5fd' },
  str:  { color: '#86efac' },
  cmt:  { color: '#52525b', fontStyle: 'italic' },
  num:  { color: '#fb923c' },
  typ:  { color: '#c084fc' },
  met:  { color: '#7dd3fc' },
  jkey: { color: '#60a5fa' },
  txt:  {},
}

const TS_KEYWORDS = new Set([
  'import','export','const','let','var','async','await','return',
  'new','from','function','class','interface','type','if','else',
  'try','catch','throw','typeof','instanceof','default','void',
  'null','undefined','true','false','extends','implements',
  'private','public','protected','readonly','static','Promise',
])

function tokenizeTS(src: string): Token[] {
  const out: Token[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    // Line comment
    if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i)
      const to = end === -1 ? src.length : end
      out.push(['cmt', src.slice(i, to)])
      i = to
      continue
    }
    // Block comment
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      const to = end === -1 ? src.length : end + 2
      out.push(['cmt', src.slice(i, to)])
      i = to
      continue
    }
    // Template string
    if (c === '`') {
      let j = i + 1
      while (j < src.length && src[j] !== '`') { if (src[j] === '\\') j++; j++ }
      out.push(['str', src.slice(i, j + 1)])
      i = j + 1
      continue
    }
    // Double-quoted string
    if (c === '"') {
      let j = i + 1
      while (j < src.length && src[j] !== '"' && src[j] !== '\n') { if (src[j] === '\\') j++; j++ }
      out.push(['str', src.slice(i, j + 1)])
      i = j + 1
      continue
    }
    // Single-quoted string
    if (c === "'") {
      let j = i + 1
      while (j < src.length && src[j] !== "'" && src[j] !== '\n') { if (src[j] === '\\') j++; j++ }
      out.push(['str', src.slice(i, j + 1)])
      i = j + 1
      continue
    }
    // Number
    if (/\d/.test(c)) {
      let j = i
      while (j < src.length && /[\d._]/.test(src[j])) j++
      out.push(['num', src.slice(i, j)])
      i = j
      continue
    }
    // Identifier
    if (/[a-zA-Z_$]/.test(c)) {
      let j = i
      while (j < src.length && /[\w$]/.test(src[j])) j++
      const word = src.slice(i, j)
      if (TS_KEYWORDS.has(word)) out.push(['kw', word])
      else if (src[j] === '(') out.push(['met', word])
      else if (/^[A-Z]/.test(word)) out.push(['typ', word])
      else out.push(['txt', word])
      i = j
      continue
    }
    // Plain run
    let j = i + 1
    while (
      j < src.length &&
      src[j] !== '/' &&
      src[j] !== '`' &&
      src[j] !== '"' &&
      src[j] !== "'" &&
      !/[\d\w]/.test(src[j])
    ) j++
    out.push(['txt', src.slice(i, j)])
    i = j
  }
  return out
}

function tokenizeJSON(src: string): Token[] {
  const out: Token[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    // Whitespace
    if (/\s/.test(c)) {
      let j = i; while (j < src.length && /\s/.test(src[j])) j++
      out.push(['txt', src.slice(i, j)]); i = j; continue
    }
    // String
    if (c === '"') {
      let j = i + 1
      while (j < src.length && src[j] !== '"') { if (src[j] === '\\') j++; j++ }
      const str = src.slice(i, j + 1)
      i = j + 1
      let k = i; while (k < src.length && /\s/.test(src[k])) k++
      out.push([src[k] === ':' ? 'jkey' : 'str', str])
      continue
    }
    // Number (including negative)
    if (/\d/.test(c) || (c === '-' && /\d/.test(src[i + 1] ?? ''))) {
      let j = i; if (src[j] === '-') j++
      while (j < src.length && /[\d.eE+\-]/.test(src[j])) j++
      out.push(['num', src.slice(i, j)]); i = j; continue
    }
    // Keyword literals
    let matched = false
    for (const kw of ['true', 'false', 'null']) {
      if (src.startsWith(kw, i)) {
        out.push(['kw', kw]); i += kw.length; matched = true; break
      }
    }
    if (matched) continue
    out.push(['txt', c]); i++
  }
  return out
}

interface CodeBlockProps {
  code: string
  language?: CodeLang
  filename?: string
  className?: string
}

export function CodeBlock({ code, language = 'ts', filename, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tokens: Token[] =
    language === 'json' ? tokenizeJSON(code) :
    language === 'ts'   ? tokenizeTS(code) :
    [['txt', code]]

  const langLabel = language === 'ts' ? 'typescript' : language === 'json' ? 'json' : 'bash'

  return (
    <div className={`rounded-xl border border-[#1e1e1e] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0d0d] border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          {filename
            ? <span className="text-xs text-zinc-500 font-mono">{filename}</span>
            : <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">{langLabel}</span>
          }
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
              <span style={{ color: '#4ade80' }}>Copied</span>
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre
        className="p-5 overflow-x-auto text-xs leading-relaxed font-mono"
        style={{ background: '#080808', color: '#d4d4d8' }}
      >
        <code>
          {tokens.map((tok, idx) => (
            <span key={idx} style={TOK_STYLE[tok[0]]}>{tok[1]}</span>
          ))}
        </code>
      </pre>
    </div>
  )
}
