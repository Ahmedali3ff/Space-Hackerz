// src/ai/lumi/knowledge.ts
// Builds the searchable knowledge base for Lumi: reference records plus how the game works.
// Pure data, no React or store imports.

import { ENERGY_RECORDS } from '@data/lumi/energy-data'
import { LIFE_SUPPORT_RECORDS } from '@data/lumi/life-support-data'

export interface KnowledgeChunk {
  readonly id: string
  readonly topic: 'energy' | 'life-support' | 'game'
  readonly title: string
  readonly text: string
  readonly keywords: readonly string[]
  readonly sourceId?: string
}

/** Arabic words people use and the English terms they map to. */
export const ARABIC_SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  'طاقة': ['energy', 'power'], 'كهربا': ['power', 'electrical'], 'كهرباء': ['power', 'electrical'],
  'بطارية': ['battery'], 'بطاريات': ['battery'], 'شمس': ['solar'], 'شمسية': ['solar'],
  'أكسجين': ['oxygen', 'o2'], 'اكسجين': ['oxygen', 'o2'], 'ماء': ['water'], 'مياه': ['water'], 'مية': ['water'],
  'ثاني': ['co2', 'carbon'], 'كربون': ['carbon', 'co2'], 'طعام': ['food'], 'اكل': ['food'], 'أكل': ['food'],
  'نفايات': ['waste', 'trash'], 'زبالة': ['trash', 'waste'], 'فضلات': ['waste'], 'قمر': ['moon', 'lunar'],
  'القمر': ['moon', 'lunar'], 'مريخ': ['mars'], 'المريخ': ['mars'], 'ليل': ['night'], 'نجوم': ['stars'],
  'مستوى': ['level', 'rank'], 'مستويات': ['level'], 'مهمة': ['mission'], 'مهمات': ['mission'],
  'رتبة': ['rank'], 'نقاط': ['xp', 'score'], 'فصل': ['chapter'], 'مفاعل': ['fission', 'reactor'],
  'مصدر': ['source'], 'مصادر': ['source'], 'حرارة': ['thermal', 'heat'], 'إشعاع': ['radiation'], 'اشعاع': ['radiation'],
}

const WORD = /[a-z0-9]+|[\u0600-\u06FF]+/g

/** Function words that carry no meaning for search (English and Egyptian/MSA Arabic). */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'as', 'is', 'are', 'was',
  'be', 'do', 'does', 'did', 'how', 'what', 'which', 'who', 'why', 'when', 'where', 'it', 'its', 'this', 'that',
  'can', 'i', 'you', 'me', 'my', 'we', 'our', 'not', 'no', 'yes', 'any', 'than', 'then', 'there', 'so', 'if',
  'about', 'work', 'works', 'tell', 'give', 'show', 'explain', 'please', 'much', 'many', 'some',
  'في', 'على', 'من', 'الى', 'إلى', 'عن', 'ده', 'دي', 'دا', 'ايه', 'إيه', 'ازاي', 'إزاي', 'هو', 'هي', 'و', 'او', 'أو',
  'بتاع', 'بتاعة', 'انا', 'أنا', 'انت', 'إنت', 'عايز', 'عاوز', 'ممكن', 'يعني', 'بس',
])

/** Lowercase tokens without function words; Arabic words are expanded (with the leading "ال" removed) to English. */
export function tokenize(text: string): string[] {
  const out: string[] = []
  for (const raw of text.toLowerCase().normalize('NFKD').replace(/[\u064B-\u0652]/g, '').match(WORD) ?? []) {
    if (STOP_WORDS.has(raw)) continue
    out.push(raw)
    const stripped = raw.startsWith('ال') && raw.length > 3 ? raw.slice(2) : raw
    if (stripped !== raw) out.push(stripped)
    for (const mapped of ARABIC_SYNONYMS[raw] ?? ARABIC_SYNONYMS[stripped] ?? []) out.push(mapped)
  }
  return out
}

const energyChunks: KnowledgeChunk[] = ENERGY_RECORDS.map((r) => ({
  id: r.id,
  topic: 'energy',
  title: `${r.parameter} (${r.planet}, ${r.system})`,
  text: `${r.parameter} on ${r.planet} for ${r.system}: ${r.value} ${r.unit}. ${r.note}`,
  keywords: tokenize(`${r.planet} ${r.group} ${r.system} ${r.parameter} ${r.unit} energy power ${r.note}`),
  sourceId: r.sourceId,
}))

const lifeChunks: KnowledgeChunk[] = LIFE_SUPPORT_RECORDS.map((r) => ({
  id: r.id,
  topic: 'life-support',
  title: `${r.parameter} (${r.resource})`,
  text: `${r.parameter}: ${r.value} ${r.unit} (${r.basis}). ${r.note}`,
  keywords: tokenize(`${r.resource} ${r.parameter} ${r.unit} ${r.basis} ${r.note}`),
  sourceId: r.sourceId,
}))

const GAME_FACTS: readonly Omit<KnowledgeChunk, 'topic'>[] = [
  { id: 'game-goal', title: 'What is Space Hackerz?', text: 'Space Hackerz is a mission-control game. You command a crew on the Moon and Mars and keep them alive by managing oxygen, water, food and energy while you solve science puzzles.', keywords: tokenize('space hackerz game what goal play mission commander crew') },
  { id: 'game-levels', title: 'Levels and chapters', text: 'The campaign has 20 missions in five chapters of four. Each mission unlocks when you finish the one before it. Chapter 1 is Cadet Academy, chapter 2 Frontier Operations, chapter 3 Deep Surface Missions, chapter 4 Crisis Command and chapter 5 Legend of ASTRA.', keywords: tokenize('level levels chapter chapters mission unlock campaign 20 missions how many') },
  { id: 'game-operation', title: 'How a mission is played', text: 'Each mission is an operation with a 3-minute timer. You choose actions in the required order, such as surveying, repairing or testing, and answer science puzzles. Some actions are traps that cost points or break the sequence. Finish every objective and puzzle to win.', keywords: tokenize('play how operation action timer puzzle objective sequence trap') },
  { id: 'game-resources', title: 'Resources', text: 'The base tracks four resources: oxygen, water, food and energy, each from 0 to 100. If any resource reaches zero the mission is lost. Each mission lists minimum resource levels you must keep.', keywords: tokenize('resource resources oxygen water food energy lose lost zero depleted') },
  { id: 'game-stars', title: 'Stars', text: 'One star means you finished the mission. Two stars mean every objective and puzzle is done with no puzzle mistakes. Three stars also need half the timer left and at least 80% of the maximum score.', keywords: tokenize('star stars rating three two one earn score') },
  { id: 'game-xp', title: 'XP and ranks', text: 'Each mission gives XP equal to 20 per star plus 10 times the mission number. Replays only earn XP for stars you did not already have. There are 20 ranks, from Space Cadet at level 1 to ASTRA Legend at level 20.', keywords: tokenize('xp rank ranks level experience points replay earn legend cadet') },
]

export const KNOWLEDGE_BASE: readonly KnowledgeChunk[] = [
  ...energyChunks,
  ...lifeChunks,
  // Every game-guide entry is about the game, so the word "game" alone counts as a match for them.
  ...GAME_FACTS.map((g) => ({ ...g, keywords: [...g.keywords, 'game'], topic: 'game' as const })),
]
