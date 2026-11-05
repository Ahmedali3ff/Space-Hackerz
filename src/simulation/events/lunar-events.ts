// src/simulation/events/lunar-events.ts
// Event definitions for Moon missions.
// Descriptions are age-appropriate for 8–12 year olds.
// NO React, Zustand, or Phaser imports.

import type { EventDefinition } from '@simulation/types'

export const LUNAR_EVENTS: readonly EventDefinition[] = [
  {
    id: 'lunar-dust-contamination',
    planetId: 'moon',
    title: 'Lunar Dust Alert!',
    description:
      'Moon dust — called regolith — has gotten into the air filters of your base. ' +
      'Moon dust is super sharp and clingy because there is no wind or rain on the Moon ' +
      'to wear it down. It can clog your life support system if you do not act fast!',
    scientificExplanation:
      'Lunar regolith particles are highly abrasive and electrostatically charged due to ' +
      'the absence of an atmosphere and weathering. Particle sizes range from micrometers ' +
      'to millimeters. Fine particles (<20 µm) are hazardous to mechanical systems and ' +
      'human respiratory tissue. NASA has identified regolith management as a critical ' +
      'challenge for long-duration lunar habitation.',
    affectedSystems: ['oxygen'],
    triggerCondition: {
      minDay: 1,
      probability: 0.08,
      maxOccurrences: 3,
    },
    choices: [
      {
        id: 'deploy-dust-mitigation',
        label: 'Deploy Dust Mitigation Team',
        description:
          'Send your crew outside in spacesuits to clean the filters and set up ' +
          'dust shields. This takes time but keeps your life support working properly.',
        consequence: {
          lifeSupportEfficiencyModifier: 0,
          durationDays: 0,
        },
        isOptimal: true,
      },
      {
        id: 'continue-operations',
        label: 'Continue Normal Operations',
        description:
          'Decide to keep working and hope the dust clears on its own. ' +
          'This saves time now, but the dust will reduce how well your life support works.',
        consequence: {
          lifeSupportEfficiencyModifier: -0.15,
          durationDays: 3,
        },
        isOptimal: false,
      },
    ],
  },

  {
    id: 'lunar-night-begins',
    planetId: 'moon',
    title: 'Lunar Night Has Begun',
    description:
      'The Sun has set on your part of the Moon and will not rise again for 14 days! ' +
      'Without sunlight, your solar panels cannot make power. You will need to use the ' +
      'energy stored in your batteries very carefully to survive the long lunar night.',
    scientificExplanation:
      'The Moon completes one rotation every ~27.3 days (synchronous with its orbit). ' +
      'This means each location on the lunar surface experiences approximately 14 days ' +
      'of continuous sunlight followed by 14 days of continuous darkness. During lunar ' +
      'night, surface temperatures drop to -173°C. Solar power generation ceases entirely, ' +
      'making battery storage and power management critical to mission survival.',
    affectedSystems: ['energy'],
    triggerCondition: {
      minDay: 15,
      probability: 1.0,
      maxOccurrences: 100, // fires every lunar cycle; engine handles cycle-based triggering
    },
    choices: [
      {
        id: 'increase-battery-usage',
        label: 'Run Full Power from Batteries',
        description:
          'Keep all your systems running at full power using stored battery energy. ' +
          'Your crew stays comfortable, but batteries will drain faster.',
        consequence: {
          solarFactorModifier: 0,
          durationDays: 1,
        },
        isOptimal: false,
      },
      {
        id: 'reduce-crew-activity',
        label: 'Switch to Power-Saving Mode',
        description:
          'Reduce non-essential power use: dim the lights, lower the temperature slightly, ' +
          'and pause non-critical experiments. Your batteries will last much longer.',
        consequence: {
          lifeSupportEfficiencyModifier: 0,
          durationDays: 1,
        },
        isOptimal: true,
      },
    ],
  },

  {
    id: 'solar-flare-warning',
    planetId: 'moon',
    title: 'Solar Flare Warning!',
    description:
      'NASA scientists have detected a powerful solar flare heading toward the Moon! ' +
      'A solar flare is a huge explosion of energy from the Sun that sends dangerous ' +
      'radiation through space. Without Earth\'s magnetic field to protect you, ' +
      'your crew could be exposed to harmful levels of radiation.',
    scientificExplanation:
      'Solar energetic particle (SEP) events associated with X-class solar flares can ' +
      'deliver acute radiation doses to unprotected astronauts on the lunar surface. ' +
      'The Moon has no magnetosphere or atmosphere to deflect charged particles. ' +
      'Dose rates during major SEP events can exceed 1 Sv/hour. Sheltering in ' +
      'radiation-hardened modules or underground can reduce exposure by 80–90%.',
    affectedSystems: ['oxygen', 'energy'],
    triggerCondition: {
      minDay: 5,
      probability: 0.04,
      maxOccurrences: 2,
    },
    choices: [
      {
        id: 'shelter-crew',
        label: 'Move Crew to Radiation Shelter',
        description:
          'Order your crew to move immediately to the radiation-hardened section of ' +
          'the base. They will be safe there while the storm passes. Some systems ' +
          'may slow down while crew are sheltering.',
        consequence: {
          radiationModifier: 0.2, // additional shielding reduces total radiation
          durationDays: 3,
        },
        isOptimal: true,
      },
      {
        id: 'continue-operations-flare',
        label: 'Continue Full Operations',
        description:
          'Keep everyone working. The flare might not be as strong as predicted, ' +
          'and you do not want to lose research time.',
        consequence: {
          radiationModifier: 1.5, // 50% extra radiation for 3 days
          durationDays: 3,
        },
        isOptimal: false,
      },
    ],
  },

  {
    id: 'micrometeorite-impact',
    planetId: 'moon',
    title: 'Micrometeorite Impact!',
    description:
      'A small space rock — called a micrometeorite — has hit your solar panel array! ' +
      'The Moon has no atmosphere to burn up incoming rocks, so even tiny ones hit ' +
      'the surface at very high speeds and can damage equipment. ' +
      'Your solar panels are producing less power than before.',
    scientificExplanation:
      'The lunar surface is constantly bombarded by micrometeorites due to the absence ' +
      'of a protective atmosphere. Impact velocities range from 10–70 km/s. ' +
      'Cumulative micrometeorite damage to photovoltaic arrays is a real concern for ' +
      'long-duration lunar missions. NASA studies show PV efficiency degrades ~1–3% ' +
      'per year from micrometeorite exposure alone.',
    affectedSystems: ['energy'],
    triggerCondition: {
      minDay: 3,
      probability: 0.03,
      maxOccurrences: 2,
    },
    choices: [
      {
        id: 'dispatch-repair-team',
        label: 'Send Repair Team Immediately',
        description:
          'Suit up two crew members and send them out on an EVA (spacewalk) to fix ' +
          'the damaged panels right away. You will recover most of the lost power.',
        consequence: {
          solarPanelAreaLoss_m2: 5, // partial loss — repair team recovers half
          durationDays: 0,
        },
        isOptimal: true,
      },
      {
        id: 'defer-repair',
        label: 'Schedule Repair for Later',
        description:
          'Put the repair on the schedule for tomorrow. The crew is busy with other ' +
          'important tasks right now.',
        consequence: {
          solarPanelAreaLoss_m2: 10, // full panel area loss persists
          durationDays: 0,
        },
        isOptimal: false,
      },
    ],
  },
]
