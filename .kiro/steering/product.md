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
2. Player configures crew size
3. Player configures habitat systems (life support, power, food, water, radiation)
4. Mission begins — time advances, resources are consumed
5. Environmental events occur requiring player decisions
6. Player consults Astro-AI for scientific guidance
7. Mission concludes (success, partial, or failure) with a debrief report
8. Player reviews decisions and learning outcomes

## Approved Product Features

| ID   | Feature               | Priority | Status       |
|------|-----------------------|----------|--------------|
| F01  | Onboarding            | P0       | NOT_STARTED  |
| F02  | Planet Selection      | P0       | NOT_STARTED  |
| F03  | Crew Selection        | P0       | NOT_STARTED  |
| F04  | Base Configuration    | P0       | NOT_STARTED  |
| F05  | Mission Control       | P0       | NOT_STARTED  |
| F06  | Environmental Events  | P0       | NOT_STARTED  |
| F07  | Astro-AI Assistant    | P1       | NOT_STARTED  |
| F08  | Mission Debrief       | P1       | NOT_STARTED  |

## User Journey (Happy Path)

```
Landing Screen
  └── Onboarding (who you are, what ASTRA is)
        └── Planet Selection (Moon or Mars)
              └── Crew Selection (1–8 crew members)
                    └── Base Configuration (systems setup)
                          └── Mission Control (real-time management)
                                ├── Environmental Events (decisions)
                                ├── Astro-AI Consultation (learning)
                                └── Mission Debrief (outcome + report)
```

## Out-of-Scope Features (V1)

- Multiplayer or collaborative missions
- Real-time NASA live telemetry feeds
- 3D rendering / WebGL environments
- User accounts and persistent profiles
- Backend server / database (local-first only)
- Other planets beyond Moon and Mars
- Custom mission scripting by educators
- Accessibility features beyond basic (V1 baseline only)

## Design Source of Truth

The user will supply visual design references separately.
Until those are received, no final visual identity decisions are made.
All placeholder UI must be clearly labeled as placeholder.
