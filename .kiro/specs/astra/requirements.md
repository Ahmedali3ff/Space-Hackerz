# ASTRA — Functional and Non-Functional Requirements

## Functional Requirements

### FR-01: Onboarding
| ID      | Requirement                                                                 | Priority |
|---------|-----------------------------------------------------------------------------|----------|
| FR-01-1 | The application must display a welcome screen explaining ASTRA's purpose   | P0       |
| FR-01-2 | The onboarding must explain the player's role as mission commander          | P0       |
| FR-01-3 | All onboarding text must be written at a reading level suitable for age 8+ | P0       |
| FR-01-4 | The player must be able to skip onboarding on repeat visits                | P1       |

### FR-02: Planet Selection
| ID      | Requirement                                                                       | Priority |
|---------|-----------------------------------------------------------------------------------|----------|
| FR-02-1 | The player must be able to select Moon as a mission destination                   | P0       |
| FR-02-2 | The player must be able to select Mars as a mission destination                   | P0       |
| FR-02-3 | Each planet must display key environmental facts before selection                 | P0       |
| FR-02-4 | Planet selection must set the active PlanetProfile in the simulation engine       | P0       |
| FR-02-5 | Moon and Mars must use independent, non-interchangeable environmental parameters  | P0       |

### FR-03: Crew Selection
| ID      | Requirement                                                                        | Priority |
|---------|------------------------------------------------------------------------------------|----------|
| FR-03-1 | The player must be able to select a crew size between 1 and 8                     | P0       |
| FR-03-2 | Crew size must directly affect oxygen, water, and food consumption rates           | P0       |
| FR-03-3 | The UI must display the projected daily resource consumption before confirming     | P0       |
| FR-03-4 | Crew size selection must be passed to the simulation engine before mission start   | P0       |

### FR-04: Base Configuration
| ID      | Requirement                                                                             | Priority |
|---------|-----------------------------------------------------------------------------------------|----------|
| FR-04-1 | The player must be able to configure life support system capacity                      | P0       |
| FR-04-2 | The player must be able to configure water recycling system capacity                   | P0       |
| FR-04-3 | The player must be able to configure food supply (stored provisions)                   | P0       |
| FR-04-4 | The player must be able to configure power generation capacity                         | P0       |
| FR-04-5 | The player must be able to configure energy storage capacity                           | P0       |
| FR-04-6 | The player must be able to configure radiation protection level                        | P0       |
| FR-04-7 | The player must be able to configure food production (agriculture) capacity            | P0       |
| FR-04-8 | The UI must show the effect of each configuration choice on projected mission duration | P1       |
| FR-04-9 | Configuration must be passed to the simulation engine as the initial BaseConfig        | P0       |

### FR-05: Mission Control
| ID      | Requirement                                                                          | Priority |
|---------|--------------------------------------------------------------------------------------|----------|
| FR-05-1 | Mission Control must display the current mission day (or sol for Mars)               | P0       |
| FR-05-2 | Mission Control must display current oxygen level (% and absolute units)             | P0       |
| FR-05-3 | Mission Control must display current water level                                     | P0       |
| FR-05-4 | Mission Control must display current food level                                      | P0       |
| FR-05-5 | Mission Control must display current energy level                                    | P0       |
| FR-05-6 | Mission Control must display radiation protection status                             | P0       |
| FR-05-7 | Mission Control must display current environmental conditions for the active planet  | P0       |
| FR-05-8 | Mission Control must display any currently active events                             | P0       |
| FR-05-9 | Mission Control must display crew status (alive, critical, lost)                    | P0       |
| FR-05-10| All resource values must be derived from simulation engine state — never hardcoded  | P0       |
| FR-05-11| The player must be able to advance time (end turn / next day)                        | P0       |
| FR-05-12| Resource history must be tracked and displayable as a chart                          | P1       |
| FR-05-13| Warning indicators must appear when any resource falls below a critical threshold    | P0       |

