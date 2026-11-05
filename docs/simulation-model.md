# ASTRA — Simulation Model

This document describes the mathematical model used by the simulation engine.
All formulas must be implemented exactly as described here.
Any deviation must update this document first.

---

## Time Model

The simulation advances in discrete steps called **turns**.

- On Moon: 1 turn = 1 Earth day
- On Mars: 1 turn = 1 sol (≈ 1.027 Earth days; treated as 1 unit in simulation)

The simulation clock tracks:
- `missionDay`: integer, starts at 1, incremented each turn
- `lunarCycleDay`: integer 1–28 (Moon only), determines solar availability
- `season`: not modeled in V1

---

## Resource Model Overview

Five resources are tracked per simulation step:

| Resource  | Unit | Min | Max     | Critical Threshold |
|-----------|------|-----|---------|-------------------|
| Oxygen    | kg   | 0   | config  | 10% of max        |
| Water     | kg   | 0   | config  | 10% of max        |
| Food      | kg   | 0   | config  | 10% of max        |
| Energy    | kWh  | 0   | config  | 15% of max        |
| Radiation | mSv  | 0   | ∞       | 50 mSv cumulative |

Resources below 0 are a **fault state** — they trigger a mission failure event.
The simulation must never allow a resource to silently go negative.

---

## Per-Step Calculation Order

Each turn executes in this exact order:

```
1. VALIDATE current state (Zod schema check)
2. ADVANCE clock (missionDay += 1)
3. PROCESS events (EventEngine determines active events)
4. APPLY event modifiers (temporary efficiency changes)
5. CALCULATE solar availability (based on planet + day)
6. CALCULATE energy production
7. CALCULATE energy consumption
8. CALCULATE energy delta → update energy level
9. CALCULATE oxygen production and consumption
10. CALCULATE water production and consumption
11. CALCULATE food production and consumption
12. CALCULATE radiation exposure
13. CHECK constraints (any resource ≤ 0? → fault state)
14. RECORD state transition in decision log
15. RETURN SimulationResult
```

---

## Energy Calculations

### Solar Production

```
solarIrradiance = planetProfile.solarIrradiance_W_m2
                  × solarAvailabilityFactor(missionDay, planet)
                  × dustModifier (1.0 normally, 0.5 during dust storm)

panelOutput_kW = solarIrradiance
               × config.solarPanelArea_m2
               × ASM-EN-001.panelEfficiency (0.20)
               / 1000                              ← W → kW

panelOutput_kWh = panelOutput_kW × hoursOfLight
```

### Solar Availability Factor

**Moon:**
- Days 1–14 of lunar cycle: factor = 1.0 (lunar day)
- Days 15–28 of lunar cycle: factor = 0.0 (lunar night)
- (See ASM-EN-005)

**Mars:**
- factor = 1.0 normally
- factor = 0.5 during regional dust storm (See ASM-EN-004)
- factor = 0.01 during global dust storm (rare event)

### Energy Consumption

```
baseConsumption_kWh = crewSize × ASM-EN-002.powerPerCrewMember_kW × 24
systemConsumption_kWh = lifeSupportLoad + agricultureLoad + other

totalConsumption_kWh = baseConsumption_kWh + systemConsumption_kWh
```

### Battery Balance

```
energyDelta_kWh = panelOutput_kWh - totalConsumption_kWh

if energyDelta_kWh > 0:
  stored = min(batteryLevel + energyDelta_kWh × ASM-EN-003.roundTripEfficiency,
               config.batteryCapacity_kWh)
else:
  stored = max(batteryLevel + energyDelta_kWh, 0)
  if stored == 0 and energyDelta_kWh < 0:
    → ENERGY FAULT STATE
```

---

## Oxygen Calculations

```
consumptionPerDay_kg = crewSize × ASM-LS-001.oxygenPerPersonPerDay (0.84)

production_kg = (consumptionPerDay_kg × ASM-LS-005.co2RecoveryRate (0.50))
              × lifeSupportEfficiency  (1.0 normally, reduced by events/config)

oxygenDelta_kg = production_kg - consumptionPerDay_kg

newOxygenLevel_kg = max(oxygenLevel + oxygenDelta_kg, 0)

if newOxygenLevel_kg == 0:
  → OXYGEN FAULT STATE (mission failure)
```

