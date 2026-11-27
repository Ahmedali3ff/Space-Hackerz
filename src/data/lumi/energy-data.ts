// src/data/lumi/energy-data.ts
// Energy reference records (from the team's Energy.json). Each record has a note on how to read it.

export interface EnergyRecord {
  readonly id: string
  readonly planet: string
  readonly group: string
  readonly system: string
  readonly parameter: string
  readonly value: number
  readonly unit: string
  readonly sourceId: string
  readonly note: string
}

export const ENERGY_RECORDS: readonly EnergyRecord[] = [
 {
  "id": "EN001",
  "planet": "Mars",
  "group": "Power Generation",
  "system": "MMRTG",
  "parameter": "Electrical power at beginning of mission",
  "value": 110,
  "unit": "W",
  "sourceId": "REF01",
  "note": "Reference value at mission start; not representative of a human habitat."
 },
 {
  "id": "EN002",
  "planet": "Mars",
  "group": "Power Generation",
  "system": "MMRTG",
  "parameter": "Electrical power at 17 years",
  "value": 72,
  "unit": "W",
  "sourceId": "REF02",
  "note": "Estimated end-of-design-life value, not a direct measurement."
 },
 {
  "id": "EN003",
  "planet": "Mars",
  "group": "Power Generation",
  "system": "MMRTG",
  "parameter": "Thermal power output",
  "value": 2000,
  "unit": "W thermal",
  "sourceId": "REF03",
  "note": "Thermal output, not electrical power; do not add it to electrical power values."
 },
 {
  "id": "EN004",
  "planet": "Mars",
  "group": "Power Generation",
  "system": "MMRTG",
  "parameter": "Electrical conversion efficiency",
  "value": 6.2,
  "unit": "%",
  "sourceId": "REF03",
  "note": "Efficiency of converting thermal energy into electrical energy, according to the cited document."
 },
 {
  "id": "EN005",
  "planet": "Mars",
  "group": "Power Demand",
  "system": "Rover Systems",
  "parameter": "Peak electrical power demand",
  "value": 900,
  "unit": "W",
  "sourceId": "REF01",
  "note": "Temporary peak demand; does not represent average power consumption."
 },
 {
  "id": "EN006",
  "planet": "Mars",
  "group": "Energy Storage",
  "system": "Lithium-ion battery",
  "parameter": "Battery capacity per battery",
  "value": 43,
  "unit": "Ah",
  "sourceId": "REF01",
  "note": "The cited source does not report voltage; do not convert this value to Wh."
 },
 {
  "id": "EN007",
  "planet": "Mars",
  "group": "Energy Storage",
  "system": "Lithium-ion battery",
  "parameter": "Battery count",
  "value": 2,
  "unit": "batteries",
  "sourceId": "REF01",
  "note": "Two rechargeable batteries are used to support rover power demands."
 },
 {
  "id": "EN008",
  "planet": "Mars",
  "group": "Power Generation",
  "system": "Solar array",
  "parameter": "Daily energy production after landing",
  "value": 5000,
  "unit": "Wh/sol",
  "sourceId": "REF04",
  "note": "Observed daily energy production by the InSight lander."
 },
 {
  "id": "EN009",
  "planet": "Mars",
  "group": "Power Generation",
  "system": "Solar array",
  "parameter": "Daily energy production after dust accumulation",
  "value": 500,
  "unit": "Wh/sol",
  "sourceId": "REF04",
  "note": "Production decreased compared with early mission levels; this is not a fixed reduction rate for every dust storm."
 },
 {
  "id": "EN010",
  "planet": "Mars",
  "group": "Environmental Effect",
  "system": "Solar irradiance",
  "parameter": "Solar irradiance at Mars",
  "value": 586.2,
  "unit": "W/m²",
  "sourceId": "REF05",
  "note": "Reference irradiance; actual surface irradiance varies with atmospheric and orbital conditions."
 },
 {
  "id": "EN011",
  "planet": "Moon",
  "group": "Environmental Effect",
  "system": "Solar irradiance",
  "parameter": "Solar irradiance at Moon",
  "value": 1361,
  "unit": "W/m²",
  "sourceId": "REF06",
  "note": "Reference irradiance; it does not represent the electrical output of a solar panel."
 },
 {
  "id": "EN012",
  "planet": "Moon",
  "group": "Environmental Effect",
  "system": "Solar availability",
  "parameter": "Maximum continuous darkness design assumption",
  "value": 150,
  "unit": "hours",
  "sourceId": "REF07",
  "note": "Design assumption for mobile assets under specific lunar polar illumination conditions; not applicable to all lunar locations."
 },
 {
  "id": "EN013",
  "planet": "Moon",
  "group": "Environmental Effect",
  "system": "Solar availability",
  "parameter": "Typical lunar night duration",
  "value": 14,
  "unit": "days",
  "sourceId": "REF07",
  "note": "Typical lunar night duration is approximately 14 Earth days; polar regions may differ."
 },
 {
  "id": "EN014",
  "planet": "Moon and Mars",
  "group": "Power Generation",
  "system": "Fission surface power",
  "parameter": "Planned electrical power capability",
  "value": 40,
  "unit": "kW",
  "sourceId": "REF08",
  "note": "Future design target (NASA plans to demonstrate on the Moon first, then Mars); not an operational power system today."
 },
 {
  "id": "EN015",
  "planet": "Moon and Mars",
  "group": "Power Generation",
  "system": "Fission surface power",
  "parameter": "Continuous electrical power capability",
  "value": 10,
  "unit": "kW",
  "sourceId": "REF09",
  "note": "Older conceptual design reference; do not confuse it with the newer 40 kW target."
 },
 {
  "id": "EN016",
  "planet": "Mars",
  "group": "Habitat Power Demand",
  "system": "Surface mission power",
  "parameter": "Minimum surface power requirement",
  "value": 10,
  "unit": "kW",
  "sourceId": "REF10",
  "note": "Power requirement for an entire surface mission, not life-support consumption alone."
 },
 {
  "id": "EN017",
  "planet": "ISS",
  "group": "Power Consumption",
  "system": "ECLSS",
  "parameter": "Average system power",
  "value": 5.31,
  "unit": "kW",
  "sourceId": "REF11",
  "note": "ISS-based reference; not a confirmed value for a lunar or Martian habitat."
 },
 {
  "id": "EN018",
  "planet": "ISS",
  "group": "Power Consumption",
  "system": "Communication and tracking",
  "parameter": "Average system power",
  "value": 2.9,
  "unit": "kW",
  "sourceId": "REF11",
  "note": "ISS reference value; actual communication power requirements vary by mission architecture."
 },
 {
  "id": "EN019",
  "planet": "ISS",
  "group": "Power Consumption",
  "system": "Thermal control",
  "parameter": "Average system power",
  "value": 8.72,
  "unit": "kW",
  "sourceId": "REF11",
  "note": "ISS reference value; thermal-control requirements can differ significantly on the Moon and Mars."
 },
 {
  "id": "EN020",
  "planet": "ISS",
  "group": "Power Consumption",
  "system": "Command and data handling",
  "parameter": "Average system power",
  "value": 4.08,
  "unit": "kW",
  "sourceId": "REF11",
  "note": "ISS reference value; not a mission-specific estimate for a Martian surface habitat."
 }
]
