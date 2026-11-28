// Astro-AI design system: readable colour pairs in both themes, and no raw colours in Astro components.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const CSS = readFileSync(join(process.cwd(), 'src/features/astro/astro-design.css'), 'utf8')

/** Reads the variables declared in one theme block. */
function themeVars(selector: string): Record<string, string> {
  const start = CSS.indexOf(selector)
  if (start < 0) throw new Error(`theme block not found: ${selector}`)
  const block = CSS.slice(start, CSS.indexOf('}', start))
  const vars: Record<string, string> = {}
  for (const m of block.matchAll(/--astro-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6});/g)) vars[m[1]!] = m[2]!
  return vars
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const LIGHT = themeVars(':root,\n.astro-theme {')
const DARK = themeVars('.astro-theme.astro-dark {')

describe('colour contrast (WCAG AA, 4.5:1 for body text)', () => {
  for (const [name, theme] of [['light', LIGHT], ['dark', DARK]] as const) {
    it(`${name}: body and secondary text are readable on the page and on cards`, () => {
      for (const fg of ['text', 'text-2', 'muted'] as const) {
        expect(contrast(theme[fg]!, theme.page!), `${fg} on page`).toBeGreaterThanOrEqual(4.5)
        expect(contrast(theme[fg]!, theme.surface!), `${fg} on surface`).toBeGreaterThanOrEqual(4.5)
      }
    })

    it(`${name}: status colours are readable on cards`, () => {
      for (const fg of ['ok', 'warn', 'critical', 'link'] as const) {
        expect(contrast(theme[fg]!, theme.surface!), `${fg} on surface`).toBeGreaterThanOrEqual(4.5)
      }
    })

    it(`${name}: text on the accent button is readable`, () => {
      expect(contrast(theme['on-accent']!, theme.accent!)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('no raw colours in Astro components', () => {
  const FILES = [
    'src/features/astro/AstroDashboardScreen.tsx',
    'src/features/astro/LearningSection.tsx',
    'src/features/astro/shared.tsx',
    'src/features/mission-control/AstroToolsSection.tsx',
    'src/features/mission-control/MissionAnalysisSummary.tsx',
  ]
  for (const file of FILES) {
    it(`${file} uses design tokens only`, () => {
      const source = readFileSync(join(process.cwd(), file), 'utf8')
      expect(source.match(/\[#[0-9a-fA-F]{3,6}\]/g) ?? []).toEqual([])
    })
  }
})
