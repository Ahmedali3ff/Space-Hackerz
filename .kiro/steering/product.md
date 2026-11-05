# ASTRA — Mission Control Academy: Product Definition

## Product Vision

ASTRA — Mission Control Academy is an interactive educational space mission simulation platform.
Students aged 8–12 become mission commanders responsible for managing a human space habitat.
They manage resources, respond to unexpected events, and make scientifically informed decisions.
Every meaningful decision produces a visible, explainable consequence in the simulation.

**Tagline:** Explore. Decide. Survive. Learn.

## Target Audience

- Primary: Students aged 8–12
- Secondary: Educators and parents supporting STEM learning
- Accessibility: Age-appropriate language, clear visual feedback, forgiving learning curve

## Primary Environments

| Environment | Key Characteristics |
|-------------|---------------------|
| Moon        | Extreme thermal cycling, no atmosphere, regolith dust, 14-day solar cycles |
| Mars        | Dust storms, thin CO₂ atmosphere, lower solar irradiance, longer day (sol) |

## Core Experience Loop

1. Player selects a destination planet (Moon or Mars)
2. Player selects a landing location on that planet (affects solar/thermal/dust)
3. Player configures crew size
4. Player configures mission duration (30 / 60 / 90 days-or-sols)
5. Player configures habitat systems (life support, power, food, water, radiation)
6. Mission begins — time advances, resources are consumed
7. Environmental events occur requiring player decisions
8. Player consults Astro-AI for scientific guidance
9. Mission concludes (success, partial, or failure) with a debrief report
10. Player reviews decisions and learning outcomes

## Approved Product Features

| ID   | Feature                      | Priority | Status       |
|------|------------------------------|----------|--------------|
| F01  | Onboarding                   | P0       | IN_PROGRESS  |
| F02  | Planet Selection             | P0       | IN_PROGRESS  |
| F03  | Crew Selection               | P0       | IN_PROGRESS  |
| F04  | Base Configuration           | P0       | IN_PROGRESS  |
| F05  | Mission Control (3D world)   | P0       | IN_PROGRESS  |
| F06  | Environmental Events         | P0       | PARTIAL (sim done, UI building) |
| F07  | Astro-AI Assistant           | P1       | EXISTS (service), integrating |
| F08  | Mission Debrief              | P1       | EXISTS (re-skinning) |
| F09  | Location Selection (NEW)     | P1       | NOT_STARTED  |
| F10  | Configurable Mission Duration (NEW) | P1 | NOT_STARTED  |

## Immersive 3D Direction (approved 2026-11-04)

ASTRA is a **fully immersive 3D experience**, not a 2D dashboard. The confirmed visual direction (per `docs/astra-redesign-report.md`):
- NASA-inspired mission control aesthetic, premium futuristic space exploration.
- React Three Fiber + drei + three as the 3D layer, in a decoupled `src/game3d/` folder with a typed event bus. The pure-TS simulation engine stays 100% untouched.
- A live 3D habitat/base is the hero of Mission Control — clicking a HUD subsystem flies the camera to it. The 3D world reacts to the simulation (dust storms raise fog, lunar night sweeps shadows, low oxygen dims modules).
- Mandatory 2D/CSS fallback when WebGL is unavailable; mandatory reduced-motion support; WCAG-AA + AAA body contrast baseline.
- Phaser 3 is retired (it was installed but never imported).

## User Journey (Happy Path)

```
Landing Screen
  └── Onboarding (who you are, what ASTRA is)
        └── Planet Selection (Moon or Mars)
              └── Location Selection (landing site — NEW)
                    └── Crew Selection (1–8 crew members)
                          └── Mission Configuration (duration 30/60/90 + systems setup)
                                └── Mission Control (immersive 3D, real-time management)
                                      ├── Environmental Events (decisions)
                                      ├── Astro-AI Consultation (learning)
                                      └── Mission Debrief (outcome + report)
```

## Out-of-Scope Features (V1)

- Multiplayer or collaborative missions
- Real-time NASA live telemetry feeds
- User accounts and persistent profiles
- Backend server / database (local-first only)
- Other planets beyond Moon and Mars
- Custom mission scripting by educators

> **Re-scoped into V1 (approved 2026-11-04):** 3D rendering / WebGL environments (React Three Fiber + drei + three, with a 2D/CSS fallback) and a committed accessibility baseline (WCAG-AA + AAA body contrast + reduced-motion + WebGL fallback) are now IN scope. See "Immersive 3D Direction" above.

## Design Source of Truth — APPROVED (Space+ Style)

The visual design is now **locked and approved** based on the user-supplied "Space+" reference image (provided 2026-11-04).

### Core Design Direction
- **Background:** Light `#F4F7FA` (NOT dark space navy — this is a key decision)
- **Primary accent:** Teal `#1FC8C0`
- **Cards:** White `#FFFFFF` with 16px border-radius, subtle shadow, 1px border `#E5E7EB`
- **Font:** Nunito (rounded, friendly, excellent for ages 8–12)
- **3D elements:** CSS gradient spheres + SVG illustrations (NOT WebGL/React Three Fiber)
- **Layout:** Top nav (logo + tabs + user chip) + left icon sidebar + main content area

### Color Palette
| Token | Hex | Use |
|-------|-----|-----|
| bg.app | #F4F7FA | App background |
| bg.card | #FFFFFF | Cards/panels |
| teal.DEFAULT | #1FC8C0 | Primary accent, CTAs, active states |
| teal.light | #E8FAF9 | Teal tint backgrounds |
| text.heading | #1A1D2E | Headings |
| text.body | #6B7280 | Body text |
| amber | #F5A623 | Stars, rewards, score |
| status.good | #10B981 | Success/healthy |
| status.warn | #F59E0B | Warning |
| status.crit | #EF4444 | Critical/failure |

### Typography
- **Nunito** — the only font. 400/500/600/700/800 weights.
- Headings: 700–800, #1A1D2E
- Body: 400–500, #6B7280
- Labels: uppercase, 11px, 0.08em letter-spacing, teal

### Component Language
- Cards: white, 16px radius, subtle shadow — NOT glassmorphic
- Buttons: teal primary, white secondary, ghost variants — NOT dark
- Progress bars: thin (8px), teal fill
- Status: icon + label (never color alone)
- Missions: progression system (complete/active/locked cards)

### Mission Progression System
ASTRA has a 6-mission story arc (3 Moon + 3 Mars) with task checklists, star ratings, and rewards — matching the Space+ "cosmic journey" pattern.
