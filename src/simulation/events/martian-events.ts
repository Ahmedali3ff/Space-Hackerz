// src/simulation/events/martian-events.ts
// Event definitions for Mars missions.
// Descriptions are age-appropriate for 8–12 year olds.
// NO React, Zustand, or Phaser imports.

import type { EventDefinition } from '@simulation/types'

export const MARTIAN_EVENTS: readonly EventDefinition[] = [
  {
    id: 'regional-dust-storm',
    planetId: 'mars',
    title: 'Regional Dust Storm Approaching!',
    description:
      'A huge dust storm is sweeping across your region of Mars! ' +
      'Mars dust storms can be enormous — some cover the entire planet. ' +
      'The storm will block sunlight and reduce the power your solar panels can make. ' +
      'You have a short window to prepare before it hits.',
    scientificExplanation:
      'Martian dust storms are driven by solar heating of the surface and can grow ' +
      'to cover continental regions within days. Storm opacity (tau) can reach 5–8 ' +
      'during major events, reducing solar irradiance by 50–90%. The 2018 global dust ' +
      'storm ended NASA\'s Opportunity rover mission. Dust particle diameters on Mars ' +
      'are ~1–3 µm, allowing them to stay suspended in the thin CO₂ atmosphere for weeks.',
    affectedSystems: ['energy'],
    triggerCondition: {
      minDay: 10,
      probability: 0.05,
      maxOccurrences: 3,
    },
    choices: [
      {
        id: 'pre-charge-batteries',
        label: 'Pre-charge Batteries and Reduce Power Use',
        description:
          'Before the storm hits, charge your batteries as much as possible and ' +
          'switch to power-saving mode. Your crew will be ready for the reduced sunlight.',
        consequence: {
          solarFactorModifier: 0.5, // 50% solar reduction
          durationDays: 6,
        },
        isOptimal: true,
      },
      {
        id: 'normal-operations-storm',
        label: 'Maintain Normal Operations',
        description:
          'Continue normal activities. Maybe the storm will not be as bad as the ' +
          'weather sensors predict.',
        consequence: {
          solarFactorModifier: 0.5, // same solar reduction, but no battery prep
          durationDays: 6,
        },
        isOptimal: false,
      },
    ],
  },

  {
    id: 'dust-storm-clears',
    planetId: 'mars',
    title: 'Dust Storm Clearing',
    description:
      'Great news! The dust storm is finally clearing up. ' +
      'Sunlight is returning to your solar panels and power production will return to normal. ' +
      'Your crew did an amazing job managing through the storm!',
    scientificExplanation:
      'Martian dust storms typically last 1–8 weeks for regional storms and several months ' +
      'for global events. Clearing occurs as dust settles and solar heating patterns shift. ' +
      'The MARCI (Mars Color Imager) on MRO provides ongoing monitoring of dust storm ' +
      'activity and extent across the planet.',
    affectedSystems: ['energy'],
    triggerCondition: {
      minDay: 10,
      probability: 1.0, // fires automatically after storm duration
      maxOccurrences: 3,
      requiresActiveEvent: 'regional-dust-storm',
    },
    choices: [
      {
        id: 'resume-full-operations',
        label: 'Resume Full Power Operations',
        description:
          'Bring all systems back online now that sunlight is returning. ' +
          'Recharge your batteries and restart any paused experiments.',
        consequence: {
          solarFactorModifier: 1.0, // restore solar factor
          durationDays: 0,
        },
        isOptimal: true,
      },
      {
        id: 'cautious-restart',
        label: 'Gradual Power Restart',
        description:
          'Bring systems back online gradually over the next day to make sure ' +
          'everything is working correctly after the storm.',
        consequence: {
          solarFactorModifier: 0.8, // slightly cautious recovery
          durationDays: 1,
        },
        isOptimal: false,
      },
    ],
  },

  {
    id: 'co2-frost-formation',
    planetId: 'mars',
    title: 'CO₂ Frost on Thermal Panels!',
    description:
      'Carbon dioxide from the Martian atmosphere is freezing onto your thermal panels ' +
      'and the outside of your agriculture greenhouse at night. ' +
      'The frost is blocking heat from reaching your plants, and some crops are struggling. ' +
      'If this is not fixed, your food production will drop.',
    scientificExplanation:
      'On Mars, CO₂ frost (dry ice) forms on surfaces during cold nights, particularly ' +
      'at higher latitudes or during dust-induced temperature drops. The Martian atmosphere ' +
      'is 95.3% CO₂, which freezes at -78.5°C. CO₂ frost deposition on agricultural ' +
      'habitats would reduce thermal efficiency and potentially damage crops. ' +
      'NASA\'s Phoenix lander directly observed CO₂ snowfall near the Martian north pole.',
    affectedSystems: ['food', 'energy'],
    triggerCondition: {
      minDay: 5,
      probability: 0.03,
      maxOccurrences: 2,
    },
    choices: [
      {
        id: 'heat-panels',
        label: 'Activate Thermal Heaters to Clear Frost',
        description:
          'Use your electrical heating systems to melt the CO₂ frost quickly. ' +
          'This uses extra power but keeps your crops safe and healthy.',
        consequence: {
          lifeSupportEfficiencyModifier: 0,
          durationDays: 0,
        },
        isOptimal: true,
      },
      {
        id: 'wait-for-sunlight',
        label: 'Wait for Daytime Sun to Melt the Frost',
        description:
          'Do nothing and wait for the morning sun to melt the frost naturally. ' +
          'This saves power, but your crops will suffer for 2 days.',
        consequence: {
          lifeSupportEfficiencyModifier: -0.10,
          durationDays: 2,
        },
        isOptimal: false,
      },
    ],
  },

  {
    id: 'global-dust-storm',
    planetId: 'mars',
    title: 'GLOBAL DUST STORM — Emergency!',
    description:
      'A global dust storm is covering the entire planet! ' +
      'These are the biggest storms in the solar system. ' +
      'Almost all sunlight is blocked, and your solar panels are producing almost no power. ' +
      'This is a real emergency — you must protect your crew and manage power very carefully ' +
      'or the mission will fail.',
    scientificExplanation:
      'Global Martian dust storms occur roughly every 2–3 Martian years and can last for ' +
      'months. The 2018 global storm raised atmospheric opacity (tau) to ~8, reducing surface ' +
      'solar irradiance to less than 1% of clear-sky values. This event ended the Opportunity ' +
      'rover\'s 15-year mission. Power systems must rely entirely on stored energy or nuclear ' +
      'alternatives (RTGs) during peak storm conditions.',
    affectedSystems: ['energy', 'food'],
    triggerCondition: {
      minDay: 30,
      probability: 0.01,
      maxOccurrences: 1,
    },
    choices: [
      {
        id: 'emergency-power-mode',
        label: 'Enter Emergency Power Conservation Mode',
        description:
          'Immediately shut down all non-essential systems. ' +
          'The crew goes to minimum activity mode: sleep cycles extended, temperature lowered, ' +
          'all experiments paused. This gives you the best chance of surviving the storm.',
        consequence: {
          solarFactorModifier: 0.01, // 99% solar reduction
          durationDays: 14,
        },
        isOptimal: true,
      },
      {
        id: 'full-operations-global-storm',
        label: 'Attempt to Maintain Full Operations',
        description:
          'Keep the mission running normally. Maybe the storm will clear faster than expected.',
        consequence: {
          solarFactorModifier: 0.01, // same extreme reduction
          durationDays: 14,
        },
        isOptimal: false,
      },
    ],
  },
]
