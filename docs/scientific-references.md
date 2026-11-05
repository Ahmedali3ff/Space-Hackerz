# ASTRA — Scientific References

This document records every external scientific source used in ASTRA.
No value may be labeled "NASA data" in the application without an entry in this file.

## Classification Key

| Tag                   | Meaning                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| OBSERVED_DATA         | Directly measured by an instrument; source URL provided                |
| DERIVED_PARAMETER     | Calculated from observed data; derivation method documented            |
| EDUCATIONAL_ASSUMPTION| Simplified or estimated value for educational purposes; clearly labeled |

---

## Moon References

### MON-REF-001 — Lunar Surface Temperature Range
- **Value:** -173°C to +127°C (surface, day/night extremes)
- **Classification:** OBSERVED_DATA
- **Source:** NASA Moon Fact Sheet
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
- **Instrument/Mission:** Diviner Lunar Radiometer Experiment (LRO)
- **Notes:** Peak daytime at equator; polar regions differ significantly. Simulation uses equatorial mid-latitude values as representative baseline.
- **Used In:** MoonProfile.temperatureRange, RadiationProtectionSystem

### MON-REF-002 — Lunar Surface Gravity
- **Value:** 1.62 m/s² (0.165 g)
- **Classification:** OBSERVED_DATA
- **Source:** NASA Moon Fact Sheet
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
- **Used In:** MoonProfile.gravity (informational; affects agriculture feasibility notes)

### MON-REF-003 — Lunar Day/Night Cycle
- **Value:** ~14 Earth days of continuous sunlight followed by ~14 Earth days of darkness
- **Classification:** OBSERVED_DATA
- **Source:** NASA Moon Fact Sheet / Lunar Reconnaissance Orbiter mission overview
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
- **Used In:** EnergyModel lunar solar cycle, event trigger conditions

### MON-REF-004 — Solar Irradiance at Moon
- **Value:** ~1361 W/m² (same as Earth, 1 AU from Sun)
- **Classification:** OBSERVED_DATA
- **Source:** NASA Solar Irradiance — Earth Fact Sheet context
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- **Notes:** Moon is ~1 AU from Sun, so solar constant approximately equal to Earth's. Panel efficiency and dust losses are simulation parameters.
- **Used In:** EnergyModel.solarProduction (Moon configuration)

### MON-REF-005 — Lunar Radiation Environment
- **Value:** ~380 mSv/year average surface dose (galactic cosmic rays + solar)
- **Classification:** OBSERVED_DATA
- **Source:** LRO CRaTER instrument (Cosmic Ray Telescope for the Effects of Radiation)
- **URL:** https://crater.sr.unh.edu/
- **Notes:** This is approximately 200× the annual dose at Earth's surface. Value used to model unshielded exposure in simulation.
- **Used In:** RadiationProtectionSystem lunar configuration

### MON-REF-006 — Lunar Regolith Dust Properties
- **Classification:** OBSERVED_DATA
- **Source:** Apollo mission geological reports / NASA Lunar Science Institute
- **URL:** https://www.nasa.gov/centers/marshall/lunar/dust.html (archived)
- **Notes:** Lunar dust is highly abrasive and electrostatically charged. Simulated as a contamination hazard affecting life support systems and solar panels.
- **Used In:** LunarEvents.dustContamination

---

## Mars References

### MAR-REF-001 — Mars Surface Temperature Range
- **Value:** -125°C to +20°C (poles to equatorial summer)
- **Classification:** OBSERVED_DATA
- **Source:** NASA Mars Fact Sheet
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
- **Instrument/Mission:** Mars Global Surveyor TES, Mars Reconnaissance Orbiter MCS
- **Used In:** MarsProfile.temperatureRange

### MAR-REF-002 — Mars Surface Gravity
- **Value:** 3.72 m/s² (0.38 g)
- **Classification:** OBSERVED_DATA
- **Source:** NASA Mars Fact Sheet
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
- **Used In:** MarsProfile.gravity

### MAR-REF-003 — Martian Sol Duration
- **Value:** 24 hours 39 minutes 35 seconds (1 sol ≈ 1.027 Earth days)
- **Classification:** OBSERVED_DATA
- **Source:** NASA Mars Fact Sheet
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
- **Used In:** SimulationClock Mars mode (sol vs Earth day distinction)

### MAR-REF-004 — Solar Irradiance at Mars
- **Value:** ~590 W/m² average (Mars is ~1.52 AU from Sun)
- **Classification:** DERIVED_PARAMETER
- **Derivation:** Solar constant (1361 W/m²) × (1 AU / 1.524 AU)² ≈ 586 W/m²
- **Source:** NASA Mars Fact Sheet (orbital parameters)
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
- **Notes:** ~43% of Earth's solar irradiance. Dust storm opacity further reduces effective irradiance.
- **Used In:** EnergyModel.solarProduction (Mars configuration)