### FR-06: Environmental Events
| ID      | Requirement                                                                              | Priority |
|---------|------------------------------------------------------------------------------------------|----------|
| FR-06-1 | Events must be triggered based on mission state and planet profile conditions            | P0       |
| FR-06-2 | Each event must display a scientific explanation appropriate for age 8–12                | P0       |
| FR-06-3 | Each event must present at least two player decision options                             | P0       |
| FR-06-4 | Each decision must produce a documented, deterministic effect on simulation state        | P0       |
| FR-06-5 | Moon must have at least 3 distinct event types (dust, thermal, radiation)                | P0       |
| FR-06-6 | Mars must have at least 3 distinct event types (dust storm, power reduction, thermal)    | P0       |
| FR-06-7 | Event outcomes must be recorded in the decision log for use in Mission Debrief          | P0       |
| FR-06-8 | Events must not repeat in identical sequence every mission (use seeded randomness)       | P1       |

### FR-07: Astro-AI Assistant
| ID      | Requirement                                                                             | Priority |
|---------|-----------------------------------------------------------------------------------------|----------|
| FR-07-1 | Astro-AI must be accessible from Mission Control at any time                            | P1       |
| FR-07-2 | Astro-AI must explain the current environmental event in age-appropriate language        | P1       |
| FR-07-3 | Astro-AI must explain why a resource is changing                                        | P1       |
| FR-07-4 | Astro-AI must receive structured simulation context — never raw LLM prompt injection   | P1       |
| FR-07-5 | Astro-AI must not override or modify simulation state                                   | P0       |
| FR-07-6 | Astro-AI must degrade gracefully when the AI service is unavailable (show fallback)     | P0       |
| FR-07-7 | Astro-AI responses must be validated with Zod before display                           | P1       |
| FR-07-8 | Astro-AI must not invent scientific measurements or present them as NASA data           | P0       |

### FR-08: Mission Debrief
| ID      | Requirement                                                                          | Priority |
|---------|--------------------------------------------------------------------------------------|----------|
| FR-08-1 | Mission Debrief must display total mission duration                                  | P1       |
| FR-08-2 | Mission Debrief must display a resource stability summary                            | P1       |
| FR-08-3 | Mission Debrief must display the three most impactful player decisions               | P1       |
| FR-08-4 | Mission Debrief must display all environmental events that occurred                  | P1       |
| FR-08-5 | Mission Debrief must display mission outcome (success / partial / failure)           | P1       |
| FR-08-6 | Mission Debrief must include 2–3 educational learning points relevant to the mission | P1       |
| FR-08-7 | The scoring system must be documented and transparent                                | P1       |
| FR-08-8 | The player must be able to start a new mission from the debrief screen               | P1       |

---

## Non-Functional Requirements

### NFR-01: Performance
| ID       | Requirement                                                                     |
|----------|---------------------------------------------------------------------------------|
| NFR-01-1 | Application must load in under 3 seconds on a standard school laptop           |
| NFR-01-2 | Each simulation step must compute in under 50ms                                |
| NFR-01-3 | Production bundle must be code-split so initial chunk is under 500KB gzipped   |

### NFR-02: Reliability
| ID       | Requirement                                                                         |
|----------|-------------------------------------------------------------------------------------|
| NFR-02-1 | The application must not crash if the AI service is unavailable                    |
| NFR-02-2 | The application must not crash on invalid simulation inputs — validate and handle  |
| NFR-02-3 | All simulation results must be deterministic given the same inputs and seed        |

### NFR-03: Scientific Integrity
| ID       | Requirement                                                                           |
|----------|---------------------------------------------------------------------------------------|
| NFR-03-1 | No scientific value may be labeled "NASA data" without a verified source URL         |
| NFR-03-2 | All simulation constants must be classified as OBSERVED_DATA, DERIVED, or ASSUMPTION |
| NFR-03-3 | Educational assumptions must be documented in docs/scientific-assumptions.md         |

### NFR-04: Accessibility and Usability
| ID       | Requirement                                                                        |
|----------|------------------------------------------------------------------------------------|
| NFR-04-1 | All interactive elements must be keyboard-navigable                               |
| NFR-04-2 | Color alone must not convey critical information (icons or labels required also)  |
| NFR-04-3 | Font sizes must be readable on tablet and desktop displays                        |
| NFR-04-4 | Text must meet WCAG AA contrast ratio minimums                                    |

### NFR-05: Maintainability
| ID       | Requirement                                                                          |
|----------|--------------------------------------------------------------------------------------|
| NFR-05-1 | Simulation engine must be independently testable without a browser                  |
| NFR-05-2 | All modules must have clear documented interfaces                                   |
| NFR-05-3 | No magic numbers in simulation calculations — all constants must be named            |
| NFR-05-4 | Production build must succeed with zero TypeScript errors                            |
