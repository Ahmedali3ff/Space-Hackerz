# ASTRA — Design Specification

## Status: AWAITING USER DESIGN ASSETS

The visual design for ASTRA has not yet been supplied by the user.
This document will be updated once design references are received.

---

## Screen Inventory (Requirements-Derived)

The following screens are required based on the product specification.
Layout and visual treatment are TBD pending design handoff.

| Screen ID | Screen Name              | Route               | Status            |
|-----------|--------------------------|---------------------|-------------------|
| SCR-01    | Landing / Onboarding     | `/`                 | AWAITING DESIGN   |
| SCR-02    | Planet Selection         | `/select-planet`    | AWAITING DESIGN   |
| SCR-03    | Crew Selection           | `/select-crew`      | AWAITING DESIGN   |
| SCR-04    | Base Configuration       | `/configure-base`   | AWAITING DESIGN   |
| SCR-05    | Mission Control          | `/mission`          | AWAITING DESIGN   |
| SCR-06    | Mission Debrief          | `/debrief`          | AWAITING DESIGN   |

---

## UI Regions Required per Screen

### SCR-01: Landing / Onboarding
- Hero section: ASTRA title, tagline, mission briefing
- Role explanation: player is the mission commander
- Call to action: Begin Mission
- Navigation: none (entry point)

### SCR-02: Planet Selection
- Planet cards: Moon and Mars
- Each card: planet image, name, key environmental facts (3–5 bullet points)
- Selection state: highlighted / selected
- Navigation: Back to Onboarding, Continue to Crew Selection

### SCR-03: Crew Selection
- Crew size selector: 1–8 (interactive, with visual crew count indicator)
- Projected resource consumption summary (updated live as crew size changes)
- Navigation: Back, Continue to Base Configuration

### SCR-04: Base Configuration
- System configuration panels for:
  - Life Support (capacity slider or selector)
  - Water Recycling (capacity)
  - Food Supply (stored provisions, days)
  - Power Generation (capacity, kW)
  - Energy Storage (battery capacity, kWh)
  - Radiation Protection (shielding level)
  - Food Production / Agriculture (capacity)
- Projected mission duration indicator
- Navigation: Back, Launch Mission

### SCR-05: Mission Control
- Top bar: Mission Day counter, Planet name, Crew status
- Resource dashboard:
  - Oxygen (level, trend indicator, warning state)
  - Water (level, trend, warning)
  - Food (level, trend, warning)
  - Energy (level, trend, warning)
- Environmental conditions panel: active planet conditions
- Event panel: active event card with description + decision options
- Astro-AI panel: chat / explanation interface
- Phaser canvas: visual habitat scene (animated)
- Navigation: Advance Day button, Emergency controls

### SCR-06: Mission Debrief
- Mission outcome header (success / partial / failure)
- Duration summary
- Resource stability chart (Recharts line chart)
- Key decisions list (top 3 most impactful)
- Events that occurred
- Learning points section
- Navigation: Play Again (new mission), Return to Planet Selection

---

## Design Tokens (Placeholder — to be replaced from user design)

These are structural placeholders only. Final values come from user-supplied design.

```
Colors:
  --color-space-bg:     TBD (dark space background expected)
  --color-primary:      TBD
  --color-accent:       TBD
  --color-warning:      TBD (resource critical state)
  --color-danger:       TBD (resource depleted state)
  --color-text-primary: TBD
  --color-text-muted:   TBD

Typography:
  --font-display:  TBD (mission title, headers)
  --font-body:     TBD (readable for age 8+, minimum 16px base)
  --font-mono:     TBD (resource values, telemetry data)

Spacing scale: TBD from design

Border radius: TBD

Shadows / glow effects: TBD
```

---

## Component Mapping (to be filled after design handoff)

| Component               | Maps to Screen(s)           | Status          |
|-------------------------|-----------------------------|-----------------|
| PlanetCard              | SCR-02                      | NOT STARTED     |
| CrewSizeSelector        | SCR-03                      | NOT STARTED     |
| ResourceGauge           | SCR-05                      | NOT STARTED     |
| ResourceTrendIndicator  | SCR-05                      | NOT STARTED     |
| EventCard               | SCR-05                      | NOT STARTED     |
| DecisionButton          | SCR-05                      | NOT STARTED     |
| AstroAIPanel            | SCR-05                      | NOT STARTED     |
| SystemConfigPanel       | SCR-04                      | NOT STARTED     |
| MissionOutcomeBanner    | SCR-06                      | NOT STARTED     |
| ResourceHistoryChart    | SCR-06                      | NOT STARTED     |
| LearningPointCard       | SCR-06                      | NOT STARTED     |

---

## Design Handoff Checklist (to be completed when assets arrive)

- [ ] Receive design files (Figma, images, or references)
- [ ] Identify all screens and their states (default, warning, error, empty)
- [ ] Extract exact color values
- [ ] Extract typography scale (sizes, weights, line heights)
- [ ] Extract spacing system
- [ ] Extract border radius and elevation/shadow values
- [ ] Identify all icon assets required
- [ ] Identify all illustration / planet image assets
- [ ] Map every design component to a React component
- [ ] Identify any animations or transitions
- [ ] Note any responsive breakpoints specified
- [ ] Ask exactly one round of clarifying questions if ambiguous
- [ ] Implement and compare running app against design references