### MAR-REF-005 — Martian Atmosphere Composition
- **Value:** ~95.3% CO₂, 2.7% N₂, 1.6% Ar, trace O₂ (0.13%)
- **Classification:** OBSERVED_DATA
- **Source:** NASA Mars Fact Sheet
- **URL:** https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
- **Notes:** Atmosphere is too thin (avg 600 Pa) and wrong composition for human breathing. All oxygen must be produced by life support. This is a key educational point.
- **Used In:** OxygenModel (Mars requires full in-situ production)

### MAR-REF-006 — Martian Dust Storm Characteristics
- **Classification:** OBSERVED_DATA
- **Source:** NASA Mars Exploration Program — Dust Storms
- **URL:** https://mars.nasa.gov/all-about-mars/weather/dust-storms/
- **Instrument/Mission:** Mars Global Surveyor, Mars Reconnaissance Orbiter, Opportunity/Curiosity
- **Notes:** Global dust storms can reduce solar irradiance by 99% for weeks. Regional storms (more common) reduce by 40–70%. Simulation models regional storms with configurable severity.
- **Used In:** MartianEvents.dustStorm, EnergyModel dust storm modifier

### MAR-REF-007 — Mars Radiation Environment
- **Value:** ~0.64 mSv/day surface average (without dust storm shielding)
- **Classification:** OBSERVED_DATA
- **Source:** Curiosity RAD (Radiation Assessment Detector)
- **URL:** https://www.nasa.gov/mission_pages/msl/news/msl20130930.html
- **Instrument/Mission:** Mars Science Laboratory (Curiosity) RAD instrument
- **Notes:** ~8× higher than ISS. Used to model unshielded radiation exposure in simulation.
- **Used In:** RadiationProtectionSystem Mars configuration

---

## Life Support References

### LS-REF-001 — Human Oxygen Consumption
- **Value:** ~0.84 kg/person/day (metabolic)
- **Classification:** OBSERVED_DATA
- **Source:** NASA Human Integration Design Handbook (HIDH) / NASA SP-2010-3407
- **URL:** https://humanresearchroadmap.nasa.gov/
- **Notes:** Standard metabolic oxygen consumption. Life support must match or exceed this. Used as baseline before recycling losses.
- **Used In:** OxygenModel.baseConsumptionPerPersonPerDay

### LS-REF-002 — Human Water Consumption
- **Value:** ~3.0 kg/person/day (drinking + hygiene, ISS baseline)
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Source:** ISS life support overview (approximate figure for educational simulation)
- **Notes:** Actual ISS figure is ~3.6 kg/person/day including all uses. Simplified for educational context. Documented as assumption.
- **Used In:** WaterModel.baseConsumptionPerPersonPerDay

### LS-REF-003 — Human Caloric / Food Mass Requirement
- **Value:** ~1.8 kg/person/day (ISS food system average)
- **Classification:** EDUCATIONAL_ASSUMPTION
- **Source:** Approximate ISS food logistics figure
- **Notes:** Actual value varies by crew and mission profile. Used as educational baseline.
- **Used In:** FoodModel.baseConsumptionPerPersonPerDay

---

## Source Verification Status

| Ref ID     | URL Verified | License Checked | Added to Data Files |
|------------|--------------|-----------------|---------------------|
| MON-REF-001| PENDING      | NASA Open Data  | NO                  |
| MON-REF-002| PENDING      | NASA Open Data  | NO                  |
| MON-REF-003| PENDING      | NASA Open Data  | NO                  |
| MON-REF-004| PENDING      | NASA Open Data  | NO                  |
| MON-REF-005| PENDING      | NASA Open Data  | NO                  |
| MON-REF-006| PENDING      | NASA Open Data  | NO                  |
| MAR-REF-001| PENDING      | NASA Open Data  | NO                  |
| MAR-REF-002| PENDING      | NASA Open Data  | NO                  |
| MAR-REF-003| PENDING      | NASA Open Data  | NO                  |
| MAR-REF-004| PENDING      | NASA Open Data  | NO                  |
| MAR-REF-005| PENDING      | NASA Open Data  | NO                  |
| MAR-REF-006| PENDING      | NASA Open Data  | NO                  |
| MAR-REF-007| PENDING      | NASA Open Data  | NO                  |
| LS-REF-001 | PENDING      | NASA Open Data  | NO                  |
| LS-REF-002 | PENDING      | Educational     | NO                  |
| LS-REF-003 | PENDING      | Educational     | NO                  |

URLs will be verified during TASK-SCI-001 through TASK-SCI-003.
