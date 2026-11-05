# ASTRA — Space+ Visual Overhaul Plan
**Generated:** planning step for workflow `wf_e33c10bae5e172be`  
**Goal:** Make EVERY screen match Space+ reference exactly — light `#F4F7FA` bg, teal `#1FC8C0`, white cards, Nunito font.

---

## Audit Summary

### What currently exists (Space+ already done)
- `Card.tsx` — ✅ white `sp-card`, correct teal ring
- `MissionsOverviewScreen.tsx` — ✅ uses `AppShell variant="light"`, Card, Space+ tokens
- `PlanetSelectionScreen.tsx` — ✅ Space+ cards, teal ring
- `CrewSelectionScreen.tsx` — ✅ Space+ layout
- `BaseConfigurationScreen.tsx` — ✅ Space+ cards, teal sliders
- `OnboardingScreen.tsx` — ✅ Space+ card
- `MissionDebriefScreen.tsx` — ✅ fully uses Card + `spaceplus.*` tokens
- `MiniProgressBar.tsx` — ✅ `spaceplus.*` tokens
- `TopNavBar.tsx` — ✅ exists, light variant correct

### What still uses old dark tokens / Panel (needs fixing)
| File | Problems |
|------|----------|
| `src/components/common/Panel.tsx` | Still renders `glass-panel`, `border-accent-ignition`, `border-accent-orbit`, `shadow-glow-*` — old glassmorphic |
| `src/features/mission-control/MissionControlScreen.tsx` | Imports `Panel`; `HudSlot` uses `hud-mono text-text-primary/secondary/muted`; `FloatingResourceBar` uses `bg-space-panel/95 border-border-subtle`; error/outcome banners use `Panel accent="ignition/orbit"`, dismiss button uses `ring-accent-orbit` |
| `src/features/mission-control/ResourcePanel.tsx` | Imports `Panel`; crew row uses `hud-mono text-text-primary`, `border-border-subtle`, `text-text-secondary` |
| `src/features/mission-control/EnvironmentPanel.tsx` | Imports `Panel`; temp values use `hud-mono text-text-primary`, `text-text-secondary`, `border-border-subtle` |
| `src/features/mission-control/EventPanel.tsx` | Imports `Panel` for the "All systems nominal" section |
| `src/components/feedback/EventCard.tsx` | Imports `Panel`; uses `text-accent-ignition`, `text-accent-orbit`, `font-display`, `text-text-primary`, `text-text-secondary` |
| `src/components/feedback/AstroPanel.tsx` | Imports `Panel accent="orbit"`; message bubbles use `bg-space-deep`, `text-text-primary`, `border-accent-orbit/30`, `bg-accent-orbit/5`, `text-accent-orbit` |
| `src/components/charts/ResourceBar.tsx` | Uses `hud-mono text-text-primary` |
| `tailwind.config.js` | `spaceplus.accent.teal` is `#00BCD4` — must be `#1FC8C0`. Background app alias `#F4F7FA` not present. `body` default in index.css is dark. |
| `src/index.css` | `body` background = `var(--space-void)` dark; focus ring = `var(--accent-orbit)` cyan — must switch to `#F4F7FA` bg + teal `#1FC8C0` focus ring |
| `src/components/common/PrimaryButton.tsx` | `primary` variant = dark `bg-accent-ignition`; `secondary` = dark `bg-space-panelRaised border-border-strong`; `ghost` = dark `hover:bg-space-panel` — these show on all setup screens |

### AppLayout — does NOT exist
`AppLayout.tsx` is referenced by the plan spec but does not exist in the codebase. The project currently uses `AppShell.tsx` as the layout shell (which has `variant='light'/'dark'`). No new AppLayout file is needed — `AppShell` already provides top nav + main content wrapper. What IS needed is a sidebar layout for MissionControlScreen specifically (the plan mentions a left icon sidebar), but current screens are simpler and don't use one. Decision: **do not create AppLayout** — use and upgrade the existing `AppShell` instead.

---

## Implementation Plan

---

