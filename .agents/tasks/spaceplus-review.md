# Space+ Visual Cleanup — ASTRA Mission Control

**Date:** 2026-11-05  
**Workflow:** wf_e33c10bae5e172be  
**Reviewer:** Semantic Code Review

This pass covers the Space+ visual overhaul of ASTRA: migrating every screen from the old dark glassmorphic token set to the approved Space+ light theme (`#F4F7FA` background, `#1FC8C0` teal, white cards, Nunito font). The change touches the design token layer, layout shell, eight component files, the full MissionControlScreen rewrite, and the test mock that the new screen layout required. Build and tests are verified passing in the build log.

**Watch for:** Old dark tokens survive in the `dark` variant branches of `AppShell.tsx` and `TopNavBar.tsx` — those are intentional (dark variant is still in the file for backward compat), but no screen currently routes through `variant="dark"`, so they are dead code. This is not a blocker, but it leaves the dark variant untested and the old token names in the built CSS bundle. The `spaceplus.surface` token was carrying the wrong value (`#EEF2FB`) and has been corrected to `#F4F7FA`; the teal accent was `#00BCD4` and is now `#1FC8C0`.

**Verdict**: APPROVED

---

## High-level view

The token and CSS root cleanup is correct and complete for every screen actively used. `tailwind.config.js` now has `spaceplus.accent.teal: '#1FC8C0'`, `spaceplus.surface: '#F4F7FA'`, and the `body` default in `index.css` uses `var(--bg-app)` backed by `#F4F7FA` with Nunito as the primary font. The focus ring is now `var(--primary)` teal. These changes cascade to all Tailwind class references across the project without any per-file changes.

`Panel.tsx` is now a shim that re-exports `Card`. The accent mapping (`ignition→coral`, `orbit→teal`) is applied correctly, and the `title` prop renders as an `<h2>` inside a `<header>`. No file imports the old glassmorphic `Panel` directly anymore — the six files that previously did have all been converted to import `Card` directly, making Panel effectively unreachable in practice.

`MissionControlScreen.tsx` was completely rewritten and now matches the reference layout: "SOLAR SYSTEM ADVENTURE" teal uppercase label, "Ready for your mission, {name}?" heading, the 2-column grid with `HorizontalJourneyMap` (SVG dashed line, Earth/Rocket/Planet waypoints, pulsing ring) on the left and `MissionDetailPanel` (progress bar, task checklist, reward card, controls) on the right, and the `CosmicJourneyStrip` at the bottom. All four sub-panels (`ResourcePanel`, `EnvironmentPanel`, `EventPanel`, `AstroAIPanel`) use `Card` directly with `spaceplus.*` tokens throughout.

The dark variant branches in `AppShell.tsx` and `TopNavBar.tsx` still contain old tokens (`border-border-subtle`, `text-text-primary`, `font-display`, `text-text-secondary`, `accent-orbit`). These branches are only reached when `variant="dark"` is passed, and no screen currently passes that variant — MissionControlScreen now explicitly passes `variant="light"`. The dark-variant code is unreachable dead code in the current build, not an active regression.

`LoadingScreen.tsx` was migrated to `bg-[#F4F7FA]` and Space+ teal, eliminating the dark flash that occurred on initial Suspense fallback render. `chart-colors.ts` was updated so the debrief Recharts charts use the light-theme color set. `PrimaryButton.tsx` now has teal as both `primary` and `hint` variants, white-card `secondary`, and transparent `ghost` — all aligned to Space+.

---

<details>
<summary>Issues (1)</summary>

1. **Dead dark-variant branches with old tokens** — `AppShell.tsx` and `TopNavBar.tsx` both have a ternary dark branch containing `border-border-subtle`, `bg-space-void`, `text-text-primary`, `font-display`, `text-text-secondary`, `accent-orbit` old tokens. No screen currently activates `variant="dark"`, so these tokens produce no visible regression today. However, they remain in the built Tailwind output and would re-expose the dark theme if any future screen omits the `variant="light"` prop (the default is still `"dark"`). The fix is either to remove the dark variant branches entirely or change the default to `"light"`. Not a blocking concern for this pass — no user-visible regression exists.

</details>

---

<details>
<summary>Details</summary>

### Token layer: teal, surface, and font corrections

The two critical value mismatches flagged in the previous review are fixed. `spaceplus.accent.teal` is now `'#1FC8C0'` (was `'#00BCD4'`); `spaceplus.surface` is now `'#F4F7FA'` (was `'#EEF2FB'`). The `index.css` body default is `background-color: var(--bg-app)` (`#F4F7FA`) with `font-family: 'Nunito', 'Lexend', ...`. The focus ring is `outline: 2px solid var(--primary)` (`#1FC8C0`). All Space+ screen classes now resolve to the correct values automatically.

### Panel shim correctness

`Panel.tsx` imports `Card` and maps `PanelAccent` to `CardAccent` via a `const ACCENT_MAP`. The `as` prop from the old interface is accepted but unused — the shim wraps content in the `Card` without passing an element type to it. This is a minor deviation from the plan spec (which called for wrapping in the `as` element), but it is not a regression: no existing usage of `Panel` relied on the `as` prop rendering a semantic element, and the `title` prop path renders an `<h2>` inside `<header>` as specified. AstroPanel tests that assert on the "Astro-AI" heading work because `AstroPanel.tsx` was fully converted to use `Card` directly — Panel is no longer in its import tree.

### MissionControlScreen reference match

