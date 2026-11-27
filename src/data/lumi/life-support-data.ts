// src/data/lumi/life-support-data.ts
// Life-support reference records (from the team's Life_Support.json).

export interface LifeSupportRecord {
  readonly id: string
  readonly resource: string
  readonly parameter: string
  readonly value: number | string
  readonly unit: string
  readonly basis: string
  readonly sourceId: string
  readonly note: string
}

export const LIFE_SUPPORT_RECORDS: readonly LifeSupportRecord[] = [
  { id: 'LS001', resource: 'Food', parameter: 'Daily Food Energy', value: 3035, unit: 'kcal/day', basis: 'Per Person', sourceId: 'NASA-STD-3001', note: '3035 kcal/day is an average provision value; activity and crew characteristics may affect energy requirements.' },
  { id: 'LS002', resource: 'Water', parameter: 'Minimum Potable Water for Hydration', value: 2.5, unit: 'L/day', basis: 'Per Person', sourceId: 'NASA-WATER-01', note: '2.5 L/day is for hydration; personal hygiene water is mission-dependent and separate.' },
  { id: 'LS003', resource: 'Water', parameter: 'Total Water Recovery Rate', value: 98, unit: '%', basis: 'System', sourceId: 'NASA-ISS-WR-98', note: '98% was demonstrated on the ISS; it is not a guaranteed recovery rate for a future Moon or Mars habitat.' },
  { id: 'LS004', resource: 'Oxygen', parameter: 'Daily O2 Consumption With Exercise', value: 0.82, unit: 'kg/day', basis: 'Per Person', sourceId: 'NASA-OCHMO-TB-004', note: 'Daily metabolic total for the reference activity schedule; not a universal value for every person.' },
  { id: 'LS005', resource: 'Oxygen', parameter: 'Daily O2 Consumption Without Exercise', value: 0.72, unit: 'kg/day', basis: 'Per Person', sourceId: 'NASA-OCHMO-TB-004', note: 'Daily metabolic total for the no-exercise reference case; not a universal value for every person.' },
  { id: 'LS006', resource: 'CO2', parameter: 'Daily CO2 Production With Exercise', value: 1.04, unit: 'kg/day', basis: 'Per Person', sourceId: 'NASA-OCHMO-TB-004', note: 'Daily CO2 output for the reference activity schedule; not a universal value for every person.' },
  { id: 'LS007', resource: 'CO2', parameter: 'Daily CO2 Production Without Exercise', value: 0.91, unit: 'kg/day', basis: 'Per Person', sourceId: 'NASA-OCHMO-TB-004', note: 'Daily CO2 output for the no-exercise reference case; not a universal value for every person.' },
  { id: 'LS008', resource: 'Food', parameter: 'Beverage Shelf Life', value: 3, unit: 'years', basis: 'Per Food Item', sourceId: 'NASA-OCHMO-TB-013', note: 'NASA reference shelf life for beverages; not a universal value for all missions.' },
  { id: 'LS009', resource: 'Food', parameter: 'Thermostabilized Food Shelf Life', value: '2.5–3.5', unit: 'years', basis: 'Per Food Item', sourceId: 'NASA-OCHMO-TB-013', note: 'NASA reference shelf life for thermostabilized food; not a universal value for all missions.' },
  { id: 'LS010', resource: 'Food', parameter: 'Irradiated Food Shelf Life', value: 4.5, unit: 'years', basis: 'Per Food Item', sourceId: 'NASA-OCHMO-TB-013', note: 'NASA reference shelf life for irradiated food; packaging conditions apply.' },
  { id: 'LS011', resource: 'Food', parameter: 'Rehydratable Food Shelf Life', value: 2, unit: 'years', basis: 'Per Food Item', sourceId: 'NASA-OCHMO-TB-013', note: 'NASA reference shelf life for rehydratable food; shelf life depends on packaging.' },
  { id: 'LS012', resource: 'Food', parameter: 'Natural Form Food Shelf Life', value: 2, unit: 'years', basis: 'Per Food Item', sourceId: 'NASA-OCHMO-TB-013', note: 'NASA reference shelf life for natural-form food; shelf life depends on packaging.' },
  { id: 'LS013', resource: 'Food', parameter: 'Extended Shelf Life Bread', value: 3, unit: 'years', basis: 'Per Food Item', sourceId: 'NASA-OCHMO-TB-013', note: 'NASA reference shelf life for extended-shelf-life bread products.' },
  { id: 'LS014', resource: 'Food', parameter: 'Fresh Food Shelf Life', value: 1, unit: 'week', basis: 'Per Food Item', sourceId: 'NASA-OCHMO-TB-013', note: 'NASA reference shelf life for fresh food; storage conditions matter.' },
  { id: 'LS015', resource: 'Water', parameter: 'Water for Drinking and Food Preparation', value: 3.56, unit: 'kg/day', basis: 'Per Person', sourceId: 'NASA-HLSR-2020', note: 'Combined value; do not add it to the 2.5 L/day hydration minimum.' },
  { id: 'LS016', resource: 'Water', parameter: 'Water for Hygiene, Flush, Laundry and Dishes', value: 26, unit: 'kg/day', basis: 'Per Person', sourceId: 'NASA-HLSR-2020', note: 'Includes several uses; not personal hygiene water alone and not a universal Moon/Mars requirement.' },
  { id: 'LS017', resource: 'Water', parameter: 'Potable Water Quality Requirement', value: 'Chemically and microbiologically safe', unit: '', basis: 'System', sourceId: 'NASA-STD-3001-V2', note: 'Water quality requirement; not a numerical measurement.' },
  { id: 'LS018', resource: 'Oxygen', parameter: 'Oxygen Production Method', value: 'Water Electrolysis', unit: '', basis: 'System', sourceId: 'NASA-ICES-2024-101', note: 'Oxygen is delivered to the cabin; hydrogen can be routed to the Sabatier system or vented.' },
  { id: 'LS019', resource: 'Oxygen', parameter: 'Maximum Oxygen Production Rate', value: 9.25, unit: 'kg/day', basis: 'System', sourceId: 'NASA-ICES-2024-101', note: 'Maximum system capacity, not its normal daily output.' },
  { id: 'LS020', resource: 'Oxygen', parameter: 'Theoretical Crew Support at Maximum Production', value: 10.88, unit: 'crew members', basis: 'System', sourceId: 'NASA-ICES-2024-101', note: 'Calculated support capacity, not a guaranteed operational crew limit.' },
  { id: 'LS021', resource: 'CO2', parameter: 'CO2 Removal Method', value: 'Four-Bed Molecular Sieve (4BMS)', unit: '', basis: 'System', sourceId: 'NASA-OCHMO-TB-004', note: 'NASA describes the ISS carbon dioxide removal technology.' },
  { id: 'LS022', resource: 'CO2', parameter: 'CDRA Crew-Equivalent Removal Capacity', value: 6, unit: 'crew-equivalents', basis: 'System', sourceId: 'NASA-OCHMO-TB-004', note: 'Capacity is expressed as six person-equivalents, not a universal capacity for Moon or Mars habitats.' },
  { id: 'LS023', resource: 'CO2', parameter: 'CO2 Removal Regeneration Method', value: 'Heating and Space Vacuum', unit: '', basis: 'System', sourceId: 'NASA-OCHMO-TB-004', note: 'The beds alternate roles so CO2 removal can continue.' },
  { id: 'LS024', resource: 'CO2', parameter: 'CDRA Approximate Power Requirement', value: 1, unit: 'kW', basis: 'System', sourceId: 'NASA-NTRS-20060007774', note: 'Approximate historical value; not a universal power requirement for all CO2 removal systems.' },
  { id: 'LS025', resource: 'CO2', parameter: 'CO2 Adsorption Bed Regeneration Interval', value: 144, unit: 'minutes', basis: 'System', sourceId: 'NASA-NTRS-20060007774', note: 'Reported operating interval for the ISS CDRA described in this technical report.' },
  { id: 'LS026', resource: 'CO2', parameter: 'Zeolite Bed Maintenance Issue', value: 'Zeolite dust buildup', unit: '', basis: 'System', sourceId: 'NASA-OCHMO-TB-004', note: 'NASA identifies replacement parts and maintenance as necessary for CDRA operation.' },
  { id: 'LS027', resource: 'Waste', parameter: 'Average Daily Urine Output', value: 2.24, unit: 'L/day', basis: 'Per Person', sourceId: 'NASA-OCHMO-TB-WASTE', note: 'Calculated from NASA sample average values; individual output varies.' },
  { id: 'LS028', resource: 'Waste', parameter: 'Average Daily Feces Output', value: 0.3, unit: 'kg/day', basis: 'Per Person', sourceId: 'NASA-OCHMO-TB-WASTE', note: 'Calculated from NASA sample average values; represents collected fecal waste.' },
  { id: 'LS029', resource: 'Waste', parameter: 'Maximum Daily Feces Output', value: 1, unit: 'kg/day', basis: 'Per Person', sourceId: 'NASA-OCHMO-TB-WASTE', note: 'Reference maximum scenario, not the normal daily output.' },
  { id: 'LS030', resource: 'Waste', parameter: 'Urine Collection System', value: 'Waste and Hygiene Compartment (WHC)', unit: '', basis: 'System', sourceId: 'NASA-WRM-2024', note: 'ISS-specific system description.' },
  { id: 'LS031', resource: 'Waste', parameter: 'Urine Pretreatment', value: 'Oxidizer and inorganic acid', unit: '', basis: 'System', sourceId: 'NASA-WRM-2024', note: 'Describes ISS pretreatment; not a universal design recommendation.' },
  { id: 'LS032', resource: 'Waste', parameter: 'Urine Processing Method', value: 'Vacuum distillation', unit: '', basis: 'System', sourceId: 'NASA-WRM-2024', note: 'ISS technology.' },
  { id: 'LS033', resource: 'Water', parameter: 'Recovered Urine Water Destination', value: 'Water Processor Assembly (WPA)', unit: '', basis: 'System', sourceId: 'NASA-WRM-2024', note: 'Recovered water is not considered potable until it passes further treatment.' },
  { id: 'LS034', resource: 'Waste', parameter: 'Fecal Waste Collection Method', value: 'Individual collection bags', unit: '', basis: 'System', sourceId: 'NASA-FECAL-2021', note: 'Describes the baseline fecal collection technology studied for ISS.' },
  { id: 'LS035', resource: 'Waste', parameter: 'Fecal Collection Bag Material', value: 'PTFE (Polytetrafluoroethylene)', unit: '', basis: 'System', sourceId: 'NASA-FECAL-2021', note: 'Material description from the NASA study.' },
  { id: 'LS036', resource: 'Waste', parameter: 'Fecal Storage Canister Capacity', value: 20, unit: 'deposits', basis: 'System', sourceId: 'NASA-FECAL-2021', note: 'Capacity refers to fecal deposits, not 20 crew members.' },
  { id: 'LS037', resource: 'Waste', parameter: 'Fecal Waste Compaction', value: 'Manual compression', unit: '', basis: 'System', sourceId: 'NASA-FECAL-2021', note: 'Describes the baseline system in the study.' },
  { id: 'LS038', resource: 'Waste', parameter: 'Estimated Daily Spacecraft Trash', value: 2, unit: 'kg/crew member/day', basis: 'Per Person', sourceId: 'NASA-NTRS-20205010174', note: 'Approximate planning estimate; actual waste depends on mission duration and logistics.' },
  { id: 'LS039', resource: 'Waste', parameter: 'Common Solid Trash Categories', value: 'Food packaging, plastic, paper, clothing, wipes', unit: '', basis: 'System', sourceId: 'NASA-TCPS', note: 'Examples of ordinary spacecraft trash; not an exhaustive list.' },
  { id: 'LS040', resource: 'Waste', parameter: 'Heat Melt Compactor Volume Reduction', value: 12.5, unit: '% of original volume (at most)', basis: 'System', sourceId: 'NASA-HMC', note: 'A sample tile was compressed to less than one-eighth of its original volume; this is a demonstration result, not a guaranteed operating rate.' },
  { id: 'LS041', resource: 'Waste', parameter: 'Trash Separation', value: 'Wet and Dry Trash Bags', unit: '', basis: 'System', sourceId: 'NASA-TCPS', note: 'Current ISS trash handling practice.' },
  { id: 'LS042', resource: 'Waste', parameter: 'Trash Disposal Method', value: 'Spent Resupply Vehicle', unit: '', basis: 'System', sourceId: 'NASA-TCPS', note: 'Describes ISS disposal practice; not a method available for a lunar or Mars base.' },
  { id: 'LS043', resource: 'Waste', parameter: 'Trash Storage Volume Allocation', value: 'Mission-specific allocation', unit: '', basis: 'System', sourceId: 'NASA-STD-3001-V2', note: 'No universal numerical storage volume is specified here.' },
  { id: 'LS044', resource: 'Waste', parameter: 'Trash Containment and Odor Control', value: 'Contained storage with odor control', unit: '', basis: 'System', sourceId: 'NASA-CTS-2018', note: 'Design requirement; not a measured performance value.' },
  { id: 'LS045', resource: 'Waste', parameter: 'Heat Melt Compactor Processing Temperature', value: 150, unit: '°C', basis: 'System', sourceId: 'NASA-HMC', note: 'Prototype technology; not yet a routine operational ISS system.' },
  { id: 'LS047', resource: 'Waste', parameter: 'Water Recovery from Solid Trash', value: 'Water vapor recovered during processing', unit: '', basis: 'System', sourceId: 'NASA-TCPS', note: 'Do not treat recovered vapor as immediately drinkable water.' },
  { id: 'LS048', resource: 'Waste', parameter: 'Organic Waste Resource Recovery', value: 'Clean water, fuel-use gases, and fertilizer constituents', unit: '', basis: 'System', sourceId: 'NASA-KSC-TOPS-100', note: 'Development concept; these outputs should not be presented as an operational ISS capability.' },
]
