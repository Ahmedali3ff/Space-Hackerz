// Data-driven operations for the eight Space Hackerz campaign levels.
// Presentation components consume this file; mission rules stay testable and reusable.

export type OperationPlanet = 'moon' | 'mars'

export interface OperationAction {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly resourceDelta?: Partial<Record<'oxygen' | 'water' | 'food' | 'energy', number>>
  readonly objectiveId: string
}

export interface OperationPuzzle {
  readonly id: string
  readonly question: string
  readonly options: readonly string[]
  readonly correctOption: string
  readonly correctFeedback: string
  readonly wrongFeedback: string
  readonly correctPoints: number
  readonly wrongPoints: number
}

export interface MissionOperationDefinition {
  readonly levelId: string
  readonly missionId: string
  readonly title: string
  readonly situation: string
  readonly scientificContext: string
  readonly objective: string
  readonly actions: readonly OperationAction[]
  readonly puzzles: readonly OperationPuzzle[]
  readonly minimumResources: Partial<Record<'oxygen' | 'water' | 'food' | 'energy', number>>
  readonly environmentNote: string
  readonly requiredSequence?: readonly string[]
}

const action = (id: string, label: string, description: string, objectiveId: string, resourceDelta?: OperationAction['resourceDelta']): OperationAction => ({ id, label, description, objectiveId, resourceDelta })

export const MISSION_OPERATIONS: readonly MissionOperationDefinition[] = [
  {
    levelId: 'level-1', missionId: 'm01', title: 'Mission Preparation',
    situation: 'Launch is scheduled, but the habitat must be provisioned before the crew leaves Earth.',
    scientificContext: 'Life-support supplies are planned from crew size and the number of operating cycles.',
    objective: 'Verify every critical resource and solve the oxygen planning calculation.',
    actions: [
      action('select-moon', 'Select Moon', 'Plan for a short lunar transfer and stable solar access.', 'destination'),
      action('select-mars', 'Select Mars', 'Plan for a long-duration Mars mission.', 'destination'),
      action('check-food', 'Check Food', 'Confirm food stores are above the launch minimum.', 'food-check'),
      action('check-water', 'Check Water', 'Confirm water stores are above the launch minimum.', 'water-check'),
      action('check-oxygen', 'Check Oxygen', 'Confirm oxygen stores are above the launch minimum.', 'oxygen-check'),
      action('check-energy', 'Check Energy', 'Confirm battery reserves can support deployment.', 'energy-check'),
    ],
    puzzles: [{ id: 'oxygen-plan', question: '4 astronauts consume 8 oxygen units per cycle. How much is required for 5 cycles?', options: ['40', '80', '160', '320'], correctOption: '160', correctFeedback: 'Correct: 4 × 8 × 5 = 160 oxygen units.', wrongFeedback: 'Multiply crew × units per crew × cycles.', correctPoints: 100, wrongPoints: -20 }],
    minimumResources: { oxygen: 50, water: 50, food: 50, energy: 50 },
    environmentNote: 'Launch readiness is a systems check: a missing resource becomes a survival problem later.',
  },
  {
    levelId: 'level-2', missionId: 'm02', title: 'Landing on the Planet',
    situation: 'The spacecraft has landed. Stabilize the base before the landing window closes.',
    scientificContext: 'Power must be stable before communications and life support can safely boot.',
    objective: 'Follow the safe startup sequence: Power → Communication → Life Support.',
    actions: [
      action('activate-power', 'Activate Power', 'Bring the base bus online first.', 'power'),
      action('stabilize-communication', 'Stabilize Communication', 'Lock the antenna and contact Mission Control.', 'communication', { energy: -3 }),
      action('activate-life-support', 'Activate Life Support', 'Start air circulation after power is stable.', 'life-support', { energy: -5, oxygen: 8 }),
    ],
    puzzles: [], minimumResources: { energy: 25, oxygen: 25, water: 25, food: 25 }, environmentNote: 'Boot order matters because life support cannot operate without a stable power bus.', requiredSequence: ['activate-power', 'stabilize-communication', 'activate-life-support'],
  },
  {
    levelId: 'level-3', missionId: 'm03', title: 'Life Support Crisis',
    situation: 'Oxygen production has dropped and the failed filter is restricting the generator.',
    scientificContext: 'Filtering and regeneration keep carbon dioxide from accumulating in the cabin.',
    objective: 'Inspect, repair the filter, then restart oxygen production.',
    actions: [
      action('inspect-oxygen', 'Inspect Oxygen System', 'Read the diagnostic panel and identify the failed filter.', 'inspect'),
      action('repair-filter', 'Repair Filter', 'Replace the clogged filter cartridge.', 'repair', { energy: -5 }),
      action('generate-oxygen', 'Generate Oxygen', 'Restart the oxygen generator.', 'generate', { oxygen: 10, energy: -5 }),
      action('emergency-oxygen', 'Emergency Oxygen', 'Use reserve canisters: fast relief, high energy cost.', 'emergency', { oxygen: 20, energy: -15 }),
    ],
    puzzles: [], minimumResources: { oxygen: 60, energy: 10, water: 20, food: 20 }, environmentNote: 'Emergency oxygen buys time but does not repair the failed production system.',
  },
  {
    levelId: 'level-4', missionId: 'm04', title: 'Power System Failure',
    situation: 'Primary solar input is damaged and the habitat is running on a shrinking battery reserve.',
    scientificContext: 'Life support has priority because it directly protects the crew.',
    objective: 'Inspect, back up, reduce consumption, repair solar power, and choose the survival priority.',
    actions: [
      action('inspect-solar', 'Inspect Solar Panel', 'Locate the damaged solar input.', 'inspect'),
      action('activate-backup', 'Activate Backup', 'Protect the habitat while repairs are underway.', 'backup', { energy: 8 }),
      action('reduce-consumption', 'Reduce Consumption', 'Power down non-essential systems.', 'conservation', { energy: 12 }),
      action('repair-solar', 'Repair Solar Panel', 'Restore the primary energy source.', 'repair', { energy: -8 }),
      action('restore-power', 'Restore Power', 'Return the power network to stable operation.', 'restore', { energy: 15 }),
    ],
    puzzles: [{ id: 'power-priority', question: 'Which system should receive priority power?', options: ['Entertainment', 'Life Support', 'Lighting', 'Laboratory'], correctOption: 'Life Support', correctFeedback: 'Correct: breathable air comes before comfort or research.', wrongFeedback: 'Survival systems must be powered before comfort or research.', correctPoints: 100, wrongPoints: -50 }],
    minimumResources: { energy: 50, oxygen: 20, water: 20, food: 20 }, environmentNote: 'Power budgeting is a survival decision, not just an engineering task.',
  },
  {
    levelId: 'level-5', missionId: 'm05', title: 'Water & Food Management',
    situation: 'Supplies are declining faster than expected. Recycling and hydroponics must be coordinated.',
    scientificContext: 'Water recovery and controlled agriculture reduce resupply demand.',
    objective: 'Recycle water, start hydroponics, conserve water, and answer the consumption question.',
    actions: [
      action('recycle-water', 'Recycle Water', 'Recover usable water from the habitat loop.', 'recycle', { water: 18, energy: -5 }),
      action('activate-hydroponics', 'Activate Hydroponics', 'Grow food using controlled lighting and nutrients.', 'hydroponics', { food: 15, energy: -6 }),
      action('reduce-water', 'Reduce Water Consumption', 'Move the crew to conservation mode.', 'conservation', { water: 12 }),
      action('emergency-rationing', 'Emergency Rationing', 'Protect stores while comfort decreases.', 'rationing', { water: 8, food: 8 }),
    ],
    puzzles: [{ id: 'resource-plan', question: 'If recycling saves 30% of 100 water units, how much remains available?', options: ['30', '70', '100', '130'], correctOption: '130', correctFeedback: 'Correct: 100 + 30 recovered units = 130 available.', wrongFeedback: 'Recycling adds 30% of the original 100 units back to supply.', correctPoints: 100, wrongPoints: -30 }],
    minimumResources: { water: 30, food: 30, oxygen: 20, energy: 15 }, environmentNote: 'Closed-loop systems stretch supplies, but they still need energy and maintenance.',
  },
  {
    levelId: 'level-6', missionId: 'm06', title: 'Environmental Emergency',
    situation: 'A dust event is reducing visibility and damaging exposed equipment.',
    scientificContext: 'Dust blocks sunlight on Mars and contaminates moving equipment on the Moon.',
    objective: 'Protect the habitat, reduce demand, and repair the affected equipment before the event ends.',
    actions: [
      action('dust-protection', 'Activate Dust Protection', 'Seal sensitive equipment and air intakes.', 'protection', { energy: -4 }),
      action('protect-solar', 'Protect Solar Panels', 'Deploy covers and cleaning routines.', 'solar-protection', { energy: -5 }),
      action('reduce-energy', 'Reduce Energy Consumption', 'Keep only survival systems powered.', 'conservation', { energy: 10 }),
      action('emergency-mode', 'Enter Emergency Mode', 'Slow non-critical operations until visibility returns.', 'emergency', { energy: 8 }),
      action('repair-equipment', 'Repair Equipment', 'Restore the damaged external system.', 'repair', { energy: -8 }),
    ],
    puzzles: [], minimumResources: { energy: 25, oxygen: 20, water: 20, food: 20 }, environmentNote: 'The same dust can reduce solar input on Mars or contaminate machinery on the Moon.',
  },
  {
    levelId: 'level-7', missionId: 'm07', title: 'Critical System Repair',
    situation: 'A cascading fault has destabilized a major habitat system.',
    scientificContext: 'Safe repair requires isolation before a damaged component is physically replaced.',
    objective: 'Complete the repair sequence in order: Detect → Inspect → Shutdown → Repair → Restart → Verify.',
    actions: [
      action('scan-system', 'Scan System', 'Detect the failing subsystem.', 'detect'), action('inspect-system', 'Inspect', 'Find the damaged component.', 'inspect'),
      action('shutdown-system', 'Shutdown', 'Isolate the system before repair.', 'shutdown', { energy: -5 }), action('repair-component', 'Repair', 'Replace the damaged component.', 'repair', { energy: -8 }),
      action('restart-system', 'Restart', 'Bring the repaired system online.', 'restart', { energy: -4 }), action('verify-stability', 'Verify', 'Confirm the system is stable at 100%.', 'verify', { energy: -2 }),
    ], puzzles: [], minimumResources: { energy: 20, oxygen: 20, water: 20, food: 20 }, environmentNote: 'Skipping isolation can turn a repair into a critical failure.', requiredSequence: ['scan-system', 'inspect-system', 'shutdown-system', 'repair-component', 'restart-system', 'verify-stability'],
  },
  {
    levelId: 'level-8', missionId: 'm08', title: 'Final Survival Mission',
    situation: 'Energy is falling, oxygen is declining, water is limited, and an environmental event is active.',
    scientificContext: 'Mission command is the art of prioritizing several coupled survival systems under time pressure.',
    objective: 'Keep every critical resource above zero while coordinating the complete response.',
    actions: [
      action('generate-oxygen', 'Generate Oxygen', 'Recover breathable air for the crew.', 'oxygen', { oxygen: 12, energy: -6 }), action('restore-power', 'Restore Power', 'Recover stable energy input.', 'power', { energy: 15 }),
      action('recycle-water', 'Recycle Water', 'Recover water from the habitat loop.', 'water', { water: 15, energy: -5 }), action('repair-equipment', 'Repair Equipment', 'Keep the emergency systems operating.', 'repair', { energy: -7 }),
      action('emergency-mode', 'Emergency Mode', 'Trade comfort for survival time.', 'emergency', { energy: 8 }), action('reduce-consumption', 'Reduce Consumption', 'Power down non-essential loads.', 'conservation', { energy: 10 }),
      action('protect-crew', 'Protect Crew', 'Move the crew into the safest habitat zone.', 'crew', { oxygen: -2, energy: -3 }), action('contact-control', 'Contact Mission Control', 'Transmit a status report and request guidance.', 'contact', { energy: -2 }),
    ], puzzles: [], minimumResources: { oxygen: 1, water: 1, food: 1, energy: 1 }, environmentNote: 'No single action solves the crisis: prioritize, act, monitor, and adapt.',
  },
]

export function getMissionOperation(levelIdOrMissionId: string): MissionOperationDefinition | undefined {
  return MISSION_OPERATIONS.find((mission) => mission.levelId === levelIdOrMissionId || mission.missionId === levelIdOrMissionId)
}