- [ ] 1. **Token cleanup in `tailwind.config.js`** — Fix the teal value and add bg-app alias.

  **What to change:**
  - `spaceplus.accent.teal`: change `#00BCD4` → `#1FC8C0` (the exact approved Space+ teal)
  - `spaceplus.accent.tealLight`: change `#B2EBF2` → `#E8FAF9` (matching the teal light tint from product.md)
  - Add a `bg.app` entry under `colors`: `{ app: '#F4F7FA', card: '#FFFFFF' }` so `bg-bg-app` and `bg-bg-card` work in Tailwind
  - Keep ALL old dark tokens (`space.*`, `accent.ignition`, `accent.orbit`, etc.) for backward compat during migration — they'll be cleaned up after all files are migrated

  **File:** `tailwind.config.js`

  **Verify:** `npm run build` — no Tailwind compilation errors.

---

- [ ] 2. **CSS cleanup in `src/index.css`** — Switch body defaults to Space+ light theme.

  **What to change:**
  - In `@layer base → body`: change `background-color: var(--space-void)` → `background-color: var(--sp-bg-app)` (add `--sp-bg-app: #F4F7FA` to `:root`)
  - In `@layer base → body`: change `color: var(--text-primary)` → `color: var(--sp-text-heading)` (which is `#1A1D2E` per product.md; note existing `--sp-text-heading: #0D1B4B` — update the `:root` var to `#1A1D2E`)
  - In `@layer base → body`: change `font-family: 'Lexend'` → `'Nunito'` (Space+ approved font; keep Lexend as fallback)
  - In `@layer base → *:focus-visible`: change `outline: 2px solid var(--accent-orbit)` → `outline: 2px solid var(--sp-teal)` (teal `#1FC8C0`)
  - Add to `:root`: `--sp-bg-app: #F4F7FA;` and `--sp-teal: #1FC8C0;` (update existing `--sp-teal: #00BCD4` → `#1FC8C0`)
  - Update `.sp-card` selector: keep as-is (already correct)
  - Keep `.glass-panel`, `.hud-mono`, `.astra-starfield` — still used by AppShell dark variant and ResourceBar

  **File:** `src/index.css`

  **Verify:** `npm run build` — builds without errors. Dev server shows light background on app load.

---

- [ ] 3. **Fix `Panel.tsx` — make it a safe shim re-exporting Card** — prevents crashes for any Panel import still in the tree.

  **What to change:**
  Replace the entire `Panel.tsx` content with a shim that:
  - Keeps the same `PanelProps` interface and `PanelAccent` type so TypeScript doesn't error
  - Renders a `Card` with an appropriate `accent` mapping (`ignition` → `coral`, `orbit` → `teal`, `none` → `none`)
  - Renders the `title` prop as a `<h2>` inside the card (preserving the heading hierarchy)
  - Removes all `glass-panel` / `ACCENT_BORDER` with `border-accent-*` / `shadow-glow-*` classes
  - The component uses `as` prop if provided — keep this by wrapping the Card content in the as-element if needed

  **Concrete implementation:**
  ```tsx
  import { Card } from './Card'
  // PanelAccent → CardAccent mapping
  const ACCENT_MAP = { ignition: 'coral', orbit: 'teal', none: 'none' } as const
  export function Panel({ as, className, children, accent = 'none', title }) {
    const Tag = as ?? 'section'
    return (
      <Card accent={ACCENT_MAP[accent]} className={className}>
        <Tag>
          {title ? <header className="mb-3"><h2 className="font-display2 text-xl font-semibold text-spaceplus-text-heading">{title}</h2></header> : null}
          {children}
        </Tag>
      </Card>
    )
  }
  ```

  **File:** `src/components/common/Panel.tsx`

  **Verify:** `npx vitest run tests/unit/components/AstroPanel.test.tsx` — all AstroPanel tests pass (they test the heading "Astro-AI" rendered inside Panel via title prop).

---

