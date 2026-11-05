# ASTRA — Scientific Assumptions

This document records every parameter used in the simulation that is:
- A simplification of a real value for educational purposes, OR
- An estimate without a direct NASA measurement source, OR
- A design decision about how a real phenomenon is modeled

Each entry states: the assumption, the value used, the unit, the reason for the simplification,
and the reference (if any) it was derived from.

No assumption in this file is ever labeled as "NASA data" inside the application.

---

## Classification System

| Tag                   | Meaning                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| OBSERVED_DATA         | Directly measured; source URL in scientific-references.md              |
| DERIVED_PARAMETER     | Calculated from observed data; derivation documented                   |
| EDUCATIONAL_ASSUMPTION| Simplified for educational use; this file contains all of these        |

---

## Life Support Assumptions

### ASM-LS-001 — Oxygen Consumption Rate
- **Value:** 0.84 kg/person/day
- **Unit:** kg per person per day
- **Classification:** EDUCATIONAL_ASSUMPTION (based on observed metabolic data, simplified)
- **Reference:** LS-REF-001 (NASA HIDH approximate)
- **Simplification:** Actual values vary by activity level, body mass, and mission phase. A single fixed rate is used for educational simplicity.
- **Display Label in App:** "Life support requires about 0.84 kg of oxygen per person each day"

### ASM-LS-002 — Water Consumption Rate
- **Value:** 3.0 kg/person/day
- **Unit:** kg per person per day
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** LS-REF-002 (ISS approximate)
- **Simplification:** ISS actual ≈ 3.6 kg/person/day including all water uses. Rounded down for simplicity. Does not model grey water separately.
- **Display Label in App:** "Each crew member needs about 3 kg of water per day"

### ASM-LS-003 — Food Consumption Rate
- **Value:** 1.8 kg/person/day
- **Unit:** kg per person per day
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** LS-REF-003 (ISS food logistics approximate)
- **Simplification:** Actual ISS food mass is higher when packaging is included. This models net food mass only.
- **Display Label in App:** "Each crew member needs about 1.8 kg of food per day"

### ASM-LS-004 — Water Recycling Efficiency
- **Value:** 85% (life support system at standard capacity)
- **Unit:** Percentage of consumed water recovered and recycled
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** ISS ECLSS water recovery system recovers ~90–93% (NASA). Using 85% as educational baseline to account for maintenance losses.
- **Simplification:** Recovery rate is constant in this model; real systems vary with maintenance state.

### ASM-LS-005 — Oxygen Recovery from CO₂
- **Value:** 50% of exhaled CO₂ converted back to O₂ at standard life support
- **Unit:** Percentage
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** ISS Sabatier reactor concept (simplified). Real systems have various efficiencies.
- **Simplification:** A simplified fixed recovery rate. Real ISS systems use multiple stages.

---

## Energy Assumptions

### ASM-EN-001 — Solar Panel Conversion Efficiency
- **Value:** 20%
- **Unit:** Percentage of incident solar energy converted to electricity
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** Typical range for modern photovoltaic panels is 15–22%. ISS uses ~14% effective efficiency after all losses.
- **Simplification:** Fixed rate; does not model panel degradation over time.

### ASM-EN-002 — Base Habitat Power Consumption (per crew member)
- **Value:** 2.0 kW per crew member per day (continuous equivalent)
- **Unit:** kW
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** No specific reference; designed to create meaningful gameplay balance.
- **Justification:** ISS consumes ~75–90 kW total for 6–7 crew. Simplified for gameplay.

### ASM-EN-003 — Battery Storage Round-Trip Efficiency
- **Value:** 90%
- **Unit:** Percentage
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** Modern lithium-ion batteries achieve 85–95% round-trip efficiency. 90% used as educational midpoint.

### ASM-EN-004 — Dust Storm Solar Irradiance Reduction (Mars, Regional Storm)
- **Value:** 50% reduction in solar energy production
- **Unit:** Percentage reduction
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** MAR-REF-006. Regional storms reduce by 40–70%; 50% used as representative value.
- **Simplification:** Does not model gradual onset/clearing. Modeled as a discrete event.

### ASM-EN-005 — Lunar Night Energy Availability
- **Value:** Zero solar production during lunar night (days 15–28 of lunar cycle)
- **Unit:** Binary on/off
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** MON-REF-003. The 14-day night is real; the simulation models it as complete solar blackout.
- **Simplification:** Does not model polar solar availability or RTG power sources.

---

## Radiation Assumptions

### ASM-RAD-001 — Unshielded Daily Radiation Dose (Moon)
- **Value:** 1.04 mSv/day (derived from 380 mSv/year ÷ 365)
- **Unit:** mSv/day
- **Classification:** DERIVED_PARAMETER
- **Reference:** MON-REF-005 (LRO CRaTER: ~380 mSv/year)

### ASM-RAD-002 — Unshielded Daily Radiation Dose (Mars)
- **Value:** 0.64 mSv/day
- **Unit:** mSv/day
- **Classification:** OBSERVED_DATA
- **Reference:** MAR-REF-007 (Curiosity RAD)

### ASM-RAD-003 — Shielding Effectiveness Levels
- **Value:** Low shield = 30% reduction; Medium = 60%; High = 85%
- **Unit:** Percentage reduction of unshielded dose
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** No specific reference. Designed to create meaningful tradeoffs between shielding mass/cost and crew safety.

---

## Event Assumptions

### ASM-EVT-001 — Lunar Dust Storm Contamination Impact
- **Value:** Reduces life support efficiency by 15% per event if not addressed
- **Unit:** Percentage efficiency reduction
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** Lunar dust abrasiveness is real (MON-REF-006); specific efficiency numbers are simulation design choices.

### ASM-EVT-002 — Mars Global Dust Storm Frequency
- **Value:** 1 global storm every ~2–3 Mars years; modeled as low-probability event (~5% per 30 sols)
- **Unit:** Probability per simulation period
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** MAR-REF-006. Global storms are rare; regional storms more common. Probability tuned for gameplay.

### ASM-EVT-003 — Event Resolution Time
- **Value:** Events persist for 1–7 days if not addressed
- **Unit:** Simulation days
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** Simulation design decision; duration chosen to create meaningful but not overwhelming decisions.

---

## Agriculture Assumptions

### ASM-AGR-001 — Food Production Yield
- **Value:** 0.3 kg/m²/day of growing area (highly simplified)
- **Unit:** kg food per m² per day
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** NASA plant growth experiments in space (Veggie system on ISS) produce ~0.1–0.5 kg/m²/day depending on crop. Midpoint used.
- **Simplification:** Single crop type, no growth stages, no lighting requirements modeled separately.

### ASM-AGR-002 — Minimum Power Required for Agriculture
- **Value:** 0.5 kW per agricultural unit
- **Unit:** kW
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Reference:** Simulation design decision. Agriculture is powered-dependent to create interesting energy tradeoffs.

---

## How Assumptions Are Communicated to Students

The application must make clear to students:
1. Which values come from real NASA measurements (labeled with a ⚡ icon and source citation)
2. Which values are educational simplifications (labeled with a 📚 icon and "simplified for this simulation")
3. Astro-AI explanations must use this vocabulary: "In this simulation, we use..." for assumptions

This policy ensures the product is scientifically honest while remaining accessible.
