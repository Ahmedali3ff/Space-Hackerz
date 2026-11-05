# ASTRA — 3D Rendering Stack Research

**Task:** Research the 3D rendering stack for ASTRA, an educational web game pivoting from 2D Phaser to an immersive 3D experience for children aged 8–12.
**Workspace:** `c:\Users\HP\Desktop\NASA SPACE APPS`
**Date:** 2026-11-04
**Constraint:** Research only — no source/package/git/build changes. This is the only file written.

---

## 0. Method and sourcing note

Package versions and peer-dependency ranges below were verified live against the npm registry
(`https://registry.npmjs.org/<pkg>/<version>` and dist-tags) on 2026-11-04. Each verified fact is
tagged **[npm-verified]**. Canonical documentation URLs were confirmed to resolve (HTTP 200) and
are cited inline. Performance budgets, best-practice patterns, and accessibility guidance are
labeled **[general knowledge — standard R3F/three practice]** because no dedicated web search tool
was available in this environment; only targeted npm-registry and doc-URL fetches were performed
via `Invoke-WebRequest`. No claims about benchmark numbers are web-sourced; treat those as
experience-based recommendations to validate during implementation.

### Current stack confirmed from `package.json`
React `^18.3.1`, react-dom `^18.3.1`, react-router-dom `^6.30.6`, phaser `^3.90.0`,
recharts `^2.15.4`, zod `^3.25.76`, zustand `^4.5.7`, vite `^5.4.21`, typescript `^5.9.3`,
vitest `^2.1.9`, tailwindcss `^3.4.19`.

---

## ⚠️ Critical compatibility finding (read first)

The **latest** lines of the React Three Fiber ecosystem require **React 19**, but ASTRA is on
**React 18.3.1**. Verified peer dependencies:

| Package | Latest version | Peer: react | Peer: @react-three/fiber | Line |
|---|---|---|---|---|
| `@react-three/fiber` | `9.8.2` **[npm-verified]** | `>=19 <19.4` | — | React 19 |
| `@react-three/drei` | `10.7.9` **[npm-verified]** | `^19` | `^9.0.0` | React 19 |
| `@react-three/postprocessing` | `3.0.4` **[npm-verified]** | `^19.0` | `^9.0.0` | React 19 |
| `@react-three/fiber` | `8.17.10` **[npm-verified]** | `>=18.0` | — | **React 18** |
| `@react-three/drei` | `9.122.0` **[npm-verified]** | `^18` | `^8` | **React 18** |
| `@react-three/postprocessing` | `2.16.3` **[npm-verified]** | `>=18.0` | `>=8.0` | **React 18** |

dist-tags confirm: `@react-three/fiber` latest = `9.8.2` **[npm-verified]**; `@react-three/drei`
latest = `10.7.9` **[npm-verified]**.

**Implication:** two valid paths exist.

- **Path A (recommended for MVP):** stay on React 18, pin to the React-18-compatible line
  (`@react-three/fiber@~8.17.10`, `@react-three/drei@~9.122.0`,
  `@react-three/postprocessing@~2.16.3`). **No** migration of React / react-router / Recharts.
- **Path B (future):** upgrade React 18→19 to use `@react-three/fiber@^9` / `drei@^10` /
  `postprocessing@^3` and `three@^0.187`. This ripples into react-router (v6→v7 for full React 19
  support) and Recharts (v2→v3 for React 19 support) — a broader, riskier migration.

**Recommendation: Path A for the MVP.** It avoids a cross-cutting React 19 migration (React +
router + charts) that the brief explicitly warns against ("do not overcomplicate the MVP",
"prioritize a functional simulation over decorative features"). Document the React 19 upgrade as
a future task once the 3D experience and the rest of the app stabilize.

### `three` version pin caveat (Path A)
`three@0.187.0` is the latest **[npm-verified]** with no peer deps. However the postprocessing
**core** library (`postprocessing`, which `@react-three/postprocessing@2.16.3` bundles) caps
three:
- `postprocessing@6.36.5` → `three >=0.157.0 <0.172.0` **[npm-verified]**
- `postprocessing@6.37.0` → `three >=0.157.0 <0.175.0` **[npm-verified]**

So on Path A, pin `three` to **`~0.169.0`** (verified to exist **[npm-verified]**, and it satisfies
the `<0.172`/`<0.175` caps and the `>=0.137` drei floor). Use `@types/three@~0.169.x` as dev dep.
**Implementation step:** run the install and read the resolved `postprocessing` core version from
the lockfile to confirm the three cap; adjust the `three` pin if `@react-three/postprocessing`
resolves a different core. If bloom/atmosphere effects are deferred, the postprocessing dep can be
omitted entirely and `three` can float closer to latest.

---

## 1. 3D stack recommendation — React Three Fiber + drei + three

**Recommendation: adopt `@react-three/fiber` + `@react-three/drei` + `three` as the primary 3D
layer.** React Three Fiber (R3F) is the pmndrs React renderer for three.js — it renders three.js
objects as JSX and reconciles them inside the React tree
(https://github.com/pmndrs/react-three-fiber). `drei` is the companion helper library (cameras,
controls, loaders, `<Environment>`, `<Stars>`, `useGLTF`, `useProgress`, `Html` overlay, `Stats`)
(https://github.com/pmndrs/drei).

### Why R3F fits ASTRA
- ASTRA is React 18 + Vite 5 + TypeScript + Zustand. R3F is purpose-built for exactly this stack:
  the 3D scene lives in the React tree and can read the same Zustand app store the panels already
  use, with no separate render-loop plumbing.
- Declarative JSX meshes the 3D world into the existing component/props model and the project's
  "functional components, typed props" coding standards.
- `@types/three` gives full TypeScript typing; the project's `strict` + `no any` rules carry over.
- Massive ecosystem (drei) avoids hand-rolling loaders, controls, environment maps.

### Pros
- One rendering mental model; integrates with React state and Suspense for asset loading.
- Strong TS story; aligns with existing path-alias/module-boundary conventions.
- drei provides production-ready primitives (orbit controls, environment lighting, GLTF loader,
  performance monitors) so we write less glue code.

### Cons
- Bundle cost: `three` is large (~600 KB min); plus the reconciler and drei. Needs code-splitting
  (lazy-load the 3D route) — consistent with the already-known risk that the bundle is ~653 KB and
  needs chunk splitting.
- R3F is React-coupled by design, so the 3D layer **cannot** live in the pure-TS `simulation/`
  layer (which is already Phaser/React-free). This is fine and matches the architecture rules —
  the 3D layer is presentation, the simulation stays pure.
- GPU performance is scene-dependent; requires discipline (instancing, dpr caps, frameloop
  tuning) — covered in §5.

### Alternatives considered and rejected
- **Raw `three` only** (no R3F): more control, but reimplements scene graph management, suspense
  loading, and React integration by hand. More boilerplate, more divergence from the React state
  model ASTRA already uses. Rejected for an MVP that wants React-driven UI.
- **Babylon.js** (+ `react-babylonjs`): a heavier, more "engine-like" option with a smaller React
  ecosystem than R3F; larger bundle, different mental model. Rejected.
- **PixiJS / PlayCanvas**: PixiJS is 2D-only (not suitable for the immersive 3D brief);
  PlayCanvas is editor-centric and a poor fit for a code-first Vite/React project.
- **Keep Phaser**: Phaser is a 2D canvas/WebGL framework and cannot deliver the immersive 3D world
  the redesign requires. See §2.

---

## 2. Phaser 3 disposition — retire it (do not repurpose)

**Recommendation: remove `phaser` from the project. Do not repurpose it for mini-maps or UI
overlays.**

### Evidence
A repo-wide search for `phaser` found it in exactly two places: the `package.json` dependency
declaration, and the **defensive guard comments** ("NO React, Zustand, or Phaser imports") that
appear at the top of every `src/simulation/` and `src/ai/` file. There is **no actual
`import … from 'phaser'` statement in any source file**. The workflow state confirms Phaser scene
integration (GAME-007) was a pending/blocked task that was never executed.

**Conclusion:** Phaser is scaffolded but never wired into real code. Retiring it is a one-line
`package.json` removal plus a lockfile refresh, with **zero source impact**. The guard comments
can stay (harmless) or be trimmed to "NO React/Zustand imports" in a later cleanup.

### Why not repurpose (mini-maps / overlays)
- The brief warns against "unnecessary libraries and duplicated functionality." Running two GPU
  contexts (Phaser canvas/WebGL + three WebGL) doubles GPU/memory cost and adds a second
  animation system to maintain.
- HUD, mini-maps, and 2D overlays are better served by React DOM (optionally drei `<Html>` for
  in-canvas labels) and CSS — the existing pattern ASTRA already uses for panels. No Phaser needed.
- A stylized 2D starfield behind menus can be done with CSS or drei `<Stars>`; no second engine.

### Migration safety
Because no code imports Phaser, removal carries near-zero regression risk. The only check at
implementation time: `grep -r "phaser" src/` should return only the guard comments; verify none is
an actual import before deleting the dependency.

---

## 3. Decoupling — a dedicated 3D layer with a typed event bus

The `simulation/` layer must stay React/three-free (already enforced by guard comments and the
architecture rules: "NO: simulation → React"). The 3D layer is therefore **presentation**, kept in
its own folder, and talks to the application layer through a **typed event bus** — mirroring the
existing architecture decision that "game → application (via event bus)" and that the
game/canvas "does NOT directly import simulation engine."

### Proposed folder: `src/game3d/`
Prefer `src/game3d/` over `src/three/` (the latter reads like the library itself). Add a path
alias `@game3d/` in `vite.config.ts` + `tsconfig.json` alongside the existing aliases.

```
src/game3d/
  components/      # <PlanetCanvas/>, <HabitatModel/>, <EnvironmentSky/>, <ModuleMarker/>, <Fallback2DWorld/>
  scenes/          # MoonScene, MarsScene (planet-specific 3D composition)
  bus/             # event-bus.ts (typed pub/sub) + event-bus.types.ts (intent + event union)
  hooks/           # useReducedMotion, useWebGLAvailable, useSimulationView (read-only)
  adapters/        # app-to-3d adapter: subscribes app store -> 3D readable snapshot; emits intents -> app actions
  assets/          # asset registry (GLB URLs, texture URLs, manifest) + preloaders
  performance/     # quality tiers, dpr/instancing helpers, stats toggle
```

### Typed event bus contract
A minimal, dependency-free typed emitter (a small `mitt`-style pub/sub written locally — avoid
adding `mitt` to keep deps minimal per the brief). Two channels:

- **Intents (3D → application):** `moduleClicked`, `cameraFocusRequested`, `moduleHighlighted`,
  `planetReady`, `fallbackRequested`. The 3D layer emits intents; the application layer
  (`useMissionControl` / app store) translates them into simulation actions or navigation. The 3D
  layer **never** calls `SimulationEngine.step` directly.
- **View events (application → 3D):** `resourcesChanged`, `eventTriggered`,
  `environmentChanged` (dust storm / eclipse), `missionPhaseChanged`, `outcomeChanged`. The
  application layer publishes a **read-only** `SimulationView` snapshot; the 3D layer subscribes
  and updates meshes imperatively inside `useFrame` (not via React re-render per tick).

### Invariant ownership (explicit)
- **Simulation state truth:** owned by `SimulationEngine` (pure TS), unchanged.
- **App/UI state:** owned by Zustand app store (current screen, session handle, flags) —
  unchanged.
- **3D visual state (camera, highlight, particle intensity):** owned by `src/game3d/` locally.
- **Read-only contract:** the 3D layer receives a `SimulationView` (a derived, frozen snapshot of
  `SimulationState.resources`, active events, environment, day). It must not mutate it. The
  adapter (in `src/game3d/adapters/`) is the only bridge and is part of the application layer, not
  the simulation layer.

This keeps the existing dependency rules intact: `presentation(game3d) → application → simulation`,
with no `simulation → React/three` edge.

---

## 4. Asset loading — GLB/glTF, Draco/meshopt, KTX2, suspense progress UX

### Formats
- **3D models:** glTF/GLB for habitat modules, rover, solar arrays, crew figures, terrain props.
  Use drei `useGLTF` (Suspense-based, caches by URL) backed by three's `GLTFLoader`
  (https://threejs.org/docs/#examples/en/loaders/GLTFLoader).
- **Compression:** compress GLBs with **Draco** (geometry) and/or **meshopt** to cut download
  size; three ships `DRACOLoader`/`MeshoptDecoder`. Configure `useGLTL`/`GLTFLoader` with the
  decoder paths once at app init (Draco: https://github.com/google/draco; meshopt via
  three's `MeshoptDecoder`).
- **Textures:** planet albedo/normal/roughness, skybox/environment. Prefer **KTX2/Basis**
  (drei `useTexture` + `KTX2Loader`) for GPU-friendly compressed textures; keep power-of-two
  sizes. For the sky, use drei `<Environment>` with a NASA-inspired HDRI preset or a custom
  procedural sky + `<Stars>`.
- **Planet split:** ship two asset packs (Moon pack vs Mars pack). Only load the **selected**
  planet's pack (lazy `import()` / dynamic asset URLs) so initial download reflects one world.

### Loading strategy
- **Suspense + progress:** wrap the `<Canvas>` scene in a `<Suspense>` and use drei `useProgress`
  (exposes `loaded/total/progress`) to drive a branded NASA-style loading bar on the
  Onboarding / planet-load screen. drei also ships a `<Loader>` component as a quick default.
- **Preload:** call `useGLTF.preload(url)` for the next likely asset during the loading screen
  (e.g., preload the selected planet pack while the player confirms configuration).
- **Per-scene lazy mount:** mount the 3D `<Canvas>` only on screens that need it
  (Mission Control, debrief preview) and unmount on route change to free GPU memory. Use
  `frameloop="demand"` on low-interaction screens (debrief) so the renderer only redraws on
  change.

### Memory discipline [general knowledge — standard three practice]
- R3F auto-disposes scene objects added via JSX on unmount. GLTFs loaded via `useGLTF` are cached
  by URL and **not** auto-disposed — call `useGLTF.clear(url)` / `.dispose()` on the cache entry
  when leaving a planet scene to release geometry/material/texture GPU memory.
- Dispose textures explicitly when swapping sky/environment. Watch for lingering
  `RenderTarget`s from postprocessing — clear them on unmount.
- Target GPU memory for the active scene < 150 MB (see §5).

---

## 5. Performance budget

**Target frame rate:** 60 fps desktop, 30 fps low-end/mobile **[general knowledge — standard
target]**. Use drei `Stats` (off in production, on via a dev flag) to verify.

### Render loop discipline
- Use `frameloop="always"` **only** on the live Mission Control scene (continuous time/weather
  motion). Use `frameloop="demand"` on mostly-static screens (debrief 3D, planet selection
  globe) — a large CPU win because the renderer only draws on changes/interaction.
- Do **not** drive 3D animation through React state. Mutate three objects imperatively inside
  `useFrame` (positions, emissive intensity, particle counts). React re-renders per simulation
  tick should update only lightweight DOM panels, not the whole 3D tree.

### Draw-call & geometry budget [general knowledge — standard practice]
- Target **< 100 draw calls** for the 3D world on low-end.
- Use **instancing** (`<Instances>` / `InstancedMesh`) for repeated geometry: solar panel arrays,
  regolith rocks, antenna masts, crew helmets — anything duplicated.
- Merge static, non-instanced meshes where possible (`BufferGeometryUtils.mergeGeometries`) to
  cut draw calls. Keep the total distinct GLB count modest (one habitat, a few props, one rover).
- Cap total texture resolution: ≤ 2K for hero assets, ≤ 1K for small props.

### Device pixel ratio & responsive sizing
- Set `dpr={[1, 2]}` on `<Canvas>` to cap device pixel ratio (avoid the 3× DPR penalty on retina)
  **[general knowledge]**. The `<Canvas>` resizes to its parent automatically; give the parent a
  sized container and let it drive layout (no fixed pixel hacks).
- Use drei `<AdaptiveDpr>` / `<AdaptiveEvents>` and the `performance` prop to lower dpr
  gracefully if FPS drops.

### Device tiering
- drei depends on `detect-gpu` (confirmed in its dependency list **[npm-verified]**). Use it to
  classify devices into low/med/high at startup and pick a quality tier (shadow quality, dpr
  ceiling, particle density, environment-map resolution) — keep the functional simulation
  identical across tiers; only visual fidelity changes.

### Memory target
- < 150 MB GPU memory for the active scene; ≤ ~50 MB textures. Planet packs are mutually
  exclusive (only one loaded at a time) to keep the ceiling stable.

### Avoid React re-render churn
- 3D components read the `SimulationView` snapshot through a ref or via Zustand selectors with a
  `shallow` equality, so a resource tick does not re-render the 3D tree. Imperative `useFrame`
  reads the latest snapshot from a ref and updates meshes. This is the single most important
  performance rule for an R3F + Zustand game loop.

---

## 6. WebGL fallback — 2D/CSS mode when WebGL is unavailable

### Detection
- On app load (before mounting the `<Canvas>`), run an `isWebGLAvailable()` util: try
  `document.createElement('canvas').getContext('webgl2')` then `'webgl'` then
  `'experimental-webgl'`; if all return null, WebGL is unavailable
  (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext). Also treat an explicit
  `getContext('webgl2')` that returns a context but then fails to create a simple buffer/shader
  as "unusable."
- Store the boolean once in the app store (e.g., `renderMode: '3d' | '2d'`) so every screen reads
  the same decision. Re-evaluate only if the tab is restored after a GPU crash.
- WebGL support is near-universal on modern browsers (https://caniuse.com/webgl), but the tail
  (old/locked-down school machines, disabled drivers, some school Chromebooks) is exactly
  ASTRA's 8–12 school context — the fallback is mandatory, not optional.

### Fallback content
- Render a **`<Fallback2DWorld>`** in place of the `<Canvas>`: a CSS/SVG stylized 2D "mission
  control" backdrop (NASA-inspired gradients, iconography of the habitat, a schematic base
  layout) with the **same data dashboards** (resources, events, Astro-AI) the 3D screen uses.
- Because the critical data already lives in React DOM panels, the fallback is essentially "same
  panels, swap the 3D canvas for a 2D illustration." The **simulation engine is identical** — only
  the world view changes.

### Behavior
- Show a one-time, dismissible banner: "3D mode isn't available on this device — running 2D
  mode." Never hard-fail or block the mission; the simulation is the product, 3D is the
  enhancement.
- The fallback must itself honor reduced-motion (no CSS auto-animations) — see §7.

---

## 7. Reduced-motion — honor `prefers-reduced-motion` in 3D

Reference: MDN `prefers-reduced-motion`
(https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion, confirmed 200).

### Detection
- Read `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, subscribe to changes, and
  store a `reducedMotion` boolean in the app store. Pass it into the 3D layer as a prop/context so
  every animated effect can be gated.

### What to disable/reduce in 3D when reduced-motion is on
- Disable camera drift / auto-rotation / cinematic fly-throughs (camera stays fixed or moves only
  on direct user input).
- Disable particle systems (lunar dust drift, Martian dust-storm particles) — render a static
  dust overlay or none.
- Disable parallax and idle animation loops; reduce/disable bloom flicker and light pulsing.
- Prefer `frameloop="demand"` so the scene renders only on interaction (no continuous redraw).

### Data legibility invariant
- Reduced motion must **never** reduce data legibility. All numbers, gauges, event text, and
  Astro-AI guidance are in DOM panels and remain crisp and unchanged. Reduced-motion affects
  only decorative 3D motion, not the simulation data or UI. This keeps the experience usable for
  motion-sensitive children without hiding information.

---

## 8. Accessibility — 3D is enhancement; critical data lives in HTML

### Principle
The 3D canvas is a **visual enhancement**. Every piece of critical information (resource levels,
active events, decision options, Astro-AI guidance, mission score, decision log) must **also**
exist in accessible React DOM — which is already the architecture (panels around the canvas).
The canvas is supplementary, not the source of truth.

### Structure
- Give the `<Canvas>` an `aria-label` / `role="img"` describing the current scene (e.g., "3D view
  of the lunar habitat; solar panels deployed"), or mark it `aria-hidden` if a separate text
  summary panel is present. Never rely on the canvas to convey a value the DOM doesn't also show.
- All decisions (event choices, Astro-AI consultation) are reachable via standard DOM
  `<button>`/form controls with visible focus and keyboard operability. A decision must **never**
  be reachable only by clicking something in the 3D canvas — provide a DOM list/buttons equivalent
  (e.g., a "Modules" list) for every clickable 3D module.
- Color is never the sole signal: 3D color states (green/amber/red module glow) must also be
  represented as text/icon in the DOM panels. This aligns with WCAG (use of color).
- Maintain AA color contrast (4.5:1) in the DOM panels; keep focus indicators visible.

### Reduced-motion + fallback compose
- Reduced-motion (§7) + WebGL-unavailable (§6) compose: a device can hit any combination of
  flags. The app must degrade gracefully in each — the simulation and data remain fully
  functional in all four states (3D+motion, 3D+reduced, 2D+motion, 2D+reduced).

### Validation caveat
Full WCAG conformance requires manual testing with assistive technologies (screen readers,
keyboard-only, voice control) and expert accessibility review — automated checks alone are not
sufficient. Flag this for the QA phase (Phase 10).

---

## Recommendations summary

1. **3D stack:** `@react-three/fiber` + `@react-three/drei` + `three`, as a new `src/game3d/`
   presentation layer with a `@game3d/` path alias and a typed event bus to the application layer.
2. **Pin set (Path A, MVP, React 18-compatible):** `three@~0.169.0`,
   `@react-three/fiber@~8.17.10`, `@react-three/drei@~9.122.0`,
   `@react-three/postprocessing@~2.16.3` (optional, for bloom/atmosphere), `@types/three@~0.169.x`
   (dev). Verify the resolved `postprocessing` core three-cap from the lockfile at install time.
3. **Phaser:** remove it. It is declared but never imported anywhere in `src/`; retiring it is
   safe, cheap, and removes a duplicate 2D engine the redesign doesn't need.
4. **Decoupling:** `simulation/` stays pure TS; `game3d/` is presentation; a typed event bus
   carries intents (3D→app) and read-only `SimulationView` snapshots (app→3D). The 3D layer never
   calls the simulation engine directly.
5. **Assets:** GLB + Draco/meshopt + KTX2 textures; per-planet lazy packs; drei `useProgress` for
   a branded loading bar; dispose GLTF cache on scene transitions.
6. **Performance:** 60 fps desktop / 30 fps low-end; < 100 draw calls; instancing + mesh merging;
   `dpr={[1,2]}`; `frameloop="demand"` on static screens; device-tiering via drei's `detect-gpu`;
   never animate via React state — mutate in `useFrame`.
7. **WebGL fallback:** detect at load, render `<Fallback2DWorld>` (same DOM panels, 2D
   illustration) with a one-time banner; simulation unaffected.
8. **Reduced-motion:** gate camera drift, particles, parallax, bloom flicker on
   `prefers-reduced-motion`; keep `frameloop="demand"`; never reduce data legibility.
9. **Accessibility:** 3D canvas is `aria-hidden`/`role="img"`; all critical data duplicated in DOM;
   no decision reachable only via 3D; no color-only signals; full WCAG needs manual AT testing.
10. **Future:** upgrade React 18→19 (+ react-router 6→7, Recharts 2→3) to move to R3F v9 /
    drei v10 / three latest. Do this after the 3D experience and app stabilize, not as part of
    the MVP.

---

## References

Package metadata (npm registry, verified 2026-11-04):
- `@react-three/fiber@9.8.2` peer deps — https://registry.npmjs.org/@react-three/fiber/9.8.2
- `@react-three/fiber@8.17.10` peer deps — https://registry.npmjs.org/@react-three/fiber/8.17.10
- `@react-three/fiber` dist-tags — https://registry.npmjs.org/@react-three/fiber
- `@react-three/drei@10.7.9` peer deps — https://registry.npmjs.org/@react-three/drei/10.7.9
- `@react-three/drei@9.122.0` peer deps — https://registry.npmjs.org/@react-three/drei/9.122.0
- `@react-three/drei` dist-tags — https://registry.npmjs.org/@react-three/drei
- `@react-three/postprocessing@3.0.4` peer deps — https://registry.npmjs.org/@react-three/postprocessing/3.0.4
- `@react-three/postprocessing@2.16.3` peer deps — https://registry.npmjs.org/@react-three/postprocessing/2.16.3
- `three@0.187.0` — https://registry.npmjs.org/three/0.187.0
- `three@0.169.0` — https://registry.npmjs.org/three/0.169.0
- `postprocessing@6.36.5` / `6.37.0` three caps — https://registry.npmjs.org/postprocessing/6.36.5 , https://registry.npmjs.org/postprocessing/6.37.0

Documentation (URLs confirmed resolving HTTP 200 on 2026-11-04):
- React Three Fiber (pmndrs) — https://github.com/pmndrs/react-three-fiber
- drei (pmndrs) — https://github.com/pmndrs/drei
- three.js GLTFLoader — https://threejs.org/docs/#examples/en/loaders/GLTFLoader
- three.js docs — https://threejs.org/docs/ (probed 200)
- MDN `prefers-reduced-motion` — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion (confirmed 200)
- MDN WebGLRenderingContext — https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext (confirmed 200)
- Can I use WebGL — https://caniuse.com/webgl
- Draco mesh compression — https://github.com/google/draco

Project evidence (read during this research, not modified):
- `package.json` (current stack + Phaser dependency)
- Repo-wide `phaser` search: only `package.json`/`package-lock.json` + the "NO Phaser imports"
  guard comments in `src/simulation/` and `src/ai/`; **no `import … from 'phaser'`** in source.
- No `src/game3d/` folder exists yet (clean slate for the new 3D layer).

Note: performance budgets, instancing/dpr/frameloop patterns, and accessibility guidance are
labeled `[general knowledge — standard R3F/three practice]` because this environment had no
dedicated web-search tool; only targeted npm-registry and canonical-doc fetches were performed via
`Invoke-WebRequest`. Validate benchmark-style numbers during implementation.