- [ ] 4. **Fix `PrimaryButton.tsx` — update dark variants to Space+ tokens**

  **What to change:**
  The `VARIANT_CLASSES` map currently has dark tokens for `primary` and `secondary`:
  - `primary`: `bg-accent-ignition text-space-void hover:shadow-glow-ignition` → replace with `bg-spaceplus-accent-teal text-white hover:bg-spaceplus-accent-tealDark` (use teal as the primary CTA — `hint` and `primary` unify)
  - `secondary`: `bg-space-panelRaised text-text-primary border border-border-strong hover:border-accent-orbit/60` → replace with `bg-white text-spaceplus-text-heading border border-spaceplus-border-light hover:border-spaceplus-accent-teal hover:shadow-card`
  - `ghost`: `bg-transparent text-text-secondary hover:bg-space-panel hover:text-text-primary` → replace with `bg-transparent text-spaceplus-text-secondary hover:bg-spaceplus-surface hover:text-spaceplus-text-heading`
  - `hint` already correct (`bg-spaceplus-accent-teal text-white hover:bg-spaceplus-accent-tealDark`) — keep as-is

  Focus ring classes on `motion.button` already use CSS `focus-visible:outline-none` from the global CSS, so no change needed there.

  **File:** `src/components/common/PrimaryButton.tsx`

  **Verify:** `npx vitest run tests/unit/features/OnboardingScreen.test.tsx tests/unit/features/PlanetSelectionScreen.test.tsx` — all pass.

---

- [ ] 5. **Fix `ResourceBar.tsx` — replace old dark tokens**

  **What to change:**
  In `ResourceBar.tsx` find `hud-mono text-sm text-text-primary` on the value readout span and replace with `font-mono text-sm font-semibold text-spaceplus-text-heading tabular-nums`. Find any `text-text-secondary` or `text-text-muted` references and replace with `text-spaceplus-text-secondary` / `text-spaceplus-text-muted`.

  **File:** `src/components/charts/ResourceBar.tsx`

  **Verify:** `npm run build` — no TypeScript errors.

---

- [ ] 6. **Fix `EventCard.tsx` — replace Panel + old dark tokens**

  **What to change:**
  - Remove `import { Panel } from '@/components/common/Panel'`
  - Add `import { Card } from '@/components/common/Card'`
  - Replace `<Panel accent={accent} className="flex flex-col gap-4">` with `<Card accent={accent === 'ignition' ? 'coral' : 'teal'} className="flex flex-col gap-4">`
  - Replace `className={accent === 'ignition' ? 'text-accent-ignition' : 'text-accent-orbit'}` on the Lightning icon with `className={accent === 'ignition' ? 'text-spaceplus-status-error' : 'text-spaceplus-accent-teal'}`
  - Replace `font-display text-lg font-semibold text-text-primary` on `<h3>` with `font-display2 text-lg font-semibold text-spaceplus-text-heading`
  - Replace `text-text-secondary` on description with `text-spaceplus-text-secondary`
  - Change choice button variants: index 0 → `variant="hint"` (teal), index 1+ → `variant="secondary"` (already updated in step 4)

  **File:** `src/components/feedback/EventCard.tsx`

  **Verify:** `npx vitest run tests/unit/components/EventCard.test.tsx` — all pass.

---

- [ ] 7. **Fix `AstroPanel.tsx` — replace Panel accent="orbit" + dark bubble styles**

  **What to change:**
  - Remove `import { Panel } from '@/components/common/Panel'`
  - Add `import { Card } from '@/components/common/Card'`
  - Replace `<Panel accent="orbit" className="flex flex-col gap-4" title="Astro-AI">` with `<Card accent="teal" className="flex flex-col gap-4"><header className="mb-3"><h2 className="font-display2 text-xl font-semibold text-spaceplus-text-heading">Astro-AI</h2></header>`
  - Close with `</Card>`
  - Message bubble: replace `className="flex flex-col gap-1.5 rounded-lg bg-space-deep p-3"` → `className="flex flex-col gap-1.5 rounded-xl bg-spaceplus-surface border border-spaceplus-border-light p-3"`
  - Message text: replace `text-text-primary` → `text-spaceplus-text-body`
  - Science fact box: replace `border border-accent-orbit/30 bg-accent-orbit/5` → `border border-spaceplus-accent-teal/30 bg-spaceplus-accent-tealLight`
  - Science fact label: replace `text-accent-orbit` → `text-spaceplus-accent-tealDark`
  - Suggestion text: replace `text-text-secondary` → `text-spaceplus-text-secondary`
  - Empty state text: replace `text-text-muted` → `text-spaceplus-text-muted`
  - Typing indicator: replace `text-accent-orbit` → `text-spaceplus-accent-teal`
  - Ask button variants: change all from `variant="secondary"` → `variant="secondary"` (already updated in step 4, this stays as-is)

  **File:** `src/components/feedback/AstroPanel.tsx`

  **Verify:** `npx vitest run tests/unit/components/AstroPanel.test.tsx` — all pass. Specifically: "renders the Astro-AI panel heading" passes (title now rendered inside Card via header).

