// src/ai/lumi/lumi.ts
// Lumi: a grounded assistant. It answers only from the team's reference data and the game guide,
// cites every source it uses, and says so plainly when a question is outside that scope.

import { KNOWLEDGE_BASE, tokenize } from './knowledge'
import type { KnowledgeChunk } from './knowledge'
import { getSource } from '@data/lumi/sources'
import type { LumiSource } from '@data/lumi/sources'

export interface LumiAnswer {
  readonly text: string
  readonly sources: readonly LumiSource[]
  readonly grounded: boolean
}

const MIN_SCORE = 2
const MAX_CHUNKS = 3

const GREETING = /^(hi|hello|hey|السلام|سلام|اهلا|أهلا|مرحبا|مرحبًا|ازيك|إزيك|هاي)\b/i
const IDENTITY = /(who are you|what are you|انت مين|إنت مين|مين انت|انت ايه|إنت إيه|عرفني)/i

const copy = {
  en: {
    intro: "Hi, I'm Lumi, the guide for Space Hackerz. I answer from NASA reference data and the game guide, and I cite my sources. Ask me about power, oxygen, water, waste, food, or how the levels work.",
    notFound: "I couldn't find that in my reference data or the game guide, so I won't guess. Try asking about energy, oxygen, water, food, waste, the Moon or Mars, or how levels and stars work.",
    caveat: 'Note: values depend on mission design and are reference figures, not guarantees.',
  },
  ar: {
    intro: 'أهلاً، أنا Lumi، المرشد بتاع Space Hackerz. بجاوب من بيانات مرجعية من ناسا ومن دليل اللعبة، وبذكر المصادر. اسألني عن الطاقة والأكسجين والمياه والنفايات والطعام، أو إزاي المستويات والنجوم شغالين.',
    notFound: 'مش لاقي الإجابة دي في البيانات المرجعية ولا في دليل اللعبة، فمش هخمّن. جرّب تسأل عن الطاقة أو الأكسجين أو المياه أو الطعام أو النفايات أو القمر والمريخ، أو إزاي المستويات والنجوم بتشتغل.',
    caveat: 'ملحوظة: الأرقام دي مرجعية وبتعتمد على تصميم المهمة، مش مضمونة.',
  },
} as const

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

export function retrieve(question: string, limit = MAX_CHUNKS): { chunk: KnowledgeChunk; score: number }[] {
  const tokens = new Set(tokenize(question))
  return KNOWLEDGE_BASE.map((chunk) => {
    const keywords = new Set(chunk.keywords)
    let hits = 0
    for (const token of tokens) if (keywords.has(token)) hits += 1
    return { chunk, score: hits }
  })
    .filter((r) => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function askLumi(question: string): LumiAnswer {
  const trimmed = question.trim()
  const t = copy[isArabic(trimmed) ? 'ar' : 'en']

  if (trimmed.length === 0 || IDENTITY.test(trimmed) || GREETING.test(trimmed)) {
    return { text: t.intro, sources: [], grounded: false }
  }

  const hits = retrieve(trimmed)
  if (hits.length === 0) return { text: t.notFound, sources: [], grounded: false }

  const sourceIds = [...new Set(hits.map((h) => h.chunk.sourceId).filter((id): id is string => Boolean(id)))]
  const sources = sourceIds.map((id) => getSource(id)).filter((s): s is LumiSource => s !== undefined)
  const body = hits.map((h) => `• ${h.chunk.title}: ${h.chunk.text}`).join('\n')
  const hasReferenceData = hits.some((h) => h.chunk.topic !== 'game')
  return { text: hasReferenceData ? `${body}\n\n${t.caveat}` : body, sources, grounded: true }
}
