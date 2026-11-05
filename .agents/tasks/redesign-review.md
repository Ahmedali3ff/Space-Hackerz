# ASTRA Redesign Report — Technical Design Review

**Reviewer:** Design review subagent (fresh review, no context that produced the report)
**Document reviewed:** `docs/astra-redesign-report.md`
**Cross-referenced against:** `.agents/tasks/audit.md`
**Date:** 2026-11-04

---

## Verdict Summary

| Count | Severity |
|-------|----------|
| 0 | HIGH |
| 0 | MEDIUM |
| 3 | NIT |

**Verdict: APPROVED.** All 10 required sections are present and substantively filled; the "Open Decisions for the User" section is present (and, per the review brief, is an intentional user-bound artifact, not a gap). The report's build/test numbers match the audit's real numbers exactly. Every proposed feature is classified EXISTS / NEEDS IMPROVEMENT / BUILD FROM SCRATCH. The report confirms `src/simulation/` stays pure TS and that 3D work will not violate that invariant. Existing working functionality is preserved with justified changes only (Phaser retirement is justified: never imported). Scientific separation is explicitly maintained. The MVP is kept lean with a clear vertical-slice cut line. Research is cited with URLs in sections 5 and 7. No hard rule is violated.

The three findings below are NITs — citation/completeness polish. None block implementation.

---

## Findings

### 1. [NIT] Section 5.2 — 3D version-pin peer-dep claims lack a citable source

**Problem:** §5.2 states specific npm peer-dependency facts — "`@react-three/fiber@9.8.2` peers `react >=19 <19.4`; `@react-three/fiber@8.17.10` peers `react >=18.0`" — and says they were "verified against npm registry peer deps." These facts are the load-bearing feasibility justification for the entire "Path A" pin strategy (avoiding a React 19 migration). The libraries themselves are cited with GitHub URLs in §5.1, but the specific peer-dep version ranges carry no URL and rely on an unnamed-elsewhere research doc (`research-3d.md`).

**Why NIT, not MEDIUM:** It is well established (and easy to confirm at install) that `@react-three/fiber` v8 is the React 18 line and v9 moved to React 19; the patch versions are install-time-confirmable details, and a wrong pin is trivially fixable. The core feasibility claim (an R3F line runs on React 18 without a framework migration) is sound.

**Concrete fix:** Add a one-line citation to the peer-dep source, e.g. append to §5.2: "Peer ranges confirmed against the npm registry ([react-three-fiber versions](https://www.npmjs.com/package/@react-three/fiber?activeTab=versions)); re-confirm exact pins at `npm install` time." This makes the claim independently checkable and keeps it honest.

### 2. [NIT] Section 6.1 — location-modified profile re-validation not explicitly stated

**Problem:** §6.1 proposes a location modifier that produces "a typed, documented delta applied to a copy of the planet profile before `SimulationEngine` is constructed," and classifies the existing `PlanetProfile` type and validation schema as "EXISTS (reuse)." The coding standards require that all data consumed by the simulation be validated; a programmatically modified profile is a derivation, but the report does not explicitly state that the modified `PlanetProfile` is re-validated through the existing Zod schema (`planet-profile.schema.ts`) before it reaches the engine.

**Why NIT, not MEDIUM:** The schema is explicitly marked as reused, which implies re-validation, and the modifier is pure TS returning a `readonly` profile. The gap is one sentence of explicitness, not a design hole.

**Concrete fix:** Add to §6.1: "The modified `PlanetProfile` is re-validated through the existing `planet-profile.schema.ts` (Zod) before being passed to `SimulationEngine`, preserving the 'all data validated with Zod before use' standard. The modifier helper is pure TS and imports no React/three." This keeps the data-validation invariant explicit alongside the purity invariant already stated.

### 3. [NIT] Section 6.2 — mission-duration scoring integration point is underspecified

**Problem:** §6.2 specifies that `missionDurationDays` becomes an additive engine config field and that `calculateMissionScore` is extended with a "completion ratio = `daysRun / missionDurationDays`" used in "the survival/efficiency component of the score," to be "re-validated against `docs/simulation-model.md`." The exact integration (e.g., whether the ratio is a multiplier on an existing component or a new component) and how it interacts with the existing 800/400 thresholds is not stated.