Note: The simulation assumes life support produces oxygen from CO₂ recycling and stored reserves.
Life support must have sufficient power to operate.
If energy is below critical: lifeSupportEfficiency is reduced by 30%.

---

## Water Calculations

```
consumptionPerDay_kg = crewSize × ASM-LS-002.waterPerPersonPerDay (3.0)

recycledPerDay_kg = consumptionPerDay_kg × ASM-LS-004.recyclingEfficiency (0.85)

netConsumption_kg = consumptionPerDay_kg - recycledPerDay_kg

waterDelta_kg = -netConsumption_kg   ← net daily loss from storage

newWaterLevel_kg = max(waterLevel + waterDelta_kg, 0)

if newWaterLevel_kg == 0:
  → WATER FAULT STATE
```

---

## Food Calculations

```
consumptionPerDay_kg = crewSize × ASM-LS-003.foodPerPersonPerDay (1.8)

agricultureProduction_kg = config.agricultureArea_m2
                           × ASM-AGR-001.yieldPerM2PerDay (0.3)
                           × agriculturePowerFactor (1.0 if power OK, 0 if no power)

foodDelta_kg = agricultureProduction_kg - consumptionPerDay_kg

newFoodLevel_kg = max(foodLevel + foodDelta_kg, 0)

if newFoodLevel_kg == 0:
  → FOOD FAULT STATE
```

---

## Radiation Calculations

```
unshieldedDailyDose_mSv = planetProfile.unshieldedDailyRadiation_mSv
  (Moon: 1.04 mSv/day from ASM-RAD-001)
  (Mars: 0.64 mSv/day from ASM-RAD-002)

shieldingReduction = shieldingLevel === 'low'    ? 0.30
                   : shieldingLevel === 'medium' ? 0.60
                   : shieldingLevel === 'high'   ? 0.85
                   : 0

dailyDose_mSv = unshieldedDailyDose_mSv × (1 - shieldingReduction)

cumulativeDose_mSv += dailyDose_mSv

if cumulativeDose_mSv > 50:
  → RADIATION WARNING event triggered
if cumulativeDose_mSv > 150:
  → RADIATION CRITICAL event (mission failure risk)
```

---

## Mission Scoring

The MissionScore is calculated at mission end (debrief).

```
baseScore = missionDuration_days × 10

resourceStabilityBonus = average(
  oxygenStabilityScore,    ← % of days oxygen was above critical threshold
  waterStabilityScore,
  foodStabilityScore,
  energyStabilityScore
) × 200

decisionQualityBonus = sum(
  optimalDecisionsMade × 25,
  suboptimalDecisionsMade × 5
)

eventsResolvedBonus = eventsSuccessfullyResolved × 30

criticalFailurePenalty = criticalFailureEvents × (-50)

finalScore = baseScore
           + resourceStabilityBonus
           + decisionQualityBonus
           + eventsResolvedBonus
           + criticalFailurePenalty

missionOutcome = finalScore >= 800  ? 'success'
               : finalScore >= 400  ? 'partial'
               : 'failure'
```

The scoring thresholds (800, 400) are educational design choices and are configurable constants,
not scientific values.

---

## Determinism and Seeds

The simulation uses a seeded pseudo-random number generator for event scheduling.
The seed is set at mission start and is stored in the simulation state.
Given the same seed, configuration, and player actions, the simulation will always produce
the same sequence of events and outcomes.

This enables reproducible testing and future "replay" features.

Implementation: use a simple mulberry32 or xorshift32 PRNG — no `Math.random()` calls inside
the simulation engine.

---

## Fault States

A fault state is triggered when a resource reaches 0 or a threshold is exceeded.

| Fault State       | Trigger                    | Consequence                     |
|-------------------|----------------------------|---------------------------------|
| OXYGEN_DEPLETED   | oxygen_kg ≤ 0              | Mission failure — crew lost     |
| WATER_DEPLETED    | water_kg ≤ 0               | Mission failure — crew lost     |
| FOOD_DEPLETED     | food_kg ≤ 0                | Mission failure after 3 days    |
| POWER_CRITICAL    | energy_kWh ≤ 0             | Life support efficiency -30%    |
| RADIATION_HIGH    | cumulative ≥ 50 mSv        | Warning event triggered         |
| RADIATION_CRITICAL| cumulative ≥ 150 mSv       | Mission failure risk             |

All fault states must emit an event that is logged in the decision log.
