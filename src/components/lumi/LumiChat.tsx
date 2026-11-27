// src/components/lumi/LumiChat.tsx
// Floating chat panel for Lumi. Text is rendered as plain text (never HTML).
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { askLumi } from '@/ai/lumi'
import type { LumiSource } from '@data/lumi/sources'

interface Message {
  readonly id: number
  readonly role: 'user' | 'lumi'
  readonly text: string
  readonly sources: readonly LumiSource[]
}

const WELCOME = askLumi('hello')

export function LumiChat(): JSX.Element {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: 'lumi', text: WELCOME.text, sources: [] }])
  const nextId = useRef(1)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  function send(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const question = draft.trim()
    if (question.length === 0 || question.length > 500) return
    const answer = askLumi(question)
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: 'user', text: question, sources: [] },
      { id: nextId.current++, role: 'lumi', text: answer.text, sources: answer.sources },
    ])
    setDraft('')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2" style={{ fontFamily: 'Nunito, system-ui, sans-serif' }}>
      {open && (
        <section aria-label="Lumi assistant" className="flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#1FC8C0]/40 bg-[#0B1224] shadow-2xl" style={{ maxHeight: 'min(520px, 70vh)' }}>
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-black text-white">Lumi</p>
              <p className="text-[10px] text-[#9CA3AF]">Space Hackerz guide · cites NASA sources</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Lumi" className="rounded-full px-2 py-1 text-[#C4B5FD] hover:text-white">✕</button>
          </header>

          <div ref={listRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div dir="auto" className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-[#7C3AED] text-white' : 'bg-white/10 text-[#E5E7EB]'}`}>
                  {m.text}
                  {m.sources.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-white/10 pt-2 text-[11px]">
                      {m.sources.map((s) => (
                        <li key={s.id}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#1FC8C0] underline underline-offset-2">{s.title}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
            <label className="sr-only" htmlFor="lumi-input">Ask Lumi</label>
            <input
              id="lumi-input"
              dir="auto"
              value={draft}
              maxLength={500}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about energy, oxygen, levels…"
              className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FC8C0]"
            />
            <button type="submit" disabled={draft.trim().length === 0} className="rounded-full bg-[#1FC8C0] px-4 py-2 text-sm font-bold text-[#0B1224] disabled:opacity-40">Send</button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Hide Lumi' : 'Open Lumi'}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#1FC8C0] px-4 py-3 text-sm font-black text-white shadow-lg hover:scale-105"
      >
        <span aria-hidden="true">✦</span> Lumi
      </button>
    </div>
  )
}
