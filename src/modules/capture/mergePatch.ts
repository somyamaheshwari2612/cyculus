import { DayPatch, LogEntry, Mood, Symptom } from '@/shared/types';

/**
 * Pure merge semantics function per contract in `types.ts`:
 * - symptoms/moods = union (deduplicated)
 * - flow and painLevel = latest non-null wins
 * - notes = appended
 * - sources/rawTexts = appended
 * - updatedAt = new ISO timestamp
 */
export function mergeDayPatch(
  existing: LogEntry | undefined,
  patch: DayPatch,
  source: 'tap' | 'text' | 'voice',
  rawText?: string
): LogEntry {
  const now = new Date().toISOString();

  if (!existing) {
    return {
      date: patch.date,
      flow: patch.flow !== undefined ? patch.flow : null,
      painLevel: patch.painLevel !== undefined ? patch.painLevel : null,
      symptoms: patch.symptoms ? Array.from(new Set(patch.symptoms)) : [],
      moods: patch.moods ? Array.from(new Set(patch.moods)) : [],
      notes: patch.notes ? patch.notes.trim() : '',
      sources: [source],
      rawTexts: rawText && rawText.trim() ? [rawText.trim()] : [],
      updatedAt: now
    };
  }

  // Union of symptoms
  const symptomSet = new Set<Symptom>(existing.symptoms);
  if (patch.symptoms) {
    patch.symptoms.forEach(s => symptomSet.add(s));
  }

  // Union of moods
  const moodSet = new Set<Mood>(existing.moods);
  if (patch.moods) {
    patch.moods.forEach(m => moodSet.add(m));
  }

  // Flow: latest non-null wins
  const flow = patch.flow !== undefined && patch.flow !== null ? patch.flow : existing.flow;

  // PainLevel: latest non-null wins
  const painLevel = patch.painLevel !== undefined && patch.painLevel !== null ? patch.painLevel : existing.painLevel;

  // Notes: appended if new notes exist
  let notes = existing.notes || '';
  if (patch.notes && patch.notes.trim()) {
    notes = notes ? `${notes}\n${patch.notes.trim()}` : patch.notes.trim();
  }

  // Sources: appended
  const sources = [...existing.sources];
  if (!sources.includes(source)) {
    sources.push(source);
  }

  // RawTexts: appended
  const rawTexts = [...existing.rawTexts];
  if (rawText && rawText.trim() && !rawTexts.includes(rawText.trim())) {
    rawTexts.push(rawText.trim());
  }

  // Sleep hours
  const sleepHours = patch.sleepHours !== undefined ? patch.sleepHours : existing.sleepHours ?? null;

  // Symptom severities
  const symptomSeverities = {
    ...(existing.symptomSeverities || {}),
    ...(patch.symptomSeverities || {})
  };

  return {
    date: existing.date,
    flow,
    painLevel,
    symptoms: Array.from(symptomSet),
    symptomSeverities,
    sleepHours,
    moods: Array.from(moodSet),
    notes,
    sources,
    rawTexts,
    updatedAt: now
  };
}
