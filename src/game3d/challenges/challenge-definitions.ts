// src/game3d/challenges/challenge-definitions.ts
// Interactive challenge definitions for the Space Hackerz gameplay loop.
// Each challenge maps to a specific building and can be triggered by
// resource thresholds, day milestones, or random events.

export interface Challenge {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly targetBuildingId: string
  readonly actionLabel: string
  readonly timeLimit: number
  readonly severity: 'low' | 'medium' | 'high'
  readonly consequence: string
  readonly reward: string
  readonly triggerCondition: 'random' | 'low_oxygen' | 'low_water' | 'low_food' | 'low_energy' | 'day_threshold'
  readonly triggerValue?: number
}

export const CHALLENGES: readonly Challenge[] = [
  {
    id: 'oxygen-leak',
    title: '🚨 Oxygen Leak Detected!',
    description: 'Sensors show a micro-leak in Life Support. Go to the Life Support Bay and seal the breach!',
    targetBuildingId: 'life-support',
    actionLabel: '🔧 Seal the Leak',
    timeLimit: 3,
    severity: 'high',
    consequence: 'Oxygen drops -15% per day until sealed',
    reward: 'Leak sealed! Oxygen stable again.',
    triggerCondition: 'low_oxygen',
    triggerValue: 60,
  },
  {
    id: 'solar-storm',
    title: '⛈️ Solar Storm Warning!',
    description: 'A solar storm is approaching in 3 days. Go to the Solar Array and activate storm shields!',
    targetBuildingId: 'solar-panels',
    actionLabel: '🛡️ Activate Storm Shield',
    timeLimit: 3,
    severity: 'high',
    consequence: 'Solar panels lose 50% output for 5 days',
    reward: 'Panels protected! Energy secured.',
    triggerCondition: 'random',
  },
  {
    id: 'water-clog',
    title: '💧 Water Recycler Clogged!',
    description: 'Mineral buildup is blocking the recycling membranes. Go to Water Recycling and run a manual flush.',
    targetBuildingId: 'water-recycling',
    actionLabel: '🔄 Run Flush Cycle',
    timeLimit: 2,
    severity: 'medium',
    consequence: 'Water drops -8% per day',
    reward: 'Water flow fully restored!',
    triggerCondition: 'low_water',
    triggerValue: 55,
  },
  {
    id: 'harvest-crops',
    title: '🌱 Crops Ready to Harvest!',
    description: 'Your greenhouse crops are ready! Go to the Greenhouse before they wilt.',
    targetBuildingId: 'greenhouse',
    actionLabel: '🌾 Harvest Now',
    timeLimit: 2,
    severity: 'low',
    consequence: 'Crops wilt — lose food bonus',
    reward: '+25% food boost added!',
    triggerCondition: 'day_threshold',
    triggerValue: 5,
  },
  {
    id: 'power-overload',
    title: '⚡ Power Overload Risk!',
    description: 'Battery systems near max capacity. Go to the Power Room and discharge excess energy safely.',
    targetBuildingId: 'power-room',
    actionLabel: '⚡ Discharge Safely',
    timeLimit: 2,
    severity: 'medium',
    consequence: 'Battery overloads — lose 40% energy',
    reward: 'Power grid stabilized.',
    triggerCondition: 'random',
  },
  {
    id: 'comms-blackout',
    title: '📡 Communications Down!',
    description: 'Mission Control lost contact. Go to the Comms Tower and re-establish the signal.',
    targetBuildingId: 'communications',
    actionLabel: '📡 Re-Establish Signal',
    timeLimit: 2,
    severity: 'medium',
    consequence: 'No mission updates for 5 days',
    reward: 'Signal restored! Bonus supplies incoming.',
    triggerCondition: 'random',
  },
  {
    id: 'airlock-pressure',
    title: '🚪 Airlock Pressure Warning!',
    description: 'The airlock shows pressure irregularities. Go to the Airlock and run a pressure check.',
    targetBuildingId: 'airlock',
    actionLabel: '🔍 Run Pressure Check',
    timeLimit: 3,
    severity: 'low',
    consequence: 'Airlock locked — no EVA missions',
    reward: 'Airlock certified safe!',
    triggerCondition: 'random',
  },
  {
    id: 'system-reboot',
    title: '🖥️ System Reboot Required!',
    description: 'Computers hit by cosmic rays. Go to Command Center and run the diagnostic sequence.',
    targetBuildingId: 'command-center',
    actionLabel: '🔄 Run Diagnostics',
    timeLimit: 4,
    severity: 'low',
    consequence: 'Resource monitoring inaccurate for 3 days',
    reward: 'All systems peak efficiency!',
    triggerCondition: 'day_threshold',
    triggerValue: 10,
  },
]
