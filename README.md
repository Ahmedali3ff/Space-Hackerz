# ASTRA — Mission Control Academy

**Explore. Decide. Survive. Learn.**

An interactive educational space mission simulation for students aged 8–12.
Become a mission commander. Manage your habitat on the Moon or Mars.
Make scientifically informed decisions. Survive the unexpected.

---

## Status

🚧 **Under active development** — See [docs/team-workflow.md](docs/team-workflow.md) for setup instructions.

Current phase: **Phase 1 — Requirements and Architecture**

---

## What is ASTRA?

ASTRA puts students in the role of a mission commander managing a human space habitat.

- Select your destination: **Moon** or **Mars**
- Configure your crew (1–8 members)
- Set up habitat systems: life support, water recycling, power, food, radiation protection
- Manage daily resources as your mission advances
- Respond to real-world-inspired events (dust storms, radiation alerts, power failures)
- Consult **Astro-AI** for age-appropriate scientific explanations
- Complete your mission and review what you learned

---

## Scientific Foundation

ASTRA uses verified NASA data sources wherever possible:
- NASA Planetary Fact Sheets (Moon, Mars)
- LRO CRaTER radiation measurements
- Curiosity RAD instrument data
- ISS life support reference parameters

All simulation values are classified and documented:
- `OBSERVED_DATA` — from a verified NASA measurement
- `DERIVED_PARAMETER` — calculated from observed data
- `EDUCATIONAL_ASSUMPTION` — simplified for educational purposes

See [docs/scientific-references.md](docs/scientific-references.md) and [docs/scientific-assumptions.md](docs/scientific-assumptions.md).

---

## Quick Start (Development)

```bash
npm install
cp .env.example .env
npm run dev
```

See [docs/team-workflow.md](docs/team-workflow.md) for the full guide.

---

## Project Structure

```
src/simulation/   ← Pure TypeScript simulation engine (no React, fully testable)
src/features/     ← Feature screens (onboarding, planet selection, mission control...)
src/game/         ← Phaser 3 visual game scenes
src/ai/           ← Astro-AI educational assistant
src/data/         ← NASA datasets with Zod validation
docs/             ← Architecture, scientific references, simulation model
.kiro/specs/      ← Requirements, design spec, implementation task list
```

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full technical architecture.

Key principles:
- **Simulation engine is independent from React** — fully testable in Node.js
- **No backend required** — local-first, all state in-browser
- **Scientific honesty** — no invented "NASA data", all assumptions documented
- **Graceful AI degradation** — app works without an AI API key

---

## NASA Space Apps Challenge

This project was developed for the NASA International Space Apps Challenge.

---

## License

MIT
