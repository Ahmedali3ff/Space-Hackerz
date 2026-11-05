# ASTRA — Visual & UX Design Research Notes

**Task:** Visual/UX design-direction research for ASTRA (educational 3D space-base survival game, ages 8–12).
**Author role context:** Senior 3D Experience Designer + UI/UX Design Lead.
**Status:** RESEARCH ONLY — no files modified except this notes file.

---

## 0. Scope, Method & Important Caveats

**Web access in this step: UNAVAILABLE.** This subagent was not given a web-search tool, so the recommendations below are **knowledge-based**, written from established design practice and clearly labeled as such. Inline citations point only to **canonical reference URLs** I am highly confident exist (WCAG, NASA, WebAIM, Material, Apple HIG, MDN, library docs). They are **not freshly re-verified this session** — treat the URLs as starting points, not as freshly loaded pages. Any contrast ratio given is an **approximate estimate** to be confirmed with a contrast checker (e.g. WebAIM) before implementation.

**Why these notes are grounded, not invented:** I read the actual project before writing. Current visual state confirmed:
- `tailwind.config.js` is empty — `theme: { extend: {} }`. No custom colors, fonts, spacing, shadows, or animations. This is the direct root cause of the "generic admin dashboard" look.
- `src/index.css` contains only the three Tailwind directives — no global theme, fonts, or CSS custom properties.
- The one implemented screen (`MissionDebriefScreen.tsx`) uses default Tailwind classes (`bg-gray-900`, `bg-gray-800`, `bg-blue-600`, `text-gray-300`, `border-gray-700`) with hardcoded chart colors (`#60A5FA`, `#34D399`, `#FBBF24`, `#F87171`). Textbook generic dashboard.
- **No 3D layer exists.** Phaser 3 is installed but integrated into zero screens.
- **Conflict to flag:** the stored `product.md` lists "3D rendering / WebGL environments" as **Out-of-Scope (V1)**, but the user's directive explicitly demands "a fully immersive 3D experience." Per workflow rules the verbatim user request wins. The redesign report must resolve this — it is an architecture decision, not a color decision. See §10.

Design intent throughout: **NASA-inspired mission control + premium futuristic space exploration + immersive planetary 3D, readable and inviting for ages 8–12 — never a generic admin dashboard.**

---

## 1. Color Palette — NASA Mission-Control Inspired

### 1.1 Design intent
NASA flight control rooms historically used **amber phosphor CRTs on near-black**; modern mission consoles use **cyan/white readouts on deep blue-black**. The premium space-exploration look (Artemis/SpaceX-adjacent) layers **deep navy space + a warm "ignition" accent + cool "orbit" cyan data accent**. For ages 8–12 we keep the dark, immersive space mood but raise contrast above the minimum so young readers never strain, and we separate **brand accent** from **status semantics** so color is never ambiguous.

### 1.2 Concrete tokens (hex + contrast rationale)

**Deep-space backgrounds (layered for depth, all dark-blue tinted, not flat gray):**

| Token | Hex | Use | Rationale |
|---|---|---|---|
| `--space-void` | `#060912` | App/page background (deepest) | Near-black with blue tint; avoids the flat "gray-900 dashboard" feel. White text ≈ 16–19:1 (AAA). |
| `--space-deep` | `#0B1224` | Large background areas / scene vignette | One step up; separates content zones from void. |
| `--space-panel` | `#121C33` | Cards / panels (base surface) | Reads as a raised console panel, not a gray box. |
| `--space-panel-raised` | `#1B2A4A` | Elevated cards, hover, active panel | Subtle lift via lightness, not heavy shadow. |
| `--border-subtle` | `#243456` | Default panel borders | Low-contrast structure; visible on dark. |
| `--border-strong` | `#3A5180` | Focused / active borders | ~3:1 against panel for focus visibility (WCAG 1.4.11 non-text). |

**Accents (brand + data):**

| Token | Hex | Use | Rationale |
|---|---|---|---|
| `--accent-ignition` | `#FF6B35` | Primary CTA, active/selected, brand action | Warm "thrust" orange — energetic, kid-friendly, **distinct from warning yellow**. ≈ 6:1 on void (passes AA for large/bold text & button bg with dark text). |
| `--accent-orbit` | `#29E6F3` | Data readouts, secondary accent, links, HUD lines | Modern cyan HUD; ≈ 10:1 on void. Pairs with orange for the signature space look. |
| `--accent-starlight` | `#EAF1FA` | High-emphasis headings / primary text on dark | Near-white with cool tint; ≈ 16:1 (AAA). |