---

- [ ] 8. **Fix `ResourcePanel.tsx` — replace Panel + old dark tokens**

  **What to change:**
  - Remove `import { Panel } from '@/components/common/Panel'`
  - Add `import { Card } from '@/components/common/Card'`
  - Replace `<Panel title="Resources" accent="none" className="flex flex-col gap-4">` → `<Card className="flex flex-col gap-4"><header className="mb-3"><h2 className="font-display2 text-lg font-semibold text-spaceplus-text-heading">Resources</h2></header>`
  - Close with `</Card>`
  - Radiation row `border-t border-border-subtle pt-3` → `border-t border-spaceplus-border-light pt-3`
  - Crew row `border-t border-border-subtle pt-3` → `border-t border-spaceplus-border-light pt-3`
  - Crew icon `text-text-secondary` → `text-spaceplus-text-secondary`
  - `<span className="text-sm text-text-secondary">` → `text-spaceplus-text-secondary`
  - `<span className="hud-mono text-text-primary">` → `<span className="font-mono font-semibold text-spaceplus-text-heading tabular-nums">`

  **File:** `src/features/mission-control/ResourcePanel.tsx`

  **Verify:** `npm run build` — no errors.

---

- [ ] 9. **Fix `EnvironmentPanel.tsx` — replace Panel + old dark tokens**

  **What to change:**
  - Remove `import { Panel } from '@/components/common/Panel'`
  - Add `import { Card } from '@/components/common/Card'`
  - Replace the null-case `<Panel title="Environment" accent="none">` → `<Card><p className="text-sm text-spaceplus-text-muted">No planet selected.</p></Card>`
  - Replace the main `<Panel title="Environment" accent="none" className="flex flex-col gap-4">` → `<Card className="flex flex-col gap-4"><header className="mb-3"><h2 className="font-display2 text-lg font-semibold text-spaceplus-text-heading">Environment</h2></header>` … `</Card>`
  - Solar status label: `text-xs uppercase tracking-wide text-text-muted` → `text-xs uppercase tracking-wide text-spaceplus-text-muted`
  - Temperature icons: `text-sm text-text-secondary` → `text-sm text-spaceplus-text-secondary`
  - Temperature values: `hud-mono text-text-primary` → `font-mono font-semibold text-spaceplus-text-heading tabular-nums`
  - Fault divider: `border-t border-border-subtle pt-3` → `border-t border-spaceplus-border-light pt-3`
  - Fault label: `text-xs uppercase tracking-wide text-text-muted` → `sp-section-label` (or `text-xs uppercase tracking-wide text-spaceplus-text-muted`)
  - Nominal divider: `border-t border-border-subtle pt-3` → `border-t border-spaceplus-border-light pt-3`

  **File:** `src/features/mission-control/EnvironmentPanel.tsx`

  **Verify:** `npm run build` — no errors.

---

- [ ] 10. **Fix `EventPanel.tsx` — replace Panel for "All systems nominal" section**

  **What to change:**
  - Remove `import { Panel } from '@/components/common/Panel'`
  - Add `import { Card } from '@/components/common/Card'`
  - Replace `<Panel accent="none" className="flex items-center gap-3">` → `<Card className="flex items-center gap-3">`
  - Replace `</Panel>` → `</Card>`
  - The section heading `text-text-muted` → `text-spaceplus-text-muted`

  **File:** `src/features/mission-control/EventPanel.tsx`

  **Verify:** `npx vitest run tests/unit/features/MissionControlScreen.test.tsx` — "shows All systems nominal" test passes.

---

