// Browser smoke tests: each main page must render and must not throw JavaScript errors.
import { test, expect } from '@playwright/test'

const PAGES = ['/', '/astro', '/campaign-map', '/mission-hub']

// Network calls to the API are expected to fail in a static preview; they are not app errors.
const IGNORED = [/Failed to load resource/, /\/api\//, /favicon/]

for (const path of PAGES) {
  test(`renders ${path} without JavaScript errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error' && !IGNORED.some((re) => re.test(m.text()))) errors.push(m.text())
    })

    await page.goto(path)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('#root')).not.toBeEmpty()
    expect(errors, `errors on ${path}`).toEqual([])
  })
}

test('Lumi answers a question from the reference data', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open Lumi' }).click()
  await page.getByLabel('Ask Lumi').fill('oxygen per person per day')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/Daily O2 Consumption/)).toBeVisible()
})

test('Lumi refuses questions outside its data', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open Lumi' }).click()
  await page.getByLabel('Ask Lumi').fill('best pizza recipe')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/won't guess/)).toBeVisible()
})
