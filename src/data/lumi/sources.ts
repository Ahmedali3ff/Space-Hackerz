// src/data/lumi/sources.ts
// Every reference behind Lumi's answers (NASA, USGS and JAXA sources supplied by the team).

export interface LumiSource {
  readonly id: string
  readonly title: string
  readonly url: string
  readonly use: string
}

const ROWS: readonly (readonly [string, string, string, string])[] = [
  ["REF01", "NASA JPL – Perseverance Power", "https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/spacecraft/power/", "Rover power systems and battery charging"],
  ["REF02", "NASA – MMRTG Fact Sheet", "https://science.nasa.gov/wp-content/uploads/2024/02/mmrtg-factsheet-updated-5-18-20-1.pdf", "Radioisotope power system facts"],
  ["REF03", "NASA – Utilization of Space Nuclear Systems", "https://www.nasa.gov/wp-content/uploads/2023/04/nasa-utilization-of-space-nuclear-systems.pdf", "Nuclear power for exploration"],
  ["REF04", "NASA – InSight Power Generation", "https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/", "Solar power on Mars and dust effects"],
  ["REF05", "NASA – Mars Fact Sheet", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html", "Mars planetary data"],
  ["REF06", "NASA – Moon Fact Sheet", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html", "Moon planetary data"],
  ["REF07", "NASA – Lunar Surface Data Book", "https://ntrs.nasa.gov/citations/20250002845", "Lunar surface environment"],
  ["REF08", "NASA – Fission Surface Power", "https://www.nasa.gov/exploration-systems-development-mission-directorate/fission-surface-power/", "Nuclear fission power for the Moon and Mars"],
  ["REF09", "NASA – Fission Surface Power (earlier page)", "https://www.nasa.gov/directorates/stmd/fission-surface-power/", "Surface power development background"],
  ["REF10", "NASA – Mars Surface Power Generation Challenges", "https://www.nasa.gov/wp-content/uploads/2024/01/mars-surface-power-generation-challenges-and-considerations.pdf", "Mars energy challenges"],
  ["REF11", "NASA – Life Support Baseline Values and Assumptions", "https://ntrs.nasa.gov/api/citations/20180001338/downloads/20180001338.pdf", "Life-support reference values"],
  ["NASA-STD-3001", "NASA – Spaceflight Human-System Standard, Vol. 2", "https://www.nasa.gov/reference/7-0-habit-ability-functions-vol-2/", "Habitability requirements"],
  ["NASA-WATER-01", "NASA – Water for Human Consumption (OCHMO-TB-027)", "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-027-water.pdf", "Crew water requirements"],
  ["NASA-ISS-WR-98", "NASA – ISS Water Recovery Milestone", "https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/", "Water recycling on the ISS"],
  ["NASA-OCHMO-TB-004", "NASA – Carbon Dioxide Technical Brief (OCHMO-TB-004)", "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf", "CO2 limits and removal"],
  ["NASA-OCHMO-TB-013", "NASA – Food and Nutrition Technical Brief (OCHMO-TB-013)", "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf", "Crew food and shelf life"],
  ["NASA-HLSR-2020", "NASA – Human Life Support Requirements", "https://ntrs.nasa.gov/api/citations/20200002230/downloads/20200002230.pdf", "Life-support requirements"],
  ["NASA-STD-3001-V2", "NASA-STD-3001, Volume 2 (Rev C)", "https://standards.nasa.gov/sites/default/files/standards/NASA/C/2022-04-08-NASA-STD-3001-Vol-2-Rev-C-Final_0.pdf", "Crew health and habitability standard"],
  ["NASA-ICES-2024-101", "NASA – Advanced Oxygen Generation Assembly status", "https://ntrs.nasa.gov/api/citations/20240006776/downloads/ICES%202024%20101%20AOGA%20final.pdf", "Oxygen generation by electrolysis"],
  ["NASA-NTRS-20060007774", "NASA Technical Report 20060007774", "https://ntrs.nasa.gov/api/citations/20060007774/downloads/20060007774.pdf", "CO2 removal process details"],
  ["NASA-OCHMO-TB-WASTE", "NASA – Body Waste Management Technical Brief", "https://www.nasa.gov/wp-content/uploads/2023/03/waste-management-technical-brief-ochmo.pdf", "Crew waste quantities"],
  ["NASA-WRM-2024", "NASA – Status of ISS Water Management and Recovery", "https://ntrs.nasa.gov/api/citations/20240005472/downloads/ICES%202024-317%20Status%20of%20ISS%20Water_Final.pdf", "ISS water systems"],
  ["NASA-FECAL-2021", "NASA – Fecal Trade Study", "https://ntrs.nasa.gov/api/citations/20210014791/downloads/ICES_Fecal%20Trade%20Study%20Final%205.6.21.pdf", "Spacecraft waste collection"],
  ["NASA-NTRS-20205010174", "NASA – Managing Spacecraft Waste", "https://ntrs.nasa.gov/citations/20205010174", "Spacecraft trash planning"],
  ["NASA-TCPS", "NASA – Trash Compaction Processing System", "https://www.nasa.gov/ames/space-biosciences/bioengineering-branch/the-trash-compaction-processing-system/", "Trash compaction technology"],
  ["NASA-HMC", "NASA – Heat Melt Compactor", "https://www.nasa.gov/ames/space-biosciences/what-is-nasas-heat-melt-compactor/", "Waste volume reduction"],
  ["NASA-CTS-2018", "NASA – ISS Crew Transportation and Services Requirements", "https://ntrs.nasa.gov/api/citations/20180006508/downloads/20180006508.pdf", "Crew services requirements"],
  ["NASA-KSC-TOPS-100", "NASA – Modular System for Waste Treatment and Resource Recovery", "https://technology.nasa.gov/patent/KSC-TOPS-100", "Waste-to-resource concept"],
  ["EXT-USGS", "USGS – Astrogeology Science Center data", "https://www.usgs.gov/centers/astrogeology-science-center/data", "Planned: terrain maps and landing-site analysis"],
  ["EXT-JAXA-DEM", "JAXA – Kaguya (SELENE) Lunar Digital Elevation Model", "https://darts.isas.jaxa.jp/en/app/about/kaguya-seldem-app", "Planned: lunar elevation and terrain"],
  ["EXT-JAXA-PDS", "JAXA – Kaguya Planetary Data Archive", "https://darts.isas.jaxa.jp/missions/pds/pds_kaguya_en.html", "Planned: lunar observation datasets"],
]

export const LUMI_SOURCES: readonly LumiSource[] = ROWS.map(([id, title, url, use]) => ({ id, title, url, use }))

const BY_ID = new Map(LUMI_SOURCES.map((s) => [s.id, s]))

export function getSource(id: string): LumiSource | undefined {
  return BY_ID.get(id)
}
