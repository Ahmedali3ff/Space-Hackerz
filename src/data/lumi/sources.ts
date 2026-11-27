// src/data/lumi/sources.ts
// Every reference behind Lumi's answers (NASA, USGS and JAXA sources supplied by the team).

export interface LumiSource {
  readonly id: string
  readonly title: string
  readonly url: string
  readonly use: string
}

export const LUMI_SOURCES: readonly LumiSource[] = [
  {
    "id": "REF01",
    "title": "NASA JPL – Perseverance Power",
    "url": "https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/spacecraft/power/",
    "use": "Rover power systems and battery charging"
  },
  {
    "id": "REF02",
    "title": "NASA – MMRTG Fact Sheet",
    "url": "https://science.nasa.gov/wp-content/uploads/2024/02/mmrtg-factsheet-updated-5-18-20-1.pdf",
    "use": "Radioisotope power system facts"
  },
  {
    "id": "REF03",
    "title": "NASA – Utilization of Space Nuclear Systems",
    "url": "https://www.nasa.gov/wp-content/uploads/2023/04/nasa-utilization-of-space-nuclear-systems.pdf",
    "use": "Nuclear power for exploration"
  },
  {
    "id": "REF04",
    "title": "NASA – InSight Power Generation",
    "url": "https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/",
    "use": "Solar power on Mars and dust effects"
  },
  {
    "id": "REF05",
    "title": "NASA – Mars Fact Sheet",
    "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html",
    "use": "Mars planetary data"
  },
  {
    "id": "REF06",
    "title": "NASA – Moon Fact Sheet",
    "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html",
    "use": "Moon planetary data"
  },
  {
    "id": "REF07",
    "title": "NASA – Lunar Surface Data Book",
    "url": "https://ntrs.nasa.gov/citations/20250002845",
    "use": "Lunar surface environment"
  },
  {
    "id": "REF08",
    "title": "NASA – Fission Surface Power",
    "url": "https://www.nasa.gov/exploration-systems-development-mission-directorate/fission-surface-power/",
    "use": "Nuclear fission power for the Moon and Mars"
  },
  {
    "id": "REF09",
    "title": "NASA – Fission Surface Power (earlier page)",
    "url": "https://www.nasa.gov/directorates/stmd/fission-surface-power/",
    "use": "Surface power development background"
  },
  {
    "id": "REF10",
    "title": "NASA – Mars Surface Power Generation Challenges",
    "url": "https://www.nasa.gov/wp-content/uploads/2024/01/mars-surface-power-generation-challenges-and-considerations.pdf",
    "use": "Mars energy challenges"
  },
  {
    "id": "REF11",
    "title": "NASA – Life Support Baseline Values and Assumptions",
    "url": "https://ntrs.nasa.gov/api/citations/20180001338/downloads/20180001338.pdf",
    "use": "Life-support reference values"
  },
  {
    "id": "NASA-STD-3001",
    "title": "NASA – Spaceflight Human-System Standard, Vol. 2",
    "url": "https://www.nasa.gov/reference/7-0-habit-ability-functions-vol-2/",
    "use": "Habitability requirements"
  },
  {
    "id": "NASA-WATER-01",
    "title": "NASA – Water for Human Consumption (OCHMO-TB-027)",
    "url": "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-027-water.pdf",
    "use": "Crew water requirements"
  },
  {
    "id": "NASA-ISS-WR-98",
    "title": "NASA – ISS Water Recovery Milestone",
    "url": "https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/",
    "use": "Water recycling on the ISS"
  },
  {
    "id": "NASA-OCHMO-TB-004",
    "title": "NASA – Carbon Dioxide Technical Brief (OCHMO-TB-004)",
    "url": "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf",
    "use": "CO2 limits and removal"
  },
  {
    "id": "NASA-OCHMO-TB-013",
    "title": "NASA – Food and Nutrition Technical Brief (OCHMO-TB-013)",
    "url": "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf",
    "use": "Crew food and shelf life"
  },
  {
    "id": "NASA-HLSR-2020",
    "title": "NASA – Human Life Support Requirements",
    "url": "https://ntrs.nasa.gov/api/citations/20200002230/downloads/20200002230.pdf",
    "use": "Life-support requirements"
  },
  {
    "id": "NASA-STD-3001-V2",
    "title": "NASA-STD-3001, Volume 2 (Rev C)",
    "url": "https://standards.nasa.gov/sites/default/files/standards/NASA/C/2022-04-08-NASA-STD-3001-Vol-2-Rev-C-Final_0.pdf",
    "use": "Crew health and habitability standard"
  },
  {
    "id": "NASA-ICES-2024-101",
    "title": "NASA – Advanced Oxygen Generation Assembly status",
    "url": "https://ntrs.nasa.gov/api/citations/20240006776/downloads/ICES%202024%20101%20AOGA%20final.pdf",
    "use": "Oxygen generation by electrolysis"
  },
  {
    "id": "NASA-NTRS-20060007774",
    "title": "NASA Technical Report 20060007774",
    "url": "https://ntrs.nasa.gov/api/citations/20060007774/downloads/20060007774.pdf",
    "use": "CO2 removal process details"
  },
  {
    "id": "NASA-OCHMO-TB-WASTE",
    "title": "NASA – Body Waste Management Technical Brief",
    "url": "https://www.nasa.gov/wp-content/uploads/2023/03/waste-management-technical-brief-ochmo.pdf",
    "use": "Crew waste quantities"
  },
  {
    "id": "NASA-WRM-2024",
    "title": "NASA – Status of ISS Water Management and Recovery",
    "url": "https://ntrs.nasa.gov/api/citations/20240005472/downloads/ICES%202024-317%20Status%20of%20ISS%20Water_Final.pdf",
    "use": "ISS water systems"
  },
  {
    "id": "NASA-FECAL-2021",
    "title": "NASA – Fecal Trade Study",
    "url": "https://ntrs.nasa.gov/api/citations/20210014791/downloads/ICES_Fecal%20Trade%20Study%20Final%205.6.21.pdf",
    "use": "Spacecraft waste collection"
  },
  {
    "id": "NASA-NTRS-20205010174",
    "title": "NASA – Managing Spacecraft Waste",
    "url": "https://ntrs.nasa.gov/citations/20205010174",
    "use": "Spacecraft trash planning"
  },
  {
    "id": "NASA-TCPS",
    "title": "NASA – Trash Compaction Processing System",
    "url": "https://www.nasa.gov/ames/space-biosciences/bioengineering-branch/the-trash-compaction-processing-system/",
    "use": "Trash compaction technology"
  },
  {
    "id": "NASA-HMC",
    "title": "NASA – Heat Melt Compactor",
    "url": "https://www.nasa.gov/ames/space-biosciences/what-is-nasas-heat-melt-compactor/",
    "use": "Waste volume reduction"
  },
  {
    "id": "NASA-CTS-2018",
    "title": "NASA – ISS Crew Transportation and Services Requirements",
    "url": "https://ntrs.nasa.gov/api/citations/20180006508/downloads/20180006508.pdf",
    "use": "Crew services requirements"
  },
  {
    "id": "NASA-KSC-TOPS-100",
    "title": "NASA – Modular System for Waste Treatment and Resource Recovery",
    "url": "https://technology.nasa.gov/patent/KSC-TOPS-100",
    "use": "Waste-to-resource concept"
  },
  {
    "id": "EXT-USGS",
    "title": "USGS – Astrogeology Science Center data",
    "url": "https://www.usgs.gov/centers/astrogeology-science-center/data",
    "use": "Planned: terrain maps and landing-site analysis"
  },
  {
    "id": "EXT-JAXA-DEM",
    "title": "JAXA – Kaguya (SELENE) Lunar Digital Elevation Model",
    "url": "https://darts.isas.jaxa.jp/en/app/about/kaguya-seldem-app",
    "use": "Planned: lunar elevation and terrain"
  },
  {
    "id": "EXT-JAXA-PDS",
    "title": "JAXA – Kaguya Planetary Data Archive",
    "url": "https://darts.isas.jaxa.jp/missions/pds/pds_kaguya_en.html",
    "use": "Planned: lunar observation datasets"
  }
]

const BY_ID = new Map(LUMI_SOURCES.map((s) => [s.id, s]))

export function getSource(id: string): LumiSource | undefined {
  return BY_ID.get(id)
}
