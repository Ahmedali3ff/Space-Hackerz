// src/features/mission-control/AstroToolsSection.tsx
// "Ask Astro-AI" (grounded science answers with sources) and "Explain a system" (game system guide).
import { useState } from 'react'
import { askLumi } from '@/ai/lumi'
import type { LumiAnswer } from '@/ai/lumi'
import { GAME_SYSTEMS, findSystem } from '@/ai/systems/game-systems'

export function AstroToolsSection(): JSX.Element {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<LumiAnswer | null>(null)
  const [systemId, setSystemId] = useState<string>('')
  const system = systemId ? findSystem(systemId) : undefined

  function ask(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const text = question.trim()
    if (text.length === 0 || text.length > 500) return
    setAnswer(askLumi(text))
  }

  return (
    <section aria-label="Astro-AI tools" className="flex flex-col gap-4 border-t border-[#1FC8C0]/20 pt-3">
      <form onSubmit={ask} className="flex flex-col gap-2">
        <label htmlFor="astro-ask" className="text-sm font-semibold text-[#1A1D2E]">Ask Astro-AI</label>
        <div className="flex gap-2">
          <input
            id="astro-ask"
            dir="auto"
            value={question}
            maxLength={500}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How much oxygen does a crew use?"
            className="min-w-0 flex-1 rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1FC8C0]"
          />
          <button type="submit" disabled={question.trim().length === 0} className="rounded-lg bg-[#1FC8C0] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Ask</button>
        </div>
      </form>
      {answer !== null ? (
        <div role="status" className="flex flex-col gap-2 rounded-xl bg-white p-3 text-sm text-[#1A1D2E]">
          <p className="whitespace-pre-line" dir="auto">{answer.text}</p>
          {answer.sources.length > 0 ? (
            <ul className="text-xs">
              {answer.sources.map((s) => (
                <li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#0E7490] underline">{s.title}</a></li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="astro-system" className="text-sm font-semibold text-[#1A1D2E]">Explain a game system</label>
        <select id="astro-system" value={systemId} onChange={(e) => setSystemId(e.target.value)} className="rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm">
          <option value="">Choose a system…</option>
          {GAME_SYSTEMS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {system !== undefined ? (
          <div className="flex flex-col gap-2 rounded-xl bg-white p-3 text-sm text-[#1A1D2E]">
            <p className="font-semibold">{system.summary}</p>
            <p><span className="font-semibold">In ASTRA: </span>{system.inGame}</p>
            <p><span className="font-semibold">Real world (simplified): </span>{system.realWorld}</p>
            <p><span className="font-semibold">Why it matters: </span>{system.importance}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
