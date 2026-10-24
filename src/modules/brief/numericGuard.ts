import type { Brief } from '../../shared/types';

const DEVANAGARI_DIGITS = '०१२३४५६७८९';

// Hindi text may use Devanagari digits (२९), so convert them to normal digits (29)
export function normalizeDigits(text: string): string {
  return text.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));
}

// Find every number in a text, e.g. "29", "3.5", "2026"
export function extractNumbers(text: string): string[] {
  return normalizeDigits(text).match(/\d+(?:\.\d+)?/g) ?? [];
}

// True only if every number in the polished text also appears in the facts text
export function passesNumericGuard(polished: string, facts: string): boolean {
  const allowed = new Set(extractNumbers(facts));
  return extractNumbers(polished).every((n) => allowed.has(n));
}

// Collect all the text in a brief, except the generation timestamp
// (the timestamp has digits that aren't real facts, so it's left out)
export function briefToText(brief: Brief): string {
  return [
    brief.summary,
    ...brief.cyclePattern,
    ...brief.symptoms,
    ...brief.flags.map((f) => `${f.title} ${f.detail}`),
    ...brief.questionsForDoctor,
    brief.periodCovered.from,
    brief.periodCovered.to,
  ].join(' ');
}