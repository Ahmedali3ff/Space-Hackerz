// Layout and accessibility checks on a phone and a desktop viewport.
// Fails on horizontal scrolling and on critical accessibility violations. Screenshots and the
// full list of accessibility findings are saved for review.
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const PAGES = ['/', '/astro', '/campaign-map', '/mission-hub']
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
]

mkdirSync('screenshots', { recursive: true })

for (const viewport of VIEWPORTS) {
  for (const path of PAGES) {
    const label = `${viewport.name}${path === '/' ? '_home' : path.replace(/\//g, '_')}`

    test(`${path} on ${viewport.name}: no horizontal scroll, no critical accessibility issues`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      await page.screenshot({ path: `screenshots/${label}.png`, fullPage: true })

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      writeFileSync(
        `screenshots/${label}.a11y.json`,
        JSON.stringify(
          results.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })),
          null,
          2,
        ),
      )

      expect(overflow, 'page is wider than the screen').toBeLessThanOrEqual(1)
      const critical = results.violations.filter((v) => v.impact === 'critical').map((v) => v.id)
      expect(critical, 'critical accessibility violations').toEqual([])
    })
  }
}
