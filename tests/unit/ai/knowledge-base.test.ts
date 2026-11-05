// tests/unit/ai/knowledge-base.test.ts
// Unit tests for the static knowledge base.

import { describe, it, expect } from 'vitest'
import { KNOWLEDGE_BASE, getKnowledgeEntry } from '@ai/knowledge-base'
import { LUNAR_EVENTS } from '@simulation/events/lunar-events'
import { MARTIAN_EVENTS } from '@simulation/events/martian-events'

describe('knowledge-base', () => {
  it('has entries for all lunar event IDs', () => {
    for (const event of LUNAR_EVENTS) {
      const entry = getKnowledgeEntry(event.id)
      expect(entry.trigger).toBe(event.id)
    }
  })

  it('has entries for all martian event IDs', () => {
    for (const event of MARTIAN_EVENTS) {
      const entry = getKnowledgeEntry(event.id)
      expect(entry.trigger).toBe(event.id)
    }
  })

  it('has a default entry', () => {
    const entry = getKnowledgeEntry('default')
    expect(entry.trigger).toBe('default')
  })

  it('all entries have non-empty explanation, scienceFact, and suggestion', () => {
    for (const entry of KNOWLEDGE_BASE) {
      expect(entry.explanation.length).toBeGreaterThan(0)
      expect(entry.scienceFact.length).toBeGreaterThan(0)
      expect(entry.suggestion.length).toBeGreaterThan(0)
    }
  })

  it('getKnowledgeEntry returns default for unknown trigger', () => {
    const entry = getKnowledgeEntry('nonexistent-trigger-xyz')
    expect(entry.trigger).toBe('default')
  })
})
