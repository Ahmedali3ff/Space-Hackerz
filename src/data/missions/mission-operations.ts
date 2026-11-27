// Data-driven operations for the twenty Space Hackerz campaign levels.
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
    requiredSequence: ['select-moon', 'check-food', 'check-water', 'check-oxygen', 'check-energy'],
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
    puzzles: [{ id: 'oxygen-cycle', question: '6 astronauts consume 12 oxygen units per cycle. How much oxygen is needed for 4 cycles?', options: ['18', '48', '72', '96'], correctOption: '48', correctFeedback: 'Correct: 12 × 4 = 48 oxygen units.', wrongFeedback: 'The 12 units already include the six astronauts. Multiply by four cycles.', correctPoints: 100, wrongPoints: -20 }], minimumResources: { oxygen: 60, energy: 10, water: 20, food: 20 }, environmentNote: 'Emergency oxygen buys time but does not repair the failed production system.', requiredSequence: ['inspect-oxygen', 'repair-filter', 'generate-oxygen', 'emergency-oxygen'],
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
    minimumResources: { energy: 50, oxygen: 20, water: 20, food: 20 }, environmentNote: 'Power budgeting is a survival decision, not just an engineering task.', requiredSequence: ['inspect-solar', 'activate-backup', 'reduce-consumption', 'repair-solar', 'restore-power'],
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
    minimumResources: { water: 30, food: 30, oxygen: 20, energy: 15 }, environmentNote: 'Closed-loop systems stretch supplies, but they still need energy and maintenance.', requiredSequence: ['recycle-water', 'activate-hydroponics', 'reduce-water', 'emergency-rationing'],
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
    puzzles: [], minimumResources: { energy: 25, oxygen: 20, water: 20, food: 20 }, environmentNote: 'The same dust can reduce solar input on Mars or contaminate machinery on the Moon.', requiredSequence: ['dust-protection', 'protect-solar', 'reduce-energy', 'emergency-mode', 'repair-equipment'],
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
    ], puzzles: [], minimumResources: { oxygen: 1, water: 1, food: 1, energy: 1 }, environmentNote: 'No single action solves the crisis: prioritize, act, monitor, and adapt.', requiredSequence: ['generate-oxygen', 'restore-power', 'recycle-water', 'repair-equipment', 'emergency-mode', 'reduce-consumption', 'protect-crew', 'contact-control'],
  },
  // ── Levels 9–20 ────────────────────────────────────────────────────────────
  // Trap actions reuse the objectiveId of the real step they tempt the player to skip, so a trap
  // costs points and can break the sequence, but never makes a level impossible to finish.
  {
    levelId: 'level-9', missionId: 'm09', title: 'Polar Ice Prospecting',
    situation: 'A neutron survey shows water ice inside a permanently shadowed crater. The crew must turn it into usable water.',
    scientificContext: 'Ice must be mined, heated and purified before it is safe to drink or split into oxygen and hydrogen.',
    objective: 'Survey, drill, melt, purify and store the water in the right order.',
    actions: [
      action('survey-crater', 'Survey Crater', 'Map where the ice is concentrated.', 'survey'),
      action('deploy-drill', 'Deploy Drill', 'Set up the drill rig at the richest spot.', 'drill', { energy: -6 }),
      action('melt-ice', 'Melt Ice', 'Heat the ice cores in a sealed vessel.', 'melt', { energy: -8 }),
      action('purify-water', 'Purify Water', 'Filter out dust and dissolved minerals.', 'purify', { water: 20, energy: -4 }),
      action('store-water', 'Store Water', 'Move the clean water into habitat tanks.', 'store', { water: 10 }),
      action('skip-filter', 'Skip Filtering', 'Send meltwater straight to the tanks. Risky for the crew.', 'purify', { water: 15 }),
    ],
    puzzles: [{ id: 'ice-yield', question: 'A drill core holds 20% water ice by mass. How much water can 50 kg of core give?', options: ['5 kg', '10 kg', '20 kg', '40 kg'], correctOption: '10 kg', correctFeedback: 'Correct: 50 × 0.20 = 10 kg of water.', wrongFeedback: 'Multiply the core mass by the ice fraction (20% = 0.20).', correctPoints: 100, wrongPoints: -20 }],
    minimumResources: { energy: 30, oxygen: 30, water: 20, food: 25 }, environmentNote: 'Lunar polar ice is a resource: it can become drinking water, air and even rocket fuel.',
    requiredSequence: ['survey-crater', 'deploy-drill', 'melt-ice', 'purify-water', 'store-water'],
  },
  {
    levelId: 'level-10', missionId: 'm10', title: 'Martian Greenhouse',
    situation: 'The first crops are struggling. Night temperatures are dropping and light levels are uneven.',
    scientificContext: 'Plants turn CO2 and light into food and oxygen. Mars has plenty of CO2 but very little warmth and no breathable air.',
    objective: 'Prepare the beds, light and water them, add CO2, and harvest.',
    actions: [
      action('prepare-soil', 'Prepare Soil', 'Mix washed regolith with compost.', 'soil', { energy: -3 }),
      action('set-grow-lights', 'Set Grow Lights', 'Supplement weak sunlight with LEDs.', 'light', { energy: -8 }),
      action('irrigate-crops', 'Irrigate Crops', 'Deliver nutrient water to the roots.', 'water', { water: -6 }),
      action('add-co2', 'Enrich CO2', 'Feed crops with filtered Martian CO2.', 'co2', { energy: -2 }),
      action('harvest-crops', 'Harvest Crops', 'Collect mature plants for the crew.', 'harvest', { food: 25, oxygen: 6 }),
      action('overwater', 'Flood the Beds', 'More water is always better, right?', 'water', { water: -20 }),
    ],
    puzzles: [{ id: 'photosynthesis', question: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], correctOption: 'Carbon dioxide', correctFeedback: 'Correct: plants take in CO2 and release oxygen.', wrongFeedback: 'Plants use carbon dioxide and give off oxygen.', correctPoints: 100, wrongPoints: -20 }],
    minimumResources: { energy: 30, oxygen: 30, water: 35, food: 20 }, environmentNote: 'A greenhouse is a life-support system: it makes food and air, but only if light, water and warmth stay balanced.',
    requiredSequence: ['prepare-soil', 'set-grow-lights', 'irrigate-crops', 'add-co2', 'harvest-crops'],
  },
  {
    levelId: 'level-11', missionId: 'm11', title: 'Solar Storm Shelter',
    situation: 'Forecasters warn of a solar particle event in a few hours. Radiation outside is about to spike.',
    scientificContext: 'Dense, hydrogen-rich material such as water absorbs radiation. Crews shelter in the best-shielded room until the storm passes.',
    objective: 'Recall the crew, seal the shelter, shield it, power down non-essentials and wait out the storm.',
    actions: [
      action('recall-crew', 'Recall Crew', 'Bring everyone inside from the surface.', 'recall'),
      action('seal-shelter', 'Seal Storm Shelter', 'Close the shielded core of the habitat.', 'seal', { energy: -3 }),
      action('shield-water', 'Move Water Walls', 'Place water tanks around the shelter.', 'shield', { energy: -5 }),
      action('power-down', 'Power Down Non-Essentials', 'Shut down labs and workshops.', 'conserve', { energy: 10 }),
      action('monitor-dose', 'Monitor Dose', 'Track radiation until the all-clear.', 'monitor', { energy: -2 }),
      action('stay-outside', 'Finish the EVA', 'Complete the experiment outside first.', 'recall', { oxygen: -10 }),
    ],
    puzzles: [{ id: 'radiation-rule', question: 'Which is the best radiation shield?', options: ['A thin metal sheet', 'A thick layer of water', 'A glass window', 'A cotton blanket'], correctOption: 'A thick layer of water', correctFeedback: 'Correct: hydrogen-rich water blocks particle radiation very well.', wrongFeedback: 'Hydrogen-rich materials such as water are very effective shields.', correctPoints: 100, wrongPoints: -30 }],
    minimumResources: { energy: 35, oxygen: 35, water: 30, food: 25 }, environmentNote: 'Radiation safety is time, distance and shielding. In a storm, shielding is the only one you can add quickly.',
    requiredSequence: ['recall-crew', 'seal-shelter', 'shield-water', 'power-down', 'monitor-dose'],
  },
  {
    levelId: 'level-12', missionId: 'm12', title: 'Rover Expedition',
    situation: 'A scientific team needs rock samples from a distant canyon. The rover has a long way to go and a hard return deadline.',
    scientificContext: 'EVA planning uses the rule of thirds: one third of the oxygen going out, one third coming back, and one third in reserve.',
    objective: 'Check suits, plan the route, drive out, collect samples and return with margin.',
    actions: [
      action('check-suits', 'Check Suits', 'Test seals, oxygen and radios on every suit.', 'suits', { oxygen: -2 }),
      action('plan-route', 'Plan Route', 'Choose a path that avoids steep slopes.', 'route'),
      action('drive-out', 'Drive to Canyon', 'Take the rover to the sample site.', 'drive', { energy: -10 }),
      action('collect-samples', 'Collect Samples', 'Gather and seal rock cores.', 'samples', { oxygen: -4 }),
      action('return-base', 'Return to Base', 'Drive home with oxygen to spare.', 'return', { energy: -10 }),
      action('extend-trip', 'Extend the Trip', 'Explore one more ridge before heading back.', 'return', { oxygen: -15, energy: -10 }),
    ],
    puzzles: [{ id: 'eva-thirds', question: 'A suit holds 9 hours of oxygen. Using the rule of thirds, how long can the outbound leg be?', options: ['1 hour', '3 hours', '6 hours', '9 hours'], correctOption: '3 hours', correctFeedback: 'Correct: 9 ÷ 3 = 3 hours out, 3 back, 3 in reserve.', wrongFeedback: 'Split the oxygen in three: out, back and reserve.', correctPoints: 100, wrongPoints: -25 }],
    minimumResources: { energy: 40, oxygen: 40, water: 30, food: 25 }, environmentNote: 'Most EVA accidents come from shrinking margins, not from a single failure.',
    requiredSequence: ['check-suits', 'plan-route', 'drive-out', 'collect-samples', 'return-base'],
  },
  {
    levelId: 'level-13', missionId: 'm13', title: 'Far Side Blackout',
    situation: 'The relay satellite has stopped responding. The crew can no longer talk to Earth from the far side of the Moon.',
    scientificContext: 'Radio waves travel in straight lines, so the Moon blocks them. A relay in orbit bends the link around the far side.',
    objective: 'Diagnose the link, switch to backup, re-aim the antenna, report and confirm contact.',
    actions: [
      action('check-link', 'Check Link Status', 'Read the antenna diagnostics.', 'diagnose'),
      action('switch-backup', 'Switch to Backup Radio', 'Move to the redundant transmitter.', 'backup', { energy: -4 }),
      action('aim-antenna', 'Re-aim Antenna', 'Point the dish at the relay satellite.', 'aim', { energy: -3 }),
      action('send-status', 'Send Status Report', 'Transmit crew and habitat status.', 'report', { energy: -2 }),
      action('confirm-contact', 'Confirm Contact', 'Wait for a response from Earth.', 'confirm'),
      action('ignore-fault', 'Ignore the Fault', 'Hope the link comes back by itself.', 'diagnose', { energy: -1 }),
    ],
    puzzles: [{ id: 'line-of-sight', question: 'Why can the far side of the Moon not talk directly to Earth?', options: ['It is too cold', 'The Moon blocks radio waves', 'There is no gravity', 'Earth is too far'], correctOption: 'The Moon blocks radio waves', correctFeedback: 'Correct: radio travels in straight lines, and the Moon is in the way.', wrongFeedback: 'Radio needs a clear line of sight. The Moon itself is the obstacle.', correctPoints: 100, wrongPoints: -25 }],
    minimumResources: { energy: 35, oxygen: 35, water: 30, food: 30 }, environmentNote: 'Redundancy matters: a single radio is a single point of failure.',
    requiredSequence: ['check-link', 'switch-backup', 'aim-antenna', 'send-status', 'confirm-contact'],
  },
  {
    levelId: 'level-14', missionId: 'm14', title: 'Regolith Processing',
    situation: 'The soil for the greenhouse is contaminated with perchlorates, which are toxic to humans and damage the thyroid.',
    scientificContext: 'Perchlorates dissolve in water, so washing the regolith and filtering the runoff makes it safe for plants.',
    objective: 'Collect, test, wash, filter and certify the soil before planting.',
    actions: [
      action('collect-regolith', 'Collect Regolith', 'Scoop soil from the surface.', 'collect', { energy: -4 }),
      action('test-soil', 'Test Soil', 'Measure the perchlorate level.', 'test', { energy: -1 }),
      action('wash-soil', 'Wash Soil', 'Rinse the regolith with recycled water.', 'wash', { water: -12, energy: -4 }),
      action('filter-runoff', 'Filter Runoff', 'Remove toxins from the wash water.', 'filter', { water: 8, energy: -5 }),
      action('certify-soil', 'Certify Soil', 'Re-test and approve the soil for planting.', 'certify'),
      action('plant-now', 'Plant Right Away', 'Skip the washing to save time.', 'certify', { food: -5 }),
    ],
    puzzles: [{ id: 'perchlorate', question: 'Why does washing remove perchlorates from the soil?', options: ['They evaporate', 'They dissolve in water', 'They melt', 'They turn into oxygen'], correctOption: 'They dissolve in water', correctFeedback: 'Correct: perchlorate salts dissolve, so they leave with the wash water.', wrongFeedback: 'Perchlorates are salts that dissolve in water.', correctPoints: 100, wrongPoints: -25 }],
    minimumResources: { energy: 35, oxygen: 30, water: 45, food: 25 }, environmentNote: 'A resource can also be a hazard. Always test before you trust it.',
    requiredSequence: ['collect-regolith', 'test-soil', 'wash-soil', 'filter-runoff', 'certify-soil'],
  },
  {
    levelId: 'level-15', missionId: 'm15', title: 'Hull Breach',
    situation: 'Alarms are sounding. A micrometeoroid has punctured a module and cabin pressure is falling.',
    scientificContext: 'Pressure loss is fastest at first. Crews close the hatch to the leaking module, patch it, then repressurise.',
    objective: 'Alarm, isolate, patch, repressurise and verify. In that order.',
    actions: [
      action('sound-alarm', 'Sound Alarm', 'Warn the crew and Mission Control.', 'alarm'),
      action('isolate-module', 'Isolate Module', 'Close the hatch to the leaking module.', 'isolate', { oxygen: -3 }),
      action('patch-hull', 'Patch Hull', 'Apply an emergency patch to the hole.', 'patch', { energy: -6 }),
      action('repressurise', 'Repressurise', 'Refill the module with air.', 'repressurise', { oxygen: -10, energy: -5 }),
      action('verify-seal', 'Verify Seal', 'Check pressure holds for ten minutes.', 'verify'),
      action('open-hatch', 'Open the Hatch to Look', 'Check the damage in person.', 'isolate', { oxygen: -25 }),
    ],
    puzzles: [{ id: 'leak-rate', question: 'A module loses 2 kPa of pressure per minute. How much does it lose in 5 minutes?', options: ['5 kPa', '7 kPa', '10 kPa', '20 kPa'], correctOption: '10 kPa', correctFeedback: 'Correct: 2 × 5 = 10 kPa.', wrongFeedback: 'Multiply the leak rate by the number of minutes.', correctPoints: 100, wrongPoints: -25 }],
    minimumResources: { energy: 40, oxygen: 45, water: 30, food: 25 }, environmentNote: 'In a breach, isolating the damaged module is always step one, before any repair.',
    requiredSequence: ['sound-alarm', 'isolate-module', 'patch-hull', 'repressurise', 'verify-seal'],
  },
  {
    levelId: 'level-16', missionId: 'm16', title: 'Propellant Depot',
    situation: 'The return rocket is empty. The only way home is to make fuel from what Mars provides.',
    scientificContext: 'The Sabatier reaction combines CO2 from the air with hydrogen to make methane fuel and water.',
    objective: 'Capture CO2, split water for hydrogen, run the reactor, liquefy and store methane.',
    actions: [
      action('capture-co2', 'Capture CO2', 'Compress CO2 from the Martian atmosphere.', 'capture', { energy: -8 }),
      action('electrolyse-water', 'Electrolyse Water', 'Split water to get hydrogen.', 'hydrogen', { water: -10, oxygen: 8, energy: -10 }),
      action('run-sabatier', 'Run Sabatier Reactor', 'Combine CO2 and hydrogen into methane and water.', 'react', { water: 10, energy: -6 }),
      action('liquefy-methane', 'Liquefy Methane', 'Cool methane so it can be stored.', 'liquefy', { energy: -8 }),
      action('fill-tanks', 'Fill Propellant Tanks', 'Transfer fuel to the return vehicle.', 'fill'),
      action('vent-methane', 'Vent Excess Methane', 'Release gas to save time.', 'fill', { energy: -2 }),
    ],
    puzzles: [{ id: 'sabatier', question: 'The Sabatier reaction makes methane and which other product?', options: ['Water', 'Helium', 'Iron', 'Salt'], correctOption: 'Water', correctFeedback: 'Correct: CO2 + 4H2 → CH4 + 2H2O. The water can be recycled.', wrongFeedback: 'The reaction produces methane and water.', correctPoints: 100, wrongPoints: -25 }],
    minimumResources: { energy: 50, oxygen: 30, water: 35, food: 25 }, environmentNote: 'Making propellant on Mars saves tonnes of cargo that would otherwise have to be launched from Earth.',
    requiredSequence: ['capture-co2', 'electrolyse-water', 'run-sabatier', 'liquefy-methane', 'fill-tanks'],
  },
  {
    levelId: 'level-17', missionId: 'm17', title: 'Global Dust Storm',
    situation: 'The sky has gone dark across the whole planet. Solar output has fallen by about 90 percent.',
    scientificContext: 'Dust scatters and absorbs sunlight. A power budget decides which systems stay on when energy is scarce.',
    objective: 'Build a power budget, cut loads, protect life support, ration supplies and clean the panels.',
    actions: [
      action('assess-power', 'Assess Power Budget', 'List every load and the energy left.', 'assess'),
      action('shed-loads', 'Shed Non-Essential Loads', 'Switch off labs, lighting and comfort heating.', 'shed', { energy: 14 }),
      action('protect-life-support', 'Protect Life Support', 'Reserve battery for air and water systems.', 'priority', { energy: 6, oxygen: 4 }),
      action('ration-supplies', 'Ration Supplies', 'Reduce meals to extend stores.', 'ration', { food: 10, water: 6 }),
      action('clean-panels', 'Clean Panels', 'Brush dust off once the wind drops.', 'clean', { energy: 10 }),
      action('run-everything', 'Run Everything Normally', 'Keep every system on and hope for the best.', 'shed', { energy: -25 }),
    ],
    puzzles: [{ id: 'storm-budget', question: 'You have 120 kWh of battery and use 8 kWh per day. How many days will it last?', options: ['8', '12', '15', '20'], correctOption: '15', correctFeedback: 'Correct: 120 ÷ 8 = 15 days.', wrongFeedback: 'Divide the stored energy by the daily use.', correctPoints: 100, wrongPoints: -25 }],
    minimumResources: { energy: 40, oxygen: 35, water: 35, food: 35 }, environmentNote: 'When energy is limited, life support always comes first, then communications, then everything else.',
    requiredSequence: ['assess-power', 'shed-loads', 'protect-life-support', 'ration-supplies', 'clean-panels'],
  },
  {
    levelId: 'level-18', missionId: 'm18', title: 'The Long Lunar Night',
    situation: 'The Sun has set for fourteen days. Surface temperatures are falling toward minus 170 degrees Celsius.',
    scientificContext: 'Without sunlight, a base lives on batteries or a nuclear source and must keep its heat with insulation.',
    objective: 'Charge batteries, insulate, reduce loads, run the heaters and make it to sunrise.',
    actions: [
      action('charge-batteries', 'Charge Batteries to Full', 'Top up every cell before sunset.', 'charge', { energy: 20 }),
      action('deploy-insulation', 'Deploy Insulation Blankets', 'Cover exposed modules.', 'insulate', { energy: -4 }),
      action('night-mode', 'Enter Night Mode', 'Reduce every load to the minimum.', 'conserve', { energy: 12 }),
      action('run-heaters', 'Run Habitat Heaters', 'Keep the interior above freezing.', 'heat', { energy: -12 }),
      action('check-sunrise', 'Track Sunrise', 'Watch for the first light on the ridge.', 'sunrise'),
      action('skip-airlock-check', 'Skip Airlock Heater Check', 'Save a little power.', 'heat', { energy: -6, oxygen: -6 }),
    ],
    puzzles: [{ id: 'lunar-night', question: 'About how long is one lunar night at the equator?', options: ['12 hours', '14 Earth days', '3 months', '1 year'], correctOption: '14 Earth days', correctFeedback: 'Correct: the Moon turns once per month, so night lasts about 14 days.', wrongFeedback: 'A lunar day-night cycle is about 29 Earth days, so night lasts about half of that.', correctPoints: 100, wrongPoints: -25 }],
    minimumResources: { energy: 55, oxygen: 35, water: 35, food: 35 }, environmentNote: 'Heat is a resource too: every watt kept inside the walls is a watt you do not have to generate.',
    requiredSequence: ['charge-batteries', 'deploy-insulation', 'night-mode', 'run-heaters', 'check-sunrise'],
  },
  {
    levelId: 'level-19', missionId: 'm19', title: 'Medical Emergency',
    situation: 'A crew member has a deep injury. Earth is many light-minutes away, so the crew has to treat it alone.',
    scientificContext: 'Deep-space medicine works from triage to stabilisation using a limited kit. Communication delay makes autonomy essential.',
    objective: 'Triage, stabilise, treat, consult Earth and monitor recovery.',
    actions: [
      action('triage-patient', 'Triage Patient', 'Assess airway, bleeding and consciousness.', 'triage'),
      action('stabilise-patient', 'Stabilise Patient', 'Stop bleeding and secure the airway.', 'stabilise', { oxygen: -3 }),
      action('treat-injury', 'Treat Injury', 'Clean, close and dress the wound.', 'treat', { water: -4, energy: -3 }),
      action('consult-earth', 'Consult Earth', 'Send a medical report. Replies take minutes.', 'consult', { energy: -2 }),
      action('monitor-recovery', 'Monitor Recovery', 'Check vitals every hour.', 'monitor', { energy: -2 }),
      action('delay-treatment', 'Wait for Earth First', 'Do nothing until a reply arrives.', 'consult', { oxygen: -2 }),
    ],
    puzzles: [{ id: 'signal-delay', question: 'Earth is 20 light-minutes away. How long until you get a reply to your message?', options: ['20 minutes', '40 minutes', '10 minutes', 'Instantly'], correctOption: '40 minutes', correctFeedback: 'Correct: 20 minutes there plus 20 minutes back.', wrongFeedback: 'The signal has to travel there and back.', correctPoints: 100, wrongPoints: -25 }],
    minimumResources: { energy: 40, oxygen: 40, water: 40, food: 35 }, environmentNote: 'With a long communication delay, the crew decides first and Earth advises later.',
    requiredSequence: ['triage-patient', 'stabilise-patient', 'treat-injury', 'consult-earth', 'monitor-recovery'],
  },
  {
    levelId: 'level-20', missionId: 'm20', title: "Commander's Final Trial",
    situation: 'A dust storm, a failing generator, a sick crewmate and a closing launch window all at once.',
    scientificContext: 'Real missions fail from coupled problems. Commanders triage, delegate and keep every critical resource above zero.',
    objective: 'Run the full emergency response, in priority order, until the crew is safe.',
    actions: [
      action('assess-situation', 'Assess the Situation', 'Rank every problem by danger to the crew.', 'assess'),
      action('protect-crew', 'Protect Crew', 'Move everyone to the safest zone.', 'crew', { oxygen: -2, energy: -3 }),
      action('stabilise-power', 'Stabilise Power', 'Shed loads and bring the backup generator online.', 'power', { energy: 18 }),
      action('restore-air', 'Restore Air and Water', 'Recover oxygen and recycle water.', 'life-support', { oxygen: 12, water: 12, energy: -8 }),
      action('treat-crewmate', 'Treat Crewmate', 'Stabilise the injured astronaut.', 'medical', { energy: -3 }),
      action('repair-systems', 'Repair Critical Systems', 'Fix the damaged hardware.', 'repair', { energy: -8 }),
      action('call-control', 'Report to Mission Control', 'Send a full status report and decision log.', 'report', { energy: -2 }),
      action('panic-launch', 'Launch Early', 'Abandon the base before the window opens.', 'report', { oxygen: -20, energy: -20 }),
    ],
    puzzles: [{ id: 'priority-order', question: 'In a multi-system emergency, what do you fix first?', options: ['The most comfortable system', 'The one that threatens the crew soonest', 'The easiest repair', 'The newest equipment'], correctOption: 'The one that threatens the crew soonest', correctFeedback: 'Correct: triage means danger to life comes first.', wrongFeedback: 'Triage ranks problems by how soon they threaten the crew.', correctPoints: 150, wrongPoints: -40 }],
    minimumResources: { energy: 40, oxygen: 40, water: 40, food: 40 }, environmentNote: 'No single action solves a cascade: prioritise, act, monitor and adapt.',
    requiredSequence: ['assess-situation', 'protect-crew', 'stabilise-power', 'restore-air', 'treat-crewmate', 'repair-systems', 'call-control'],
  },
]

export function getMissionOperation(levelIdOrMissionId: string): MissionOperationDefinition | undefined {
  return MISSION_OPERATIONS.find((mission) => mission.levelId === levelIdOrMissionId || mission.missionId === levelIdOrMissionId)
}