**Why NIT, not MEDIUM:** At design-doc resolution, naming the ratio, the component it affects, and the re-validation requirement is adequate; the precise formula is an implementation detail that the existing `simulation-model.md` and tests will pin down. The classification (engine field BUILD FROM SCRATCH additive; scoring NEEDS IMPROVEMENT; UI BUILD FROM SCRATCH) is clear and correct.

**Concrete fix:** Add one sentence to §6.2 stating the intended integration, e.g.: "The completion ratio is applied as a multiplier on the survival/efficiency sub-score (not as a new independent component), so a longer mission that survives longer is rewarded proportionally; the 800/400 outcome thresholds remain absolute. The exact weighting is finalized in `docs/simulation-model.md` and covered by new/updated `mission-scoring` unit tests." This removes the last ambiguity without over-specifying.

---

## Verified Assumptions

The following report claims were checked against source or the audit and confirmed accurate:

- **R3 (decisionLog latent bug) — VERIFIED against source.** Read `src/store/mission-store.ts` and `src/hooks/useMissionControl.ts`. `updateFromSimResult` sets `currentResources`, `currentMissionDay`, `activeFaultStates`, `activeEventIds`, `missionOutcome`, and `resourceHistory`, but does **not** set `decisionLog`. The inline comment claims "the hook reads `engine.getDecisionLog()` and injects it here on every step," which is false: `advanceDay`/`resolveEvent`/`emergencyRation` call only `updateFromSimResult(result.value)`, `SimulationResult` carries no log field, and the log is only set in `endMission(score, log)`. The store's `decisionLog` is empty during a live mission and only correct after `endMission()`. The report's characterization and fix proposal are correct.
- **Build/test numbers — VERIFIED against audit.** Report §4 / baseline: build exit 0, `✓ 678 modules transformed`, `✓ built in 5.29s`, `index-*.js 652.85 kB │ gzip: 186.99 kB`, chunk-size warning; tests exit 0, 14 files / 91 tests. Matches audit §5 exactly (audit names the file `index-DMRmL8Mw.js`; report uses `index-*.js` — same artifact).
- **Per-suite test counts — VERIFIED.** Report §2 AI "16 unit tests pass" = audit's 6 (astro-assistant) + 5 (knowledge-base) + 5 (astro-response.schema). Report §2 F08 debrief "7 component tests pass" = audit's `MissionDebriefScreen.test.tsx 7`. Report §2 "knowledge-base.ts (17 entries)" = audit's 17. (Note: `workflow.md` steering says "18-entry" — the report and audit agree on 17; the steering is the stale value, not the report.)
- **Classification coverage — VERIFIED.** Every proposed feature in §2, §3, §6, §8, and §10 carries an EXISTS / PARTIAL / PLACEHOLDER / NOT STARTED or NEEDS IMPROVEMENT / BUILD FROM SCRATCH classification, including the two new gameplay features (Location Selection, Configurable Mission Duration) and the 3D habitat.
- **Simulation purity + 3D non-violation — VERIFIED as stated.** §5.3 and §10 explicitly require `src/simulation/` to import no React/Zustand/Phaser/three and to use no `Date.now()`/`Math.random()`, state the audit confirmed this holds today, and state the 3D layer reads only a derived read-only `SimulationView` via an adapter in the application layer (never importing the engine directly). The dependency rule `presentation(game3d) → application → simulation` with no `simulation → React/three` edge is preserved.
- **Phaser retirement justification — VERIFIED.** §5.1 states Phaser is installed but never imported; the audit confirms grep for `from 'phaser'` returns no source matches. Removal is a `package.json` change with zero source impact. Not an unjustified replacement.
- **Existing functionality preserved — VERIFIED.** §10 "KEEP AS-IS" lists the entire simulation/data/AI core; the only simulation-layer edits proposed are additive (`missionDurationDays` config field, scoring ratio) and explicitly marked "touch with extreme care." Re-skinning the Debrief is a styling change, not a rewrite.
- **Scientific separation preserved — VERIFIED.** §6.1 and §7.8 require location modifiers classified `OBSERVED_DATA | DERIVED_PARAMETER | EDUCATIONAL_ASSUMPTION` and documented in `scientific-assumptions.md`; §7.8 requires the visual layer to be qualitatively faithful while numeric sim inputs stay the sourced, Zod-validated profiles. "Do not sacrifice scientific accuracy for visual effects" is explicitly honored.
- **MVP leanness — VERIFIED.** §9 defines a playable 2D/glass vertical slice after Phase R3 and a 3D vertical slice after R5; sound (§7.6) and postprocessing (§5.2) are marked optional/deferred/additive. No scope creep beyond the user's explicit 3D directive.
- **All 11 screens covered — VERIFIED.** §8.1–§8.11 enumerate Welcome, Planet Selection, Location Selection, Mission Configuration, Base Preparation, 3D Mission Control, Resource Management, Environmental Events, Decision Interfaces, Astro-AI, Mission Debrief.
- **Required §4 risk coverage — VERIFIED.** R1 bundle/chunk-size, R2 placeholder screens, R3 decisionLog, R4 WebGL fallback, R5 reduced-motion, R6 accessibility, R7 Phaser-vs-3D all present, plus R8–R12, with real build/test numbers.
- **Required §5 architecture coverage — VERIFIED.** 5.1 R3F+drei+three + Phaser disposition; 5.2 pins; 5.3 decoupling + `src/game3d/` + typed event bus; 5.4 asset loading; 5.5 performance budget; 5.6 WebGL fallback; 5.7 reduced-motion; 5.8 3D accessibility.
- **Required §10 coverage — VERIFIED.** New / modify / keep-as-is sections present; `src/simulation/` in keep-as-is; Phaser retirement under "Files to retire."
- **Research URLs — VERIFIED present** in §5 (pmndrs/react-three-fiber, pmndrs/drei, three.js GLTFLoader, google/draco, MDN WebGLRenderingContext, caniuse.com/webgl, MDN prefers-reduced-motion) and §7 (WCAG 1.4.3, WebAIM, Space Grotesk, Lexend, Space Mono, Material type scale, Apple HIG, Phosphor, Lucide, motion.dev, WCAG 2.3.3, NASA Images).

---

## Unverified / Wrong Assumptions

None that are wrong. Items deliberately left to the cited research doc or to install-time confirmation (and therefore not independently verifiable from the repo) are:

- **R3F/drei/three version peer-dep ranges (§5.2)** — not verifiable from in-repo source; backed by the named `research-3d.md` input. See Finding 1. This is an incompletely-cited researched claim, not a wrong one, and the underlying fact (an R3F line supports React 18) is well established.
- **Contrast-ratio estimates in §7.1** (e.g., "`≈ 6:1 on void`", "`≈ 10:1 on void`") — the report explicitly labels these "knowledge-based estimates to confirm during implementation," so they are not presented as verified facts. Sanity checks of the cited hex pairs against near-black backgrounds are consistent with the stated ratios. No defect.
- **"`src/simulation/planets/` currently exists but is empty" (§6.1)** — not independently verified, but non-consequential: whether the directory exists or not, the location modifier helper is correctly classified BUILD FROM SCRATCH and the recommendation is unchanged.

---

## Hard-Rule Check Results

| Hard rule | Result |
|-----------|--------|
| No invented capabilities; placeholders honestly labeled | PASS — placeholders explicitly labeled in §1/§2/§8; F01–F05 marked PLACEHOLDER, F06 PARTIAL, F07 EXISTS-not-integrated, F08 EXISTS. |
| Every proposed feature classified EXISTS / NEEDS IMPROVEMENT / BUILD FROM SCRATCH | PASS — §2, §6 (summary table), §8, §10. |
| Scientific accuracy not sacrificed for visuals; classifications kept separate | PASS — §6.1, §7.8. |
| MVP not overcomplicated | PASS — §9 cut line; sound/postprocessing deferred. |
| `src/simulation/` stays pure TS; 3D won't violate it | PASS — §5.3, §10. |
| Existing working functionality preserved (no unjustified replacements) | PASS — §1 framing, §10 keep-as-is; Phaser retirement justified (never imported). |
| Web-researched references cited with URLs (§5, §7) | PASS (with one NIT on peer-dep specificity — Finding 1). |
| Open Decisions section present | PASS — treated as intentional user-bound artifact per brief, not a gap. |

**Final verdict: APPROVED** (0 HIGH, 0 MEDIUM, 3 NIT).
