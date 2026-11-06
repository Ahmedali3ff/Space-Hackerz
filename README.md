# ASTRA — Mission Control Academy

**Explore. Decide. Survive. Learn.**

An interactive educational space mission simulation for students aged 8–12.
Become a mission commander. Manage your habitat on the Moon or Mars.
Make scientifically informed decisions. Survive the unexpected.

---

## Features

✨ **8-Mission Campaign** — Progress through a story-driven mission arc from first lunar steps to the ultimate 90-sol Mars expedition

🎮 **Interactive 2D Gameplay** — Control an astronaut character, explore your habitat, and interact with critical systems using Phaser 3

🌍 **Location Selection** — Choose your landing site on the Moon or Mars — each location affects solar exposure, temperature, and dust levels

🤖 **Astro-AI Assistant** — Get real-time scientific explanations and mission advice powered by NASA data

📊 **Mission Debrief** — Review your decisions, resource management, and mission score with detailed charts and insights

---

## How to Run

### Development Mode

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## Game Controls

| Key | Action |
|-----|--------|
| **WASD** or **Arrow Keys** | Move astronaut |
| **E** | Interact with building/system |
| **Esc** | Pause game |
| **Click** | UI interactions |

---

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety and developer experience
- **Vite** — Fast build tool and dev server
- **Phaser 3** — 2D game engine for interactive gameplay
- **Tailwind CSS** — Utility-first styling
- **Zustand** — Lightweight state management
- **Zod** — Runtime validation for NASA data and AI responses
- **Recharts** — Mission debrief visualizations
- **Vitest** — Unit and integration testing

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

## Known Limitations

- **Local-only** — No multiplayer or collaborative missions (V1)
- **2 planets** — Moon and Mars only (Earth and other destinations are out of scope for V1)
- **No custom scripting** — Educators cannot create custom missions in V1
- **WebGL required** — The Phaser 3 gameplay layer requires WebGL support (2D fallback is not yet implemented)
- **English only** — No internationalization support in V1

---

## Browser Support

ASTRA requires a modern browser with WebGL support:
- **Chrome 90+** ✅
- **Firefox 88+** ✅
- **Edge 90+** ✅
- **Safari 15+** ✅

---

## NASA Space Apps Challenge

This project was developed for the NASA International Space Apps Challenge.

---

## License

MIT
