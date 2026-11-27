// Lumi answers only from reference data and the game guide, and cites sources.
import { describe, it, expect } from 'vitest'
import { askLumi, retrieve } from '@/ai/lumi'
import { ENERGY_RECORDS } from '@data/lumi/energy-data'
import { LIFE_SUPPORT_RECORDS } from '@data/lumi/life-support-data'
import { LUMI_SOURCES, getSource } from '@data/lumi/sources'
import { KNOWLEDGE_BASE } from '@/ai/lumi/knowledge'

describe('Lumi data', () => {
  it('has all team records loaded', () => {
    expect(ENERGY_RECORDS).toHaveLength(20)
    expect(LIFE_SUPPORT_RECORDS).toHaveLength(47)
  })
  it('every record points at a known source', () => {
    for (const r of [...ENERGY_RECORDS, ...LIFE_SUPPORT_RECORDS]) expect(getSource(r.sourceId), r.id).toBeDefined()
  })
  it('every source link is https', () => {
    for (const s of LUMI_SOURCES) expect(s.url.startsWith('https://')).toBe(true)
  })
  it('keeps the corrected fission and heat-melt values', () => {
    expect(ENERGY_RECORDS.find((r) => r.id === 'EN014')?.planet).toBe('Moon and Mars')
    expect(LIFE_SUPPORT_RECORDS.find((r) => r.id === 'LS040')?.value).toBe(12.5)
  })
  it('has unique chunk ids', () => {
    const ids = KNOWLEDGE_BASE.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('Lumi retrieval', () => {
  it('finds oxygen data in English', () => {
    const hits = retrieve('how much oxygen does a person consume per day')
    expect(hits[0]?.chunk.id).toMatch(/^LS00[45]$/)
  })
  it('understands Arabic questions about energy', () => {
    const answer = askLumi('الطاقة الشمسية على المريخ')
    expect(answer.grounded).toBe(true)
    expect(answer.text).toMatch(/solar/i)
  })
  it('answers how the game works with no reference sources', () => {
    const answer = askLumi('how do stars work in the game')
    expect(answer.grounded).toBe(true)
    expect(answer.sources).toHaveLength(0)
    expect(answer.text).toMatch(/Three stars/)
  })
  it('cites the sources behind a data answer', () => {
    const answer = askLumi('nuclear fission power for the moon')
    expect(answer.grounded).toBe(true)
    expect(answer.sources.length).toBeGreaterThan(0)
  })
  it('refuses questions outside its data instead of guessing', () => {
    const answer = askLumi('what is the best pizza recipe in italy')
    expect(answer.grounded).toBe(false)
    expect(answer.sources).toHaveLength(0)
  })
  it('answers in Arabic when asked in Arabic', () => {
    expect(askLumi('مش لاقي حاجة عن الكلاب الطايرة').text).toMatch(/[\u0600-\u06FF]/)
  })
  it('introduces itself as Lumi', () => {
    expect(askLumi('who are you').text).toMatch(/Lumi/)
    expect(askLumi('انت مين').text).toMatch(/Lumi/)
  })
})
