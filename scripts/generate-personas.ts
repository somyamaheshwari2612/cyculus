import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { LogEntry, FlowLevel, Symptom, Mood, KnowledgeBase } from '../src/shared/types';
import { computeInsights } from '../src/modules/insights/engine/computeInsights';
import knowledgeData from '../src/shared/knowledge.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CycleDef {
  startDate: string;
  lengthDays: number;
  bleedingDays: number;
}

function generateEntriesForPersona({
  cycles,
  persona,
}: {
  cycles: CycleDef[];
  persona: 'regular' | 'irregular' | 'heavy';
}): LogEntry[] {
  const entriesMap = new Map<string, LogEntry>();

  cycles.forEach((cycle, cycleIdx) => {
    const cycleStart = new Date(cycle.startDate);
    const isLastCycle = cycleIdx === cycles.length - 1;

    for (let dayOffset = 0; dayOffset < cycle.lengthDays; dayOffset++) {
      const curDate = new Date(cycleStart);
      curDate.setDate(curDate.getDate() + dayOffset);
      const dateStr = curDate.toISOString().split('T')[0];

      // Don't generate past demo current date: 2026-10-24
      if (dateStr > '2026-10-24') continue;

      let flow: FlowLevel | null = null;
      let painLevel: number | null = null;
      const symptoms: Symptom[] = [];
      const moods: Mood[] = [];
      let notes = '';
      const rawTexts: string[] = [];
      const sources: ('tap' | 'text' | 'voice')[] = ['tap'];

      const bleedingLen = cycle.bleedingDays;

      if (dayOffset < bleedingLen) {
        // --- Bleeding Period ---
        if (persona === 'heavy') {
          // Priya: Heavy bleeding for 4+ days, blood clots, fatigue
          if (dayOffset === 0) flow = 'medium';
          else if (dayOffset <= 3) flow = 'heavy';
          else if (dayOffset <= 5) flow = 'medium';
          else flow = 'light';

          painLevel = dayOffset <= 1 ? 8 : (dayOffset <= 3 ? 6 : 3);
          symptoms.push('cramps', 'fatigue', 'lower_back_pain');
          if (dayOffset === 1 || dayOffset === 2) symptoms.push('blood_clots');
          moods.push('low', 'irritable');

          if (dayOffset === 1 && isLastCycle) {
            notes = 'Bohat zyada bleeding ho rahi hai aur kamar mein dard hai';
            rawTexts.push(notes);
            sources.push('text');
          }
        } else if (persona === 'irregular') {
          // Riya: 22yo college student, irregular cycles, 41-day cycle, pelvic pain
          if (dayOffset === 0) flow = 'medium';
          else if (dayOffset === 1 || dayOffset === 2) flow = 'heavy';
          else if (dayOffset === 3) flow = 'medium';
          else if (dayOffset === 4) flow = 'light';
          else flow = 'spotting';

          painLevel = dayOffset === 1 ? 8 : (dayOffset === 0 ? 6 : (dayOffset === 2 ? 5 : 2));
          symptoms.push('cramps');
          if (dayOffset <= 2) symptoms.push('pelvic_pain', 'bloating');
          moods.push('irritable', 'anxious');

          if (dayOffset === 1 && isLastCycle) {
            notes = 'kal se pet mein bohot dard hai aur flow heavy hai';
            rawTexts.push(notes);
            sources.push('text', 'voice');
          }
        } else {
          // Ananya: Regular persona, 28-29d cycles
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
      } else if (dayOffset >= bleedingLen && dayOffset < bleedingLen + 6) {
        // --- Early Follicular (Post-Period) ---
        if (dayOffset % 2 === 0) {
          painLevel = 0;
          moods.push('calm', 'happy');
        }
      } else if (dayOffset >= 12 && dayOffset <= 16) {
        // --- Mid-Cycle ---
        if (persona === 'irregular' && dayOffset === 14 && cycleIdx === 1) {
          flow = 'spotting';
          symptoms.push('discharge_change');
        }
        if (dayOffset === 14) {
          moods.push('happy');
        }
      } else if (dayOffset >= cycle.lengthDays - 5) {
        // --- Pre-Period (Late Luteal / PMS) ---
        painLevel = 2;
        symptoms.push('bloating', 'breast_tenderness');
        moods.push('mood_swings', 'anxious');
        if (dayOffset === cycle.lengthDays - 2) {
          symptoms.push('cravings');
        }
      }

      // Record entry if user checked in
      if (flow !== null || painLevel !== null || symptoms.length > 0 || moods.length > 0 || notes !== '') {
        const entry: LogEntry = {
          date: dateStr,
          flow,
          painLevel,
          symptoms: Array.from(new Set(symptoms)),
          moods: Array.from(new Set(moods)),
          notes,
          sources: Array.from(new Set(sources)),
          rawTexts,
          updatedAt: `${dateStr}T20:15:00.000Z`,
        };
        entriesMap.set(dateStr, entry);
      }
    }
  });

  return Array.from(entriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// 1. Ananya (Regular): 6 completed cycles of 28, 29, 28, 29, 28, 29 days, ongoing cycle
const regularCycles: CycleDef[] = [
  { startDate: '2026-05-02', lengthDays: 28, bleedingDays: 5 },
  { startDate: '2026-05-30', lengthDays: 29, bleedingDays: 5 },
  { startDate: '2026-06-28', lengthDays: 28, bleedingDays: 5 },
  { startDate: '2026-07-26', lengthDays: 29, bleedingDays: 5 },
  { startDate: '2026-08-24', lengthDays: 28, bleedingDays: 5 },
  { startDate: '2026-09-21', lengthDays: 29, bleedingDays: 5 },
  { startDate: '2026-10-20', lengthDays: 28, bleedingDays: 5 }, // ongoing
];

// 2. Riya (Irregular, 22yo): 32, 27, 36, 29, and cycle 5 is 41 days! (FIGO cycle_long > 38d, cycle_irregular > 9d diff)
const irregularCycles: CycleDef[] = [
  { startDate: '2026-05-05', lengthDays: 32, bleedingDays: 5 },
  { startDate: '2026-06-06', lengthDays: 27, bleedingDays: 5 },
  { startDate: '2026-07-03', lengthDays: 36, bleedingDays: 6 },
  { startDate: '2026-08-08', lengthDays: 29, bleedingDays: 5 },
  { startDate: '2026-09-06', lengthDays: 41, bleedingDays: 5 }, // 41 day cycle
  { startDate: '2026-10-17', lengthDays: 35, bleedingDays: 6 }, // current cycle
];

// 3. Priya (Heavy Bleeder): 7 bleeding days, 4+ heavy days (FIGO bleeding_heavy, bleeding_prolonged)
const heavyCycles: CycleDef[] = [
  { startDate: '2026-05-10', lengthDays: 28, bleedingDays: 7 },
  { startDate: '2026-06-07', lengthDays: 27, bleedingDays: 7 },
  { startDate: '2026-07-04', lengthDays: 28, bleedingDays: 7 },
  { startDate: '2026-08-01', lengthDays: 28, bleedingDays: 7 },
  { startDate: '2026-08-29', lengthDays: 27, bleedingDays: 7 },
  { startDate: '2026-09-25', lengthDays: 28, bleedingDays: 7 },
  { startDate: '2026-10-23', lengthDays: 28, bleedingDays: 6 }, // ongoing
];

const targetDir = path.join(__dirname, '..', 'src', 'shared', 'mocks');
fs.mkdirSync(targetDir, { recursive: true });

const knowledge = knowledgeData as KnowledgeBase;
const todayStr = '2026-10-24';

const personas = [
  { id: 'regular', name: 'Ananya (Regular)', cycles: regularCycles },
  { id: 'irregular', name: 'Riya (Irregular, 41d Cycle)', cycles: irregularCycles },
  { id: 'heavy', name: 'Priya (Heavy Bleeder)', cycles: heavyCycles },
] as const;

console.log('--- Generating Persona Mocks and Snapshots ---');

for (const p of personas) {
  const entries = generateEntriesForPersona({ cycles: p.cycles, persona: p.id });
  const insights = computeInsights(entries, knowledge, todayStr);

  const entriesPath = path.join(targetDir, `entries.${p.id}.json`);
  const insightsPath = path.join(targetDir, `insights.${p.id}.json`);

  fs.writeFileSync(entriesPath, JSON.stringify(entries, null, 2));
  fs.writeFileSync(insightsPath, JSON.stringify(insights, null, 2));

  console.log(`\nPersona: ${p.name}`);
  console.log(`  Entries logged: ${entries.length} days`);
  console.log(`  Cycles derived: ${insights.cycles.length} (${insights.stats?.cyclesUsed ?? 0} completed)`);
  if (insights.stats) {
    console.log(`  Avg Cycle: ${insights.stats.avgCycleLength}d (SD: ${insights.stats.cycleLengthSD}d, Range: ${insights.stats.shortest}-${insights.stats.longest}d)`);
  }
  if (insights.prediction) {
    console.log(`  Prediction: ${insights.prediction.earliest} to ${insights.prediction.latest} (Expected: ${insights.prediction.expected}, Confidence: ${insights.prediction.confidence})`);
  }
  console.log(`  Flags triggered (${insights.flags.length}): ${insights.flags.map(f => `${f.ruleId} [${f.severity}]`).join(', ') || 'None (normal)'}`);
}

console.log('\nAll mock entries and insights snapshots generated successfully!');
