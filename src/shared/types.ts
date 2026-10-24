export const FLOW_LEVELS = ['none', 'spotting', 'light', 'medium', 'heavy'] as const;
export type FlowLevel = typeof FLOW_LEVELS[number];

export const SYMPTOMS = [
  'cramps', 'lower_back_pain', 'pelvic_pain', 'headache', 'nausea', 'bloating',
  'breast_tenderness', 'fatigue', 'acne', 'dizziness', 'blood_clots',
  'discharge_change', 'sleep_trouble', 'cravings', 'diarrhea', 'constipation', 'leg_pain'
] as const;
export type Symptom = typeof SYMPTOMS[number];

export const MOODS = ['calm', 'happy', 'anxious', 'irritable', 'low', 'mood_swings'] as const;
export type Mood = typeof MOODS[number];

/** One entry per local calendar day. `date` is the primary key. */
export interface LogEntry {
  date: string;                 // 'YYYY-MM-DD' (user's local date)
  flow: FlowLevel | null;       // null = not recorded
  painLevel: number | null;     // 0-10, null = not recorded
  symptoms: Symptom[];
  moods: Mood[];
  notes: string;                // '' if none
  sources: ('tap' | 'text' | 'voice')[];
  rawTexts: string[];           // original user text(s) that fed this entry
  updatedAt: string;            // ISO timestamp
}

/** Merge semantics when a new patch hits an existing day:
 *  symptoms/moods = union; flow and painLevel = latest non-null wins;
 *  notes appended; sources/rawTexts appended. */
export type DayPatch = Partial<Omit<LogEntry, 'sources' | 'rawTexts' | 'updatedAt'>> & { date: string };

export type Severity = 'info' | 'discuss' | 'soon' | 'urgent';

export interface CycleSummary {
  startDate: string;            // first day of bleeding episode
  endDate: string | null;       // null for the current, unfinished cycle
  lengthDays: number | null;    // null if unfinished
  bleedingDays: number;
  heavyDays: number;
  maxPain: number | null;
}

export interface Flag {
  ruleId: string;               // must exist in knowledge.json
  severity: Severity;           // insight flags go up to 'soon'; 'urgent' comes only from capture-time red flags
  evidence: Record<string, number | string>;  // e.g. { cyclesAbove35: 3, of: 5 }
}

export type CycleBand = 'period' | 'early' | 'mid' | 'late';  // approximate bands, NOT ovulation claims

export interface SymptomPattern {
  symptom: Symptom;
  totalDays: number;
  byBand: Record<CycleBand, number>;
}

export interface Prediction {
  expected: string;             // 'YYYY-MM-DD'
  earliest: string;
  latest: string;
  confidence: 'low' | 'medium' | 'high';
  basedOnCycles: number;
}

export interface Insights {
  generatedAt: string;
  dataSufficiency: 'none' | 'minimal' | 'ok';   // none: <1 completed cycle; minimal: 1-2; ok: >=3
  cycles: CycleSummary[];
  stats: {
    cyclesUsed: number;
    avgCycleLength: number;
    cycleLengthSD: number;
    shortest: number;
    longest: number;
    avgBleedingDays: number;
  } | null;
  prediction: Prediction | null;
  patterns: SymptomPattern[];
  flags: Flag[];
}

export interface KnowledgeRule {
  id: string;
  severity: Severity;
  params: Record<string, number>;               // thresholds live here, never hardcoded in the engine
  title: { en: string; hi: string };
  explanation: { en: string; hi: string };      // plain language, no diagnosis
  discussWithDoctor: { en: string; hi: string };
  questionsForDoctor: { en: string[]; hi: string[] };
  sources: { name: string; url: string; note?: string }[];
  status: 'draft' | 'verified';                 // only 'verified' rules may ship in the final demo
}

export interface AlgorithmConfig {
  minBleedingGapDays: number;     // max gap between bleeding days to be considered the same episode (default: 2)
  minCycleLengthDays: number;     // minimum days between cycle starts (default: 15)
  bleedingFlowLevels: FlowLevel[]; // ['light', 'medium', 'heavy']
  predictionWindowBaselineCycles: number; // default: 3
  coverageFactorSD: number;       // default: 1.28 for ~80% coverage under normal approx
}

export interface KnowledgeBase {
  rules: KnowledgeRule[];
  algorithm: AlgorithmConfig;
}

export interface Brief {
  language: 'en' | 'hi';
  generatedAt: string;
  periodCovered: { from: string; to: string };
  summary: string;
  cyclePattern: string[];
  symptoms: string[];
  flags: { title: string; detail: string }[];
  questionsForDoctor: string[];
  disclaimer: string;
  sourcesUsed: string[];
}

/** Storage API (implemented by Module A with Dexie; others code against this interface, with an in-memory fake until it lands) */
export interface LogStore {
  getAll(): Promise<LogEntry[]>;
  getRange(from: string, to: string): Promise<LogEntry[]>;
  upsertPatch(patch: DayPatch, source: 'tap' | 'text' | 'voice', rawText?: string): Promise<LogEntry>;
  exportAll(): Promise<string>;       // JSON string
  deleteAll(): Promise<void>;
}