**Status semantics (color is **never** the sole signal — always pair with icon + label):**

| Token | Hex | Semantic | Note |
|---|---|---|---|
| `--status-good` | `#46E6A0` | Healthy / nominal (oxygen, power OK) | Mint-green; distinct from cyan data accent. |
| `--status-warn` | `#FFC93C` | Caution / depleted soon | Warm yellow — deliberately different hue from the orange CTA. |
| `--status-crit` | `#FF5A5F` | Critical / failure | Coral red; ≈ 5.5:1 on deep. |
| `--status-info` | `#29E6F3` | Informational | Reuses orbit-cyan (info ≠ warning). |

**Text ramp:**
- Primary text `#EAF1FA` (≈16:1 on void, AAA)
- Secondary text `#A9B8D4` (≈7:1 on deep, AAA)
- Muted text `#7E8DAB` (≥4.5:1 on deep, AA — use only for non-essential labels; avoid for instructions kids must read)

**Contrast principle for this audience:** for body copy that 8–12-year-olds must read, **target AAA (7:1)**, not just AA (4.5:1). Younger readers, distraction, and varied screens all benefit from headroom. Verify every pairing with WebAIM before shipping. *(Knowledge-based; WCAG 1.4.3 Contrast — https://www.w3.org/TR/WCAG21/#contrast-minimum; checker: https://webaim.org/resources/contrastchecker/)*

### 1.3 Why this is not "another gray dashboard"
Three deliberate moves: (1) backgrounds are **blue-tinted, layered, and luminous**, not flat `gray-900`; (2) a **signature orange↔cyan accent pair** gives an instant "space mission" identity instead of default Tailwind blue; (3) **status colors never collide with the brand accent** so kids always know what a color means.

---

## 2. Typography

**Goal:** maximum readability for ages 8–12, with a futuristic-but-friendly hierarchy.

**Recommended pairing (two custom fonts + one mono, all free, variable):**
- **Headings / display — "Space Grotesk"** (700/600): geometric, modern, on-theme "space" identity, premium feel without being childish. *(https://fonts.google.com/specimen/Space+Grotesk)*
- **Body / UI — "Lexend"** (400/500/600): designed specifically to improve reading proficiency; excellent for children and low-confidence readers. Alternative: **"Nunito"** (rounded, very friendly) if a softer look is wanted. *(https://fonts.google.com/specimen/Lexend)*
- **Numeric readouts / telemetry — "Space Mono" or "JetBrains Mono"**: gives the mission-control HUD feel for resource numbers, counters, coordinates. *(https://fonts.google.com/specimen/Space_Mono)*

Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.

**Sizing (larger than typical web default — sized for kids):**
| Role | Size | Weight | Line-height |
|---|---|---|---|
| H1 (screen title) | 40–48px | 700 | 1.1 |
| H2 (section) | 28–32px | 600 | 1.2 |
| H3 (card title) | 22–24px | 600 | 1.3 |
| Body | **18px** (min 16px) | 400 | 1.6 |
| Large body / instructions | 20px | 500 | 1.55 |
| Button / CTA | 18px (min 16px) | 600–700 | — |
| Numeric readout | 20–28px | 600 (mono) | — |

**Hierarchy rule:** build hierarchy from **size + weight + color + spacing together**, never from color alone. Keep instructions short; chunk information; avoid walls of text. *(Knowledge-based; readability guidance aligned with Apple HIG legibility and Material type scale — https://m3.material.io/styles/typography/type-scale, https://developer.apple.com/design/human-interface-guidelines/typography)*

---

## 3. Spacing & Shape Language

**Spacing scale (8px base, consistent rhythm):** `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Default gap between cards 16–24px; internal card padding 16–24px; section spacing 32–48px.

**Shape — rounded but premium (the sweet spot for 8–12):**
- Cards / panels: **12px** (`rounded-xl`) — friendly without being babyish.
- Large hero panels / modals: **16px** (`rounded-2xl`).
- Buttons / tags / pills: fully round **999px** or **10px**.
- **Avoid** sharp `0–4px` (too admin) and ultra-round `28px+` (too toddler). 12–16px is the target.

**Touch targets (critical for kids):**
- Min interactive target **48×48px** (prefer 56px for primary CTAs). WCAG 2.5.8 (AA, WCAG 2.2) requires ≥24×24; we exceed it because children's motor control and small screens benefit. *(https://www.w3.org/TR/WCAG22/#target-size-minimum)*
- Min gap between adjacent interactive elements **12px**.
- Hit areas can exceed visible size (invisible padding).

**Elevation / depth:** prefer **subtle borders + low-opacity glow** over heavy drop shadows. Use a soft outer glow (`box-shadow: 0 0 0 1px var(--border-subtle), 0 8px 30px -12px rgba(0,0,0,0.8)`) plus an accent-tinted glow on focused/active elements. This reads as "lit console panel," not "Material card."

**Glassmorphism for HUD panels:** translucent fills (`rgba(18,28,51,0.72)`) + `backdrop-filter: blur(12px)` over the live 3D scene. This is what visually **connects the UI to the 3D world** instead of floating opaque cards over a static background — a core requirement from the user.

---

## 4. Iconography

- **Style:** filled or duotone, rounded, expressive, consistent 2px stroke; **not** thin-line corporate icons.
- **Recommended library:** **Phosphor Icons** (open-source, MIT; offers `duotone`/`fill`/`bold` variants that read friendly and on-theme) or **Lucide** (clean, consistent, tree-shakeable). Pick **one** and use it everywhere — mixing icon styles is a top anti-pattern. *(https://phosphoricons.com/, https://lucide.dev/)*
- **Sizes:** 24px standard, 32px nav/hero, 20px inline. Stroke 2px (1.75 for dense).
- **Color:** icons inherit semantic status colors; an icon is **always paired with a text label** for status (color + icon + label, never color alone). This is both an accessibility and a kid-comprehension rule.

---

## 5. Motion / Animation Principles

**Principle:** motion is **meaningful** — it communicates state change, spatial relationship, cause→effect, and feedback. It is never decorative noise. The user specifically asked for "meaningful animations and transitions," and to avoid making it "just a background behind ordinary cards."

**Categories & concrete patterns:**
- **Route/screen transitions (400–600ms):** fade + slight scale/dolly so screens feel like a camera moving through a base, not page reloads. Use `AnimatePresence` (Framer Motion) keyed on route.
- **Micro-interactions (150–300ms):** button press scale `0.97`, hover lift, focus ring glow, toggle springs.
- **Data feedback (300–500ms):** resource bars animate fill on change, numbers **count up/down** (tick) instead of jumping, status color transitions.
- **Event emphasis:** incoming event card slides in with an accent glow + subtle scale; critical events get a brief shake/pulse.
- **3D↔UI sync:** selecting a subsystem in the HUD flies the 3D camera to it and outlines it (see §7). This is the signature "playable, not background" motion.

**Easing:** `ease-out` for entrances, `ease-in` for exits, spring (gentle, not bouncy) for playful feedback. Avoid `linear` for organic motion.

**Library choice:** **Framer Motion** (`motion`) for orchestrated/layout/route animations + 3D-card transforms; plain **CSS transitions / Tailwind keyframes** for simple hovers. Framer Motion is the React-standard choice; adding one animation lib is justified, but keep CSS for the trivial cases. *(https://motion.dev/)*

**Reduced-motion (mandatory, not optional):** respect `prefers-reduced-motion: reduce`. On reduce: disable non-essential transforms/parallax/loops, make transitions instant or cross-fade-only, **never** remove informative content or the ability to perceive state changes. Provide a manual "reduce motion" toggle in settings too. *(https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion, https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)*

---

## 6. Sound (Optional)

- **Ambient:** a low-volume space drone / soft hab-hum for immersion. Default **off or very low**; always behind a master mute toggle. Respect browser autoplay policies — **no audio before a user gesture.**
- **UI feedback:** short confirmations for actions, distinct warning/critical tones, a success chime. Keep volumes low and never startle.
- **Implementation:** prefer **Web Audio API** procedural tones (tiny, no asset weight) over many sample files; a small curated set is enough for V1. Keep a single mute control in the HUD and persist the choice.
- **Scope note:** sound is explicitly optional in this research; if included, it is additive only and must degrade gracefully (mute is always one tap away).

---

## 7. 3D Material / Lighting / Atmosphere Direction

This is the section that most directly answers "make the 3D world feel like an actual playable space mission, not a background behind cards."

### 7.1 Engine decision (architecture flag — not just visual)
The project has **Phaser 3** installed, which is a **2D** WebGL engine. The user's directive demands **true immersive 3D**. To deliver that, the redesign needs a real 3D engine. Recommendation:

- **Primary recommendation: Three.js via `@react-three/fiber` (R3F) + `@react-three/drei`.** Rationale: declarative, React-native integration with the existing Vite/React stack, rich helper ecosystem (drei: `Environment`, `OrbitControls`, `ContactShadows`, postprocessing, `Html` for anchored labels), and it composes cleanly with the Zustand store and event bus already specified in `architecture.md`. *(https://docs.pmnd.rs/react-three-fiber, https://docs.pmnd.rs/drei)*
- **Alternative: Babylon.js** — more "game engine" out of the box (scene graph, physics) but heavier and a bigger departure from the React-centric architecture. Only choose if the team wants a heavier all-in-one engine.
- **Not recommended:** trying to force Phaser into pseudo-3D — it will not satisfy the "immersive 3D" directive and adds complexity without the payoff.

> This is a real architecture decision with bundle/performance/fallback implications. It belongs in the redesign report (output #5). I flag it here because the visual direction is inseparable from the engine choice.

### 7.2 Lighting (per-environment, physically based)
- **Moon:** harsh directional **sun** (sharp, high-contrast shadows, very low ambient — no atmosphere), cold blue-white key light, a soft cool **earthshine** fill (the "Earth in the sky" bounce), near-black shadow craters. The 14-day solar cycle → long, sweeping shadow motion over the mission, reinforcing time passage.
- **Mars:** dimmer warm orange **sun**, dusty **atmospheric scatter** (peach/orange fog), softer shadows than the Moon (thin atmosphere diffuses light), pinkish sky tint. **Dust storms dynamically raise fog density and drop light intensity** — a direct visual tie to the simulation's "solar-power reduction during storms" mechanic.

### 7.3 Materials (PBR metalness/roughness)
- **Habitat:** brushed metal, white thermal panels, glass canopies with subtle Fresnel reflections, emissive screen/panel inserts, foil-like insulation (anisotropic specular). PBR so lighting reads correctly across the day/night and storm states.
- **Moon regolith:** fine gray powder, high roughness, subtle crater displacement/normal maps, bright at high sun, near-black in shadow.
- **Mars ground:** rusty iron-oxide, rolling dust, scattered rocks; dust drift particles.

### 7.4 Atmosphere & post-processing (use sparingly — premium, not gimmicky)
- **Bloom** on emissive panels, lights, stars, and the sun (the "glow" that sells the space look).
- Subtle **vignette** to focus attention; **very mild** depth-of-field only on focus shots; **no** heavy chromatic aberration or film grain (distracting for kids).
- **Starfield:** real instanced points; on the Moon, a large **Earth marble** in the black sky and the Sun as a bright bloom point — a strong, iconic "you are there" cue.
- **Particle systems:** drifting dust, solar-panel glints, life-support vent steam, footprint/rover puffs — small, diegetic life.

### 7.5 Camera = the "playable" core
- **Orbit camera** around the base: drag to rotate, scroll to zoom (clamped), tilt limited. The base is the hero; the player **moves the camera** to inspect systems — this is what makes it a game, not a slideshow.
- **Focus dollies:** clicking a HUD subsystem (e.g. "Power System") **smoothly flies the camera to the solar arrays** and outlines them. Clicking an active **event flies the camera to the affected module** with a warning glow. This 1:1 HUD↔3D sync is the single most important technique to satisfy "playable space mission, not a background behind cards."

### 7.6 Performance & fallback (must be designed in, not bolted on)
- **Performance:** instancing for repeated geometry (panels, stars), LOD for distant detail, lazy/async scene asset loading, cap `devicePixelRatio` (e.g. ≤2), pause the render loop when the tab is hidden, frustum culling, separate the R3F canvas into its own lazy-loaded route chunk.
- **WebGL unavailable / low-end:** detect WebGL support; fall back to a **stylized 2D illustrated scene** (static illustrated base + animated CSS layers) so the simulation is fully playable without 3D. Never let the 3D layer gate core gameplay. *(This mirrors the architecture rule "AI must degrade gracefully" — the 3D layer must too.)*
- **Bundle caution:** Recharts alone is ~653 KB minified (noted project risk). A 3D engine adds more. **Code-split aggressively**: 3D scene + Recharts (or a lighter chart lib) in their own lazy chunks; load the 3D scene only on the Mission Control route. Consider replacing Recharts with a lighter option (custom SVG or `visx`) given the chart needs are simple line charts — flag for the performance review.

---

## 8. Anti-Patterns to Avoid

1. **Generic admin dashboard** — flat `gray-900`/`gray-800` panels, dense tables, no depth, no atmosphere. (This is the current state and exactly what the user rejected.)
2. **Data density that overwhelms 8–12** — too many numbers, tiny fonts, cramped tables. Limit primary "glance" metrics to ~4–5; use progressive disclosure for detail.
3. **Color-only meaning** — never signal status by color alone; always color + icon + label (accessibility + kid comprehension).
4. **Accent/status collisions** — e.g. using amber for both the primary CTA and "warning." The proposed palette deliberately separates ignition-orange (action) from warning-yellow (status).
5. **Walls of text** — chunk, use icons, short sentences; kids skim.
6. **Static background behind cards** — the 3D must be interactive and **tied to the UI** (camera focus, system outlines).
7. **Gratuitous motion** — anything that distracts, loops busily, or risks motion sickness; no parallax that fights the user.
8. **"Premium" dark themes that fail readability** — low-contrast dark UIs look cool but hurt kids; target AAA for body copy.
9. **Heavy, unsplit bundles** — shipping Recharts + a 3D engine in the main chunk. Code-split; provide a 2D fallback.
10. **Ignoring reduced-motion / WebGL fallback** — both are mandatory, not optional.
11. **3D as eye-candy with no gameplay tie-in** — every 3D highlight should map to a real simulation element.
12. **Inconsistent design language** — mixed icon sets, varying radii, ad-hoc spacing, magic hex codes inline. All tokens must live in `tailwind.config.js` + CSS custom properties.
13. **Tiny touch targets** — under 48px for kids.

---

## 9. Design Token → Implementation Mapping (how this lands in THIS codebase)

The redesign is mostly **defining the missing design system**, then replacing generic classes with tokens. Concrete landing points:

- **`tailwind.config.js`** — populate `theme.extend` with the palette above (`colors.space.*`, `colors.accent.*`, `colors.status.*`), `fontFamily` (Space Grotesk / Lexend / mono), `borderRadius` scale, `boxShadow` (glow elevations), `animation`/`keyframes` (enter, pulse, shake, count-up), and `backgroundImage` gradients. This single file flips the project from "generic" to "designed."
- **`src/index.css`** — add CSS custom properties mirroring the tokens (enables runtime theming + 3D/Recharts color sync), import the Google Fonts (`<link>` with `preconnect` in `index.html`), set base `background: var(--space-void)`, `color: var(--text-primary)`, `font-family`, `font-size: 18px`, and a global `prefers-reduced-motion` block.
- **`index.html`** — font preconnect + the two/three font links.
- **`MissionDebriefScreen.tsx`** — replace `bg-gray-900/800`, `text-gray-300`, `bg-blue-600`, hardcoded chart hex with tokens; the chart colors become `--status-good/--accent-orbit/--status-warn/--status-crit` so charts share one language with the HUD.
- **New 3D layer** — a lazy `MissionScene` (R3F) inside `src/game/` per the architecture's game→application boundary, loaded only on `/mission`, with a 2D fallback component when WebGL is absent.
- **New shared component library** (`src/components/`): `Panel` (glass), `StatReadout`, `ResourceBar`, `StatusBadge`, `PrimaryButton`, `EventCard`, `AstroPanel`, `ScreenTransition` — all token-driven, replacing the bespoke classes in current screens.

---

## 10. Conflicts & Findings to Flag for the Redesign Report

1. **3D scope conflict (HIGH).** Stored `product.md` marks "3D rendering / WebGL environments" as **Out-of-Scope (V1)**. The user directive explicitly wants **a fully immersive 3D experience**. Verbatim user request wins. The report must explicitly re-scope V1 to include 3D (R3F) with a 2D fallback, and update `product.md`/`architecture.md` accordingly. This changes the stack (adds `three`, `@react-three/fiber`, `@react-three/drei`) and the Phase-6/7 task plan.
2. **No design system exists.** `tailwind.config.js` is empty and `index.css` is bare. The "redesign" is, at its core, **authoring the design system** then re-skinning. This is why it currently looks like a generic dashboard — there is literally no design language defined.
3. **Bundle risk (known).** Recharts ~653 KB minified; adding a 3D engine compounds it. Recommend code-splitting + a lighter chart option; the performance review (parent output #5) should quantify.
4. **Only one real screen exists** (`MissionDebriefScreen`); the other 10 screens are `PlaceholderScreen` stubs. The screen-by-screen redesign (parent output #8) is mostly greenfield, which is an opportunity to apply one consistent language from scratch.
5. **Accessibility baseline:** the stored product lists only "basic" accessibility for V1. Given the 8–12 audience, I recommend committing to WCAG AA (with AAA body-contrast) plus reduced-motion + WebGL fallback as baseline, not stretch goals.

---

## 11. Illustrative Application to Key Screens (brief — full screen-by-screen is the parent report's job)

- **Welcome / Main Menu:** 3D base idle scene as living background (slow orbit cam, twinkling stars, Earth/Sun), large title in Space Grotesk with an ignition-orange accent, single primary "Begin Mission" CTA (56px, pill, ignition-orange, dark text). Feels like a game title screen, not a landing page.
- **Planet Selection:** two large interactive 3D planet cards (Moon / Mars) rotating gently; selecting one flies camera closer and tints the HUD accent. Contrast: planet choice is spatial and tactile, not a dropdown.
- **Mission Control (hero screen):** the live 3D base is the stage; glass HUD panels dock to edges (resource bars, clock). Clicking a subsystem dollies the camera + outlines it; an active event pulses the affected module and slides an `EventCard` in from the side. Numbers count up in mono readouts. This is the screen that must *not* look like a dashboard.
- **Astro-AI Assistant:** a floating glass panel with a gentle cyan glow and typing indicator; answers appear word-by-word (reduced-motion: instant). Reads as a crew "comms" channel, not a chatbot widget.
- **Mission Debrief:** (existing screen — re-skin) replace gray panels with space panels + status colors; outcome banner uses status-good/warn/crit with icon+label; resource charts use the shared status/accent tokens; a subtle 3D "mission recap" flythrough could close the loop (optional, fallback-safe).

---

## References

> All URLs below are **canonical references from established knowledge, not freshly re-verified this session** (web search was unavailable to this subagent). Use them as authoritative starting points.

- WCAG 2.1 — Contrast (Minimum) 1.4.3: https://www.w3.org/TR/WCAG21/#contrast-minimum
- WCAG 2.2 — Target Size (Minimum) 2.5.8: https://www.w3.org/TR/WCAG22/#target-size-minimum
- WCAG 2.1 — Animation from Interactions 2.3.3 (reduced motion): https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- MDN — `prefers-reduced-motion`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Material Design 3 — Type scale: https://m3.material.io/styles/typography/type-scale
- Apple Human Interface Guidelines — Typography: https://developer.apple.com/design/human-interface-guidelines/typography
- NASA Images (imagery reference for moon/Mars lighting & surfaces): https://images.nasa.gov/
- Google Fonts — Space Grotesk: https://fonts.google.com/specimen/Space+Grotesk
- Google Fonts — Lexend: https://fonts.google.com/specimen/Lexend
- Google Fonts — Space Mono: https://fonts.google.com/specimen/Space_Mono
- Phosphor Icons: https://phosphoricons.com/
- Lucide Icons: https://lucide.dev/
- Framer Motion (motion): https://motion.dev/
- react-three-fiber docs: https://docs.pmnd.rs/react-three-fiber
- drei docs: https://docs.pmnd.rs/drei
- Three.js: https://threejs.org/

---

*End of research notes.*