- [ ] 11. **Fix `MissionControlScreen.tsx` — replace Panel + old dark tokens throughout**

  This is the largest single file change. Detailed replacements:

  **Imports:**
  - Remove `import { Panel } from '@/components/common/Panel'`
  - Add `import { Card } from '@/components/common/Card'`

  **`HudSlot` component (lines ~127–153):**
  - `hud-mono text-sm text-text-secondary` → `font-mono text-sm text-spaceplus-text-secondary`
  - `text-text-muted` → `text-spaceplus-text-muted`
  - `text-lg font-bold text-text-primary` → `text-lg font-bold text-spaceplus-text-heading`
  - `hud-mono text-xs text-text-secondary` → `font-mono text-xs text-spaceplus-text-secondary`
  - Button variant `variant="primary"` → `variant="hint"` (teal)
  - Button variant `variant="secondary"` → keep `variant="secondary"` (updated in step 4)

  **`FloatingResourceBar` component (lines ~179–199):**
  - Replace `className="fixed bottom-0 left-0 right-0 z-40 bg-space-panel/95 backdrop-blur-sm border-t border-border-subtle px-4 py-3"` → `className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-spaceplus-border-light px-4 py-3"`
  - `hud-mono text-xs text-text-muted shrink-0` → `font-mono text-xs text-spaceplus-text-muted shrink-0`
  - Update `MiniProgressBar` colors from old dark palette to Space+ teal variants: oxygen `#1FC8C0`, water `#4DD0E1`, food `#66BB6A`, energy `#FFB300`

  **`JourneyMap` component — already uses `spaceplus-accent-teal` and `text-text-muted` mixed:**
  - `text-text-primary font-bold` → `text-spaceplus-text-heading font-bold`
  - `text-text-muted` → `text-spaceplus-text-muted`
  - `bg-border-subtle` on the vertical connector line → `bg-spaceplus-border-light`
  - The cosmic journey strip `background: 'linear-gradient(...)'` is fine — keep

  **Global error banner (line ~263):**
  - Replace `<Panel accent="ignition" className="flex items-center justify-between gap-3">` → `<Card accent="coral" className="flex items-center justify-between gap-3">`
  - `text-status-crit` → `text-spaceplus-status-error`
  - `text-text-primary` → `text-spaceplus-text-body`
  - Dismiss button classes: replace `text-text-secondary hover:text-text-primary focus-visible:ring-accent-orbit` → `text-spaceplus-text-secondary hover:text-spaceplus-text-heading focus-visible:ring-spaceplus-accent-teal`

  **Mission outcome banner (line ~290):**
  - Replace `<Panel accent={outcome==='success' ? 'orbit' : 'ignition'} ...>` → `<Card accent={outcome==='success' ? 'teal' : 'coral'} className="flex items-center justify-between gap-3">`
  - `text-status-good` → `text-spaceplus-status-success`
  - `text-status-warn` → `text-spaceplus-status-warning`
  - `text-status-crit` → `text-spaceplus-status-error`
  - `text-text-primary font-semibold` → `text-spaceplus-text-heading font-semibold`
  - View Debrief button: `variant="primary"` → `variant="hint"`

  **Mission Journey card (line ~324):**
  - Replace `<Panel title="Mission Journey" accent="orbit" className="p-4">` → `<Card className="p-4"><header className="mb-3"><h2 className="font-display2 text-lg font-semibold text-spaceplus-text-heading">Mission Journey</h2></header>`
  - Close with `</Card>`

  **Task checklist panel (line ~338):**
  - Replace `<Panel title="Mission Tasks" accent="none">` → `<Card><header className="mb-3"><h2 className="font-display2 text-lg font-semibold text-spaceplus-text-heading">Mission Tasks</h2></header>`
  - `text-text-muted` → `text-spaceplus-text-muted`
  - Close with `</Card>`

  **Star reward panel (line ~350):**
  - Replace `<Panel accent="none" className="flex items-center justify-between gap-3">` → `<Card className="flex items-center justify-between gap-3">`
  - `text-text-muted` → `text-spaceplus-text-muted`
  - `text-text-primary` (mission title) → `text-spaceplus-text-heading`
  - Close with `</Card>`

  **AppShell usage:**
  - Already uses `<AppShell title="Mission Control" hudSlot={...}>` without variant — add `variant="light"` to `<AppShell>` so MissionControlScreen gets the light background too

  **File:** `src/features/mission-control/MissionControlScreen.tsx`

  **Verify:** `npx vitest run tests/unit/features/MissionControlScreen.test.tsx` — all 12 tests pass.