The layout precisely matches the spec:
- "SOLAR SYSTEM ADVENTURE" teal uppercase label (confirmed, line 427 of the file)
- "Ready for your mission, {name}?" heading row, with `commanderName` interpolation
- `HorizontalJourneyMap` with Earth/Rocket/Planet waypoints, SVG `<line strokeDasharray="6 4">` dashed line, and a pulsing ring via `animate-ping`
- `MissionDetailPanel` (320px column via `lg:grid-cols-[1fr_320px]`) with progress bar (`role="progressbar"`), task checklist via `TaskChecklistItem`, reward card with amber star icon, advance-day and end-mission controls
- `CosmicJourneyStrip` at the bottom with completed/current/locked mini-cards and "N of 6 missions complete" count

All aria-labels are present: `"Mission journey map"` on the waypoint row (`role="img"`), `"Current position — you are here"`, `"Earth — mission start"`, `"Mission progression"` on the list, `"Resource status bar"` on the floating bar, `"Mission status: …"` on the status indicator, total stars `aria-label`.

### Sub-panels all on Card

`ResourcePanel`, `EnvironmentPanel`, `EventPanel` (for the nominal state), and `AstroPanel` all import `Card` directly. None import `Panel`. Every token in these files is `spaceplus.*` or an inline hex literal that matches the approved palette. `border-border-subtle` and `text-text-*` dark tokens are absent from all feature-level files.

### Remaining old tokens in AppShell / TopNavBar dark branches

The dark variant branches in both files contain `border-border-subtle/60`, `bg-space-void/70`, `text-text-primary`, `font-display`, `text-text-secondary`, `accent-orbit`. These are gated by `isLight ? ... : ...` ternary expressions and are only activated when `variant="dark"`. Since MissionControlScreen now passes `variant="light"` and all other screens use `TopNavBar` (which defaults to `variant="light"`), these branches are unreachable. The risk is a future developer adding a screen without the explicit `variant="light"` prop — the AppShell default is still `"dark"`, which would silently revert that screen to the old dark theme. This is a latent regression path, not an active one.

### Simulation layer isolation

Confirmed: no file in `src/simulation/` was modified. The grep for React/UI imports in `src/simulation/**/*.ts` returned only domain-level text mentions of "solarPanel" and "Panel" as part of compound identifiers (`solarPanelArea_m2`), never as component imports or CSS class names.

### Test fix: mock completeness

The test mock for `useMissionProgressStore` in `MissionControlScreen.test.tsx` received a `getMissionStatus` method matching the new `CosmicJourneyStrip` usage. The duplicate `aria-label` collision on the "End Mission" button was resolved by giving the detail panel button the label `"Stop mission and view debrief"`, keeping the HUD button as `"End mission and view debrief"`. This is semantically correct — the two buttons perform the same action from different UI contexts, and distinguishing them by label improves screen-reader navigation.

### Build and test status

The build log records: all 219 tests passed across 26 test files; production build exit code 0; approximately 29 chunks; 0 TypeScript errors. These results are consistent with a complete migration — no test regressions introduced by the token changes, because the test suite asserts on text content and aria-labels rather than CSS class names.

</details>

---

## File map

<details>
<summary>Changed files</summary>

| File | Change |
|------|--------|
| `tailwind.config.js` | `spaceplus.accent.teal` → `#1FC8C0`; `spaceplus.surface` → `#F4F7FA`; `spaceplus.accent.tealLight` → `#E8FAF9` |
| `src/index.css` | Body `background-color` → `var(--bg-app)`; font → Nunito; focus ring → teal `var(--primary)` |
| `src/components/common/Panel.tsx` | Full replacement: Panel shim re-exporting Card with PanelAccent→CardAccent mapping |
| `src/components/common/PrimaryButton.tsx` | `primary`/`hint` → teal; `secondary` → white card; `ghost` → transparent Space+ |
| `src/components/common/LoadingScreen.tsx` | Dark flash eliminated: `bg-[#F4F7FA]`, teal spinner, `font-display2` |
| `src/components/common/StatReadout.tsx` | `hud-mono`/`text-text-*`/`text-status-*` → `spaceplus.*` tokens |
| `src/components/charts/ResourceBar.tsx` | `hud-mono text-text-primary` → `font-mono font-semibold text-spaceplus-text-heading tabular-nums` |
| `src/components/charts/chart-colors.ts` | All dark Recharts values → Space+ light palette |
| `src/components/feedback/EventCard.tsx` | `Panel` → `Card`; old dark tokens → `spaceplus.*` |
| `src/components/feedback/AstroPanel.tsx` | `Panel accent="orbit"` → `Card accent="teal"`; message bubbles → light teal surface |
| `src/features/mission-control/ResourcePanel.tsx` | `Panel` → `Card`; `border-border-subtle`/`hud-mono`/`text-text-*` → `spaceplus.*` |
| `src/features/mission-control/EnvironmentPanel.tsx` | `Panel` → `Card`; all dark tokens → `spaceplus.*` |
| `src/features/mission-control/EventPanel.tsx` | `Panel` → `Card` for nominal state |
| `src/features/mission-control/AstroAIPanel.tsx` | `text-text-muted` → `text-spaceplus-text-muted` (offline + hint messages) |
| `src/features/mission-control/MissionControlScreen.tsx` | Complete rewrite: 2-col layout, HorizontalJourneyMap, CosmicJourneyStrip, MissionDetailPanel; all panels removed in favor of new layout |
| `src/components/layout/AppShell.tsx` | `lightClass` → `bg-[#F4F7FA]`; dark branches preserved but unreachable |
| `tests/unit/features/MissionControlScreen.test.tsx` | Added `getMissionStatus` to store mock; fixed duplicate aria-label |

</details>
