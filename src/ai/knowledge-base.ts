// src/ai/knowledge-base.ts
// Static knowledge base for Astro-AI fallback responses.
// All facts are age-appropriate (8–12), factually accurate, and not claiming live NASA data.
// NO React, Zustand, or Phaser imports.

export interface KnowledgeEntry {
  readonly trigger: string
  readonly explanation: string
  readonly scienceFact: string
  readonly suggestion: string
}

export const KNOWLEDGE_BASE: readonly KnowledgeEntry[] = [
  // ── Resource triggers ──────────────────────────────────────────────────────

  {
    trigger: 'low-oxygen',
    explanation:
      'Your crew\'s oxygen supply is running low — the air inside your habitat is getting ' +
      'thinner and CO₂ is building up fast! The life support system is working extra hard ' +
      'to scrub out the bad air and make fresh oxygen for everyone to breathe. ' +
      'If the oxygen keeps dropping, your crew will feel dizzy and tired, so you need to act now!',
    scienceFact:
      'The International Space Station uses a process called electrolysis to split water ' +
      'molecules into hydrogen and oxygen, giving astronauts fresh air to breathe. ' +
      '(Source: NASA)',
    suggestion:
      'Reduce crew activity to lower oxygen consumption and check your life support system ' +
      'for any leaks or blockages right away.',
  },

  {
    trigger: 'low-water',
    explanation:
      'Your crew\'s water supply is getting dangerously low! Water is precious in space ' +
      'because you cannot just turn on a tap like you can on Earth. ' +
      'Your habitat recycles water from the air, sweat, and even urine to make it drinkable again — ' +
      'just like a giant water filter. Every drop counts for your crew!',
    scienceFact:
      'The Water Recovery System on the International Space Station recycles about 93% of ' +
      'all the water used by astronauts, including moisture collected from the cabin air. ' +
      '(Source: NASA)',
    suggestion:
      'Switch all systems to water-conservation mode and check the recycling unit for any ' +
      'faults that might be wasting precious water.',
  },

  {
    trigger: 'low-food',
    explanation:
      'Your crew\'s food supplies are running low and your crew members are going to get hungry! ' +
      'Growing food in space is tricky because there is no soil and the light comes from special ' +
      'LED lamps instead of the Sun. But scientists have shown that plants can grow in space — ' +
      'your agriculture module is one of your most important survival tools!',
    scienceFact:
      'NASA\'s Veggie experiment on the International Space Station has successfully grown ' +
      'lettuce, kale, and other plants in microgravity, proving that space farming is possible. ' +
      '(Source: NASA)',
    suggestion:
      'Activate any reserve food supplies immediately and make sure your agriculture module ' +
      'is running at maximum capacity to grow more food as fast as possible.',
  },

  {
    trigger: 'low-energy',
    explanation:
      'Your habitat\'s power levels are dropping and your crew is in trouble! ' +
      'Almost every system in your base needs electricity — life support, heating, lights, ' +
      'and communications all depend on your solar panels and batteries. ' +
      'If the power runs out, your crew could be in serious danger, so every watt counts!',
    scienceFact:
      'The International Space Station\'s solar arrays cover about 2,500 square metres — ' +
      'roughly the size of a football field — and can generate up to 120 kilowatts of electricity. ' +
      '(Source: NASA)',
    suggestion:
      'Shut down all non-essential systems immediately to save power and make sure your ' +
      'solar panels are pointed directly at the Sun for maximum energy production.',
  },

  {
    trigger: 'radiation-high',
    explanation:
      'Radiation levels around your habitat are getting dangerously high! ' +
      'Space radiation comes from the Sun and from deep space, and it can damage ' +
      'the cells in your crew\'s bodies over time. ' +
      'Your habitat walls and special shielding are like a protective shell keeping ' +
      'your crew as safe as possible from these invisible rays.',
    scienceFact:
      'Astronauts on the International Space Station receive about 10 times more radiation ' +
      'per day than people on Earth\'s surface, because Earth\'s magnetic field provides ' +
      'extra protection we do not have in deep space. (Source: NASA)',
    suggestion:
      'Move your crew to the most shielded section of the habitat and reduce time spent ' +
      'near the outer walls or airlocks until radiation levels come back down.',
  },

  // ── Lunar event triggers ───────────────────────────────────────────────────

  {
    trigger: 'lunar-dust-contamination',
    explanation:
      'Moon dust — called regolith — has gotten into your base\'s filters and your crew needs to ' +
      'deal with it fast! Unlike Earth dust, lunar regolith is made of tiny razor-sharp particles ' +
      'that have never been worn smooth by wind or rain. ' +
      'It sticks to everything and can clog your life support system if your crew does not ' +
      'clean it out quickly.',
    scienceFact:
      'Lunar regolith particles are extremely abrasive and carry an electrostatic charge ' +
      'from exposure to solar radiation, which makes them cling to suits, equipment, ' +
      'and surfaces. NASA considers dust management a top challenge for Moon bases. (Source: NASA)',
    suggestion:
      'Send your maintenance crew to clean the air filters and install dust shields ' +
      'before the contamination gets worse and reduces your life support efficiency.',
  },

  {
    trigger: 'lunar-night-begins',
    explanation:
      'The Sun has set on your part of the Moon and it will not rise again for 14 whole Earth days! ' +
      'Your solar panels cannot make any power in the dark, so your crew must live entirely on ' +
      'the energy stored in your batteries. ' +
      'Fourteen days is a very long time, and every watt your crew uses brings you closer to ' +
      'running out of power!',
    scienceFact:
      'Because the Moon rotates very slowly, one lunar day lasts about 29.5 Earth days — ' +
      'meaning each side of the Moon experiences nearly two weeks of constant sunlight ' +
      'followed by two weeks of total darkness. (Source: NASA)',
    suggestion:
      'Switch to power-saving mode right away — dim the lights, lower the temperature slightly, ' +
      'and pause any experiments that are not critical to keeping your crew alive.',
  },

  {
    trigger: 'solar-flare-warning',
    explanation:
      'A massive solar flare is heading straight toward the Moon and your crew is in danger! ' +
      'A solar flare is an enormous explosion of energy from the Sun that blasts dangerous ' +
      'radiation across the solar system. ' +
      'Earth is protected by its magnetic field, but the Moon has no such shield — ' +
      'your crew could receive a harmful dose of radiation if they are not sheltered in time!',
    scienceFact:
      'Major solar energetic particle events can deliver radiation dose rates exceeding ' +
      '1 sievert per hour to unprotected astronauts on the lunar surface — a potentially ' +
      'lethal level with prolonged exposure. (Source: NASA)',
    suggestion:
      'Order your entire crew to move immediately to the most radiation-shielded section ' +
      'of the base and stay there until the solar particle storm passes.',
  },

  {
    trigger: 'micrometeorite-impact',
    explanation:
      'A tiny space rock has smashed into your solar panel array at incredible speed! ' +
      'The Moon has no atmosphere to slow down or burn up incoming rocks, so even a ' +
      'micrometeorite the size of a grain of sand can cause serious damage. ' +
      'Your crew\'s power production has dropped and repairs need to happen quickly!',
    scienceFact:
      'Without a protective atmosphere, the lunar surface is constantly bombarded by ' +
      'micrometeorites traveling at speeds of 10 to 70 kilometres per second — ' +
      'faster than a bullet. (Source: NASA)',
    suggestion:
      'Dispatch a repair team on an EVA spacewalk to fix the damaged panels as quickly ' +
      'as possible so your crew can restore full power production.',
  },

  // ── Martian event triggers ─────────────────────────────────────────────────

  {
    trigger: 'regional-dust-storm',
    explanation:
      'A huge dust storm is sweeping across your region of Mars and heading straight for your base! ' +
      'Martian dust storms can grow to cover entire continents and block sunlight for weeks, ' +
      'which means your solar panels will produce much less power than normal. ' +
      'Your crew needs to prepare right now before the storm reaches you!',
    scienceFact:
      'In 2018, a massive global dust storm on Mars reduced sunlight so much that ' +
      'NASA\'s Opportunity rover — which had been exploring Mars for 15 years — ' +
      'ran out of power and never woke up again. (Source: NASA)',
    suggestion:
      'Pre-charge your batteries to maximum capacity and switch to power-saving mode ' +
      'before the storm arrives to give your crew the best chance of surviving it.',
  },

  {
    trigger: 'dust-storm-clears',
    explanation:
      'Amazing news — the dust storm is finally clearing and sunlight is returning to your solar panels! ' +
      'Your crew did a fantastic job managing through the storm and protecting the mission. ' +
      'Power production is coming back online and your habitat can start returning to normal operations. ' +
      'This is a moment to celebrate — surviving a Mars dust storm is no small achievement!',
    scienceFact:
      'NASA\'s Mars Color Imager (MARCI) instrument on the Mars Reconnaissance Orbiter ' +
      'monitors dust storm activity across the entire planet every single day, ' +
      'helping scientists track when storms form, grow, and clear. (Source: NASA)',
    suggestion:
      'Gradually bring all systems back online and use the returning solar power to recharge ' +
      'your batteries fully before the next storm might arrive.',
  },

  {
    trigger: 'co2-frost-formation',
    explanation:
      'Carbon dioxide gas from the Martian atmosphere is freezing onto your thermal panels ' +
      'and agriculture greenhouse during the cold Martian night! ' +
      'CO₂ frost is basically dry ice — the same stuff used in stage fog machines — ' +
      'and it forms because the Martian atmosphere is mostly CO₂ and temperatures drop ' +
      'very low at night. The frost is blocking heat from reaching your crops!',
    scienceFact:
      'The Martian atmosphere is 95.3% carbon dioxide, and CO₂ freezes at -78.5°C — ' +
      'NASA\'s Phoenix lander actually observed CO₂ snowfall near the Martian north pole. ' +
      '(Source: NASA)',
    suggestion:
      'Activate your thermal heaters to clear the frost from the panels before your crops ' +
      'suffer too much damage from the cold.',
  },

  {
    trigger: 'global-dust-storm',
    explanation:
      'A global dust storm is now covering the entire planet of Mars — and your crew is in ' +
      'a real emergency! These planet-wide storms are the biggest storms in the entire solar system ' +
      'and can block almost all sunlight for weeks or even months. ' +
      'Your solar panels are producing almost no power, and if your crew does not act immediately, ' +
      'the mission could fail.',
    scienceFact:
      'Global Martian dust storms happen roughly every two to three Martian years and can ' +
      'raise atmospheric dust opacity so high that solar irradiance at the surface drops to ' +
      'less than 1% of its normal level. (Source: NASA)',
    suggestion:
      'Enter emergency power conservation mode immediately — shut down everything that is not ' +
      'essential to keeping your crew alive until the storm passes.',
  },

  // ── General triggers ──────────────────────────────────────────────────────

  {
    trigger: 'mission-start-moon',
    explanation:
      'Welcome to the Moon, Commander! Your crew has landed on the surface of Earth\'s only ' +
      'natural satellite, just 384,400 kilometres from home. ' +
      'The Moon is a place of extreme temperatures, total silence, and stunning views of Earth — ' +
      'and your crew is making history by setting up a permanent habitat here. ' +
      'Every decision you make will determine whether your mission succeeds!',
    scienceFact:
      'The Moon\'s surface temperature swings between -173°C during the lunar night ' +
      'and +127°C during the lunar day — a range of 300 degrees in the same location! ' +
      '(Source: NASA)',
    suggestion:
      'Check all your life support, power, and resource levels carefully at the start ' +
      'of each day to catch any problems before they become emergencies.',
  },

  {
    trigger: 'mission-start-mars',
    explanation:
      'Your crew has arrived at Mars after a seven-month journey through deep space — ' +
      'congratulations, Commander! Mars is the most Earth-like planet in our solar system, ' +
      'but it is still a harsh and dangerous world with dust storms, freezing temperatures, ' +
      'and a thin atmosphere your crew cannot breathe. ' +
      'You are now one of the furthest humans from Earth in history — ' +
      'make every decision count!',
    scienceFact:
      'Mars is about 225 million kilometres from Earth on average, which means radio signals ' +
      'take up to 20 minutes to travel one way — so your crew cannot rely on instant help ' +
      'from mission control. (Source: NASA)',
    suggestion:
      'Monitor your power levels closely from day one, because Martian dust can reduce ' +
      'your solar panel output at any time without warning.',
  },

  {
    trigger: 'mission-success',
    explanation:
      'Your crew has successfully completed the mission — what an incredible achievement! ' +
      'You managed your resources wisely, handled every crisis, and made smart decisions ' +
      'when it mattered most. ' +
      'Your crew is heading home as true heroes of space exploration, ' +
      'and everything they learned will help future missions go even further!',
    scienceFact:
      'Every NASA mission — whether it succeeds or has challenges — produces valuable data ' +
      'that scientists and engineers use to make future missions safer and more capable. ' +
      '(Source: NASA)',
    suggestion:
      'Review your mission log and think about which decisions helped most — ' +
      'those are the skills that real astronauts train for years to master.',
  },

  {
    trigger: 'mission-failure',
    explanation:
      'This mission did not go as planned, but that is not the end of the story, Commander. ' +
      'Every real space mission — including the ones that did not go perfectly — ' +
      'taught scientists something important that made the next mission better. ' +
      'The most important thing is to understand what happened and learn from it, ' +
      'just like real astronauts and engineers do after every mission.',
    scienceFact:
      'NASA studies every mission outcome carefully in a process called a "lessons learned" ' +
      'review, so that the knowledge gained from challenges is used to improve future missions. ' +
      '(Source: NASA)',
    suggestion:
      'Look at your resource history and event decisions to figure out what changed — ' +
      'then try the mission again with that knowledge and see how much further your crew gets!',
  },

  {
    trigger: 'default',
    explanation:
      'Your crew is working hard to manage this space habitat and keep everyone safe! ' +
      'Space exploration is all about solving problems you have never seen before ' +
      'with the equipment and supplies you have on hand. ' +
      'Keep monitoring your resources and be ready to make smart decisions — ' +
      'that is what great mission commanders do!',
    scienceFact:
      'Astronauts on the International Space Station complete over 200 different science ' +
      'experiments at a time, while also maintaining the station and their own health. ' +
      '(Source: NASA)',
    suggestion:
      'Check your resource levels carefully and look for any trends that might signal ' +
      'a problem before it becomes a crisis.',
  },
]

/**
 * Returns the KnowledgeEntry for the given trigger.
 * If no entry is found, returns the 'default' entry (never returns undefined).
 */
export function getKnowledgeEntry(trigger: string): KnowledgeEntry {
  const entry = KNOWLEDGE_BASE.find((e) => e.trigger === trigger)
  if (entry !== undefined) return entry
  // Fall back to 'default' — locate directly to avoid potential infinite recursion
  const defaultEntry = KNOWLEDGE_BASE.find((e) => e.trigger === 'default')
  // 'default' entry is always present in KNOWLEDGE_BASE — this assertion is safe
  // because the static array above always includes it
  if (defaultEntry === undefined) {
    // This should never happen; 'default' is always in KNOWLEDGE_BASE
    throw new Error('Invariant violation: KNOWLEDGE_BASE is missing the default entry')
  }
  return defaultEntry
}