---

- [ ] 12. **Fix `AppShell.tsx` — ensure dark variant never bleeds into light screens**

  **What to change:**
  - In the `darkClass` (only used when `variant === 'dark'`), keep `bg-space-void` — no change
  - In `lightClass`, change `bg-spaceplus-surface` → `bg-[#F4F7FA]` to match exact product.md `#F4F7FA` bg-app (or add `bg-bg-app` once step 1 token is in)
  - The dark header fallback class still references `bg-space-void/70 border-border-subtle/60` — keep, only shown when `variant='dark'` which is no longer used on any screen after step 11 makes MissionControlScreen `variant="light"`

  **File:** `src/components/layout/AppShell.tsx`

  **Verify:** `npx vitest run tests/unit/components/AppShell.test.tsx` — all 5 tests pass.

---

- [ ] 13. **Fix `chart-colors.ts` — update dark Recharts colors for debrief charts**

  The debrief `ResourceChart` uses `CHART_TOOLTIP_BG`, `CHART_GRID_COLOR` etc. which are deep-space dark values. These are used in `MissionDebriefScreen.tsx`.

  **What to change:**
  - `CHART_AXIS_COLOR`: `#A9B8D4` (dark secondary) → `#6B7280` (Space+ body text)
  - `CHART_GRID_COLOR`: `#243456` (dark border) → `#E5E7EB` (light border)
  - `CHART_TOOLTIP_BG`: `#121C33` (space panel) → `#FFFFFF`
  - `CHART_TOOLTIP_BORDER`: `#3A5180` (dark border) → `#E5E7EB`
  - `CHART_TOOLTIP_TEXT`: `#EAF1FA` (light on dark) → `#1A1D2E` (heading on light)
  - `CHART_COLORS.oxygen`: `#29E6F3` (orbit cyan) → `#1FC8C0` (Space+ teal)
  - Keep other chart line colors — they are status-semantic and readable on white

  **File:** `src/components/charts/chart-colors.ts`

  **Verify:** `npx vitest run tests/unit/features/MissionDebriefScreen.test.tsx` — all pass.

---

- [ ] 14. **Final build + full test run**

  Run the full test suite and production build to verify nothing is broken.

  **Commands:**
  ```
  npx vitest run
  npm run build
  ```

  **Expected:** All 219 tests pass; build completes with ~29 chunks, no TypeScript errors.

---

## Test Impact Assessment

### Tests that will NOT need changes (they test behavior via aria-labels, text content — not class names)
- `tests/unit/features/MissionControlScreen.test.tsx` — tests aria-labels and text content, not class names ✅
- `tests/unit/features/MissionDebriefScreen.test.tsx` — tests text content ✅
- `tests/unit/features/OnboardingScreen.test.tsx` — tests text/buttons ✅
- `tests/unit/features/PlanetSelectionScreen.test.tsx` — tests aria-pressed, text ✅
- `tests/unit/features/CrewSelectionScreen.test.tsx` — tests aria-labels, numbers ✅
- `tests/unit/features/BaseConfigurationScreen.test.tsx` — tests labels, slider aria ✅
- `tests/unit/components/AppShell.test.tsx` — tests heading level, sr-only class, button text ✅ (sr-only class test passes since Tailwind `sr-only` is a standard utility, not a custom class)
- `tests/unit/components/AstroPanel.test.tsx` — tests text content ("Astro-AI" heading, button labels) ✅ — will pass as long as the title prop is still rendered as a heading, which the Panel shim (step 3) and AstroPanel fix (step 7) both preserve
- `tests/unit/components/EventCard.test.tsx` — tests event title, choice buttons by aria-label ✅
- All simulation, store, AI unit tests — no UI changes ✅

