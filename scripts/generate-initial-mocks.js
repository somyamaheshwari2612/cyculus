// Helper to generate realistic mock LogEntry[] for the 3 personas: regular, irregular (Riya), and heavy
const fs = require('fs');
const path = require('path');

function createEntriesForCycles({ cycles, personaType }) {
  const entries = [];
  const entriesMap = new Map();

  cycles.forEach((cycle, cycleIdx) => {
    const cycleStart = new Date(cycle.startDate);
    const bleedingLength = cycle.bleedingDays || 5;

    for (let dayOffset = 0; dayOffset < cycle.lengthDays; dayOffset++) {
      const curDate = new Date(cycleStart);
      curDate.setDate(curDate.getDate() + dayOffset);
      const dateStr = curDate.toISOString().split('T')[0];

      if (dateStr > '2026-10-24') continue;

      let flow = null;
      let painLevel = null;
      const symptoms = [];
      const moods = [];
      let notes = '';

      if (dayOffset < bleedingLength) {
        // Bleeding period
        if (personaType === 'heavy') {
          flow = dayOffset < 4 ? 'heavy' : 'medium';
          painLevel = dayOffset === 0 ? 8 : (dayOffset < 3 ? 7 : 4);
          symptoms.push('cramps', 'lower_back_pain', 'fatigue');
          if (dayOffset === 1) symptoms.push('blood_clots');
          moods.push('low', 'irritable');
          if (dayOffset === 1) notes = 'Bohat zyada bleeding ho rahi hai aur kamar mein dard hai';
        } else if (personaType === 'irregular') {
          if (dayOffset === 0) flow = 'medium';
          else if (dayOffset === 1 || dayOffset === 2) flow = 'heavy';
          else if (dayOffset === 3) flow = 'light';
          else flow = 'spotting';

          painLevel = dayOffset === 1 ? 8 : (dayOffset === 0 ? 6 : 3);
          symptoms.push('cramps');
          if (dayOffset <= 2) symptoms.push('pelvic_pain', 'bloating');
          moods.push('irritable', 'anxious');
          if (dayOffset === 1 && cycleIdx === cycles.length - 1) {
            notes = 'kal se pet mein bohot dard hai aur flow heavy hai';
          }
        } else {
          // Regular
          if (dayOffset === 0) flow = 'light';
          else if (dayOffset === 1) flow = 'heavy';
          else if (dayOffset === 2) flow = 'medium';
          else if (dayOffset === 3) flow = 'light';
          else flow = 'spotting';

          painLevel = dayOffset === 1 ? 5 : (dayOffset === 0 ? 3 : 1);
          symptoms.push('cramps');
          if (dayOffset === 1) symptoms.push('headache');
          moods.push('low');
        }
      } else if (dayOffset >= bleedingLength && dayOffset < bleedingLength + 7) {
        // Early follicular
        if (dayOffset % 2 === 0) {
          painLevel = 0;
          moods.push('calm', 'happy');
        }
      } else if (dayOffset >= 12 && dayOffset <= 16) {
        // Mid cycle
        if (personaType === 'irregular' && dayOffset === 14 && cycleIdx === 1) {
          flow = 'spotting';
          symptoms.push('discharge_change');
        }
        if (dayOffset === 14) {
          moods.push('happy');
        }
      } else if (dayOffset >= cycle.lengthDays - 5) {
        // Luteal / PMS
        painLevel = 2;
        symptoms.push('bloating', 'breast_tenderness');
        moods.push('mood_swings', 'anxious');
        if (dayOffset === cycle.lengthDays - 2) {
          symptoms.push('cravings');
        }
      }

      // Only add days where something was logged, or active bleeding days
      if (flow !== null || painLevel !== null || symptoms.length > 0 || moods.length > 0 || notes !== '') {
        const entry = {
          date: dateStr,
          flow: flow,
          painLevel: painLevel,
          symptoms: Array.from(new Set(symptoms)),
          moods: Array.from(new Set(moods)),
          notes: notes,
          sources: notes ? ['text', 'tap'] : ['tap'],
          rawTexts: notes ? [notes] : [],
          updatedAt: `${dateStr}T20:15:00.000Z`
        };
        entriesMap.set(dateStr, entry);
      }
    }
  });

  return Array.from(entriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// 1. Regular persona: cycles of 28, 29, 28, 29, 28, 29 days
const regularCycles = [
  { startDate: '2026-05-02', lengthDays: 28, bleedingDays: 5 },
  { startDate: '2026-05-30', lengthDays: 29, bleedingDays: 5 },
  { startDate: '2026-06-28', lengthDays: 28, bleedingDays: 5 },
  { startDate: '2026-07-26', lengthDays: 29, bleedingDays: 5 },
  { startDate: '2026-08-24', lengthDays: 28, bleedingDays: 5 },
  { startDate: '2026-09-21', lengthDays: 29, bleedingDays: 5 },
  { startDate: '2026-10-20', lengthDays: 28, bleedingDays: 5 } // current ongoing cycle
];

// 2. Irregular persona (Riya, 22): cycles 32, 27, 36, 29, and latest cycle is 41 days!
const irregularCycles = [
  { startDate: '2026-05-05', lengthDays: 32, bleedingDays: 5 },
  { startDate: '2026-06-06', lengthDays: 27, bleedingDays: 5 },
  { startDate: '2026-07-03', lengthDays: 36, bleedingDays: 6 },
  { startDate: '2026-08-08', lengthDays: 29, bleedingDays: 5 },
  { startDate: '2026-09-06', lengthDays: 41, bleedingDays: 5 }, // 41 day cycle before Oct 17
  { startDate: '2026-10-17', lengthDays: 35, bleedingDays: 6 }  // current cycle
];

// 3. Heavy persona: cycles 27, 28, 27, 28, 28 days with heavy bleeding 4+ days
const heavyCycles = [
  { startDate: '2026-05-10', lengthDays: 28, bleedingDays: 6 },
  { startDate: '2026-06-07', lengthDays: 27, bleedingDays: 7 },
  { startDate: '2026-07-04', lengthDays: 28, bleedingDays: 6 },
  { startDate: '2026-08-01', lengthDays: 28, bleedingDays: 7 },
  { startDate: '2026-08-29', lengthDays: 27, bleedingDays: 6 },
  { startDate: '2026-09-25', lengthDays: 28, bleedingDays: 7 },
  { startDate: '2026-10-23', lengthDays: 28, bleedingDays: 6 } // ongoing
];

const targetDir = path.join(__dirname, '..', 'src', 'shared', 'mocks');
fs.mkdirSync(targetDir, { recursive: true });

fs.writeFileSync(
  path.join(targetDir, 'entries.regular.json'),
  JSON.stringify(createEntriesForCycles({ cycles: regularCycles, personaType: 'regular' }), null, 2)
);

fs.writeFileSync(
  path.join(targetDir, 'entries.irregular.json'),
  JSON.stringify(createEntriesForCycles({ cycles: irregularCycles, personaType: 'irregular' }), null, 2)
);

fs.writeFileSync(
  path.join(targetDir, 'entries.heavy.json'),
  JSON.stringify(createEntriesForCycles({ cycles: heavyCycles, personaType: 'heavy' }), null, 2)
);

console.log('Successfully generated entries.regular.json, entries.irregular.json, and entries.heavy.json');