### Tests that may need minor fixes
- None expected — the test strategy across this project is to assert by text content and aria-labels, never by CSS class names. The one `sr-only` class assertion in AppShell.test.tsx uses the standard Tailwind `sr-only` utility which is unchanged.

---

## Implementation Order (dependency-ordered)

1. `tailwind.config.js` — tokens first (everything else depends on correct token names)
2. `src/index.css` — body defaults (affects entire app appearance)
3. `src/components/common/Panel.tsx` — shim it (prevents all downstream Panel imports from crashing)
4. `src/components/common/PrimaryButton.tsx` — fix variants (used on every screen)
5. `src/components/charts/ResourceBar.tsx` — isolated chart component
6. `src/components/charts/chart-colors.ts` — isolated colors
7. `src/components/feedback/EventCard.tsx` — uses Panel + old tokens
8. `src/components/feedback/AstroPanel.tsx` — uses Panel + dark bubbles
9. `src/features/mission-control/ResourcePanel.tsx` — uses Panel
10. `src/features/mission-control/EnvironmentPanel.tsx` — uses Panel
11. `src/features/mission-control/EventPanel.tsx` — uses Panel
12. `src/features/mission-control/MissionControlScreen.tsx` — uses Panel in 5 places + dark tokens
13. `src/components/layout/AppShell.tsx` — lightClass `#F4F7FA` pin

---

## Files That Do NOT Need Changes

These are already fully Space+ compliant:
- `src/components/common/Card.tsx` ✅
- `src/components/common/SectionLabel.tsx` ✅
- `src/components/common/StarScore.tsx` ✅
- `src/components/common/StatusBadge.tsx` ✅
- `src/components/common/StatReadout.tsx` ✅
- `src/components/common/UserChip.tsx` ✅
- `src/components/common/TaskChecklistItem.tsx` ✅
- `src/components/common/StatusDot.tsx` ✅
- `src/components/charts/MiniProgressBar.tsx` ✅
- `src/features/missions/MissionsOverviewScreen.tsx` ✅
- `src/features/onboarding/OnboardingScreen.tsx` ✅
- `src/features/planet-selection/PlanetSelectionScreen.tsx` ✅
- `src/features/crew-selection/CrewSelectionScreen.tsx` ✅
- `src/features/base-configuration/BaseConfigurationScreen.tsx` ✅
- `src/features/mission-debrief/MissionDebriefScreen.tsx` ✅
- `src/components/layout/TopNavBar.tsx` ✅ (light variant already correct)
- `src/app/router.tsx` ✅ (no style concerns)
- All simulation, store, AI, hooks files ✅

---

## Key Design Decisions

1. **No new AppLayout file.** `AppShell` with `variant="light"` already provides the correct layout shell. Creating a third layout abstraction would increase complexity without benefit.

2. **Panel becomes a Card shim, not a delete.** Six files import `Panel`. Making it a shim means the implementation can fix files one at a time without cascading breaks. After all 6 are fixed, Panel can be deleted in a cleanup PR.

3. **`#1FC8C0` vs `#00BCD4`.** The product.md and this plan both specify `#1FC8C0` as the approved teal. The current tailwind config has `#00BCD4` (Material Design cyan-500). This difference is visible — `#1FC8C0` is slightly warmer/greener. All `spaceplus-accent-teal` usages throughout the codebase will pick up the corrected value automatically once the token is updated in tailwind.config.js (step 1).

4. **Body font: Nunito only.** All existing screens use `font-display2` (which maps to Nunito). The body default currently falls through to Lexend. After step 2 the body default becomes Nunito, making unlabeled text also Nunito. Lexend can remain in the config as a fallback.

5. **MissionControlScreen gets `variant="light"`.** Currently it uses AppShell with no variant (defaults to `dark`). After step 11, adding `variant="light"` brings it onto the Space+ light background. This also means the floating resource bar needs light styling (step 11 covers this).

6. **PrimaryButton `primary` → teal unification.** The `primary` and `hint` variants both should be teal in the Space+ system. Unifying them means any button using `variant="primary"` switches from orange/ignition to teal, which is correct for this app's audience. The dark starfield scenes no longer exist so there's no context where orange-on-dark made sense.
