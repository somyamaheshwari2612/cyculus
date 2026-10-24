import type { Brief, Insights, KnowledgeRule, LogEntry } from '../../shared/types';

const DISCLAIMER_EN =
  'This app is not a medical device and does not replace a doctor. It does not diagnose.';

export function buildBrief(
  insights: Insights,
  entries: LogEntry[],
  knowledge: KnowledgeRule[],
  language: 'en' | 'hi'
): Brief {
  const generatedAt = new Date().toISOString();

  // Case 1: not enough data yet. Say so, don't invent anything.
  if (insights.dataSufficiency === 'none' || insights.stats === null) {
    return {
      language,
      generatedAt,
      periodCovered: { from: '', to: '' },
      summary: 'Not enough data yet. Keep logging to see your cycle pattern.',
      cyclePattern: [],
      symptoms: [],
      flags: [],
      questionsForDoctor: [],
      disclaimer: DISCLAIMER_EN,
      sourcesUsed: [],
    };
  }

  const stats = insights.stats;

  // Period covered: first and last logged dates
  const dates = entries.map((e) => e.date).sort();
  const periodCovered = {
    from: dates[0] ?? '',
    to: dates[dates.length - 1] ?? '',
  };

  // Cycle pattern lines (numbers come straight from the stats)
  const cyclePattern: string[] = [
    `Cycles used: ${stats.cyclesUsed}`,
    `Average cycle length: ${stats.avgCycleLength} days`,
    `Shortest to longest: ${stats.shortest} to ${stats.longest} days`,
    `Average bleeding days: ${stats.avgBleedingDays}`,
  ];

  const completed = insights.cycles.filter((c) => c.lengthDays !== null);
  if (completed.length > 0) {
    const latest = completed[completed.length - 1];
    cyclePattern.push(`Latest completed cycle: ${latest.lengthDays} days`);
  }

  // Top 3 most frequent symptoms
  const symptoms = [...insights.patterns]
    .sort((a, b) => b.totalDays - a.totalDays)
    .slice(0, 3)
    .map((p) => `${p.symptom.replace(/_/g, ' ')}: logged on ${p.totalDays} days`);

  // Flags: look up each rule in knowledge.json. Never hardcode text here.
  const ruleFor = (ruleId: string) => knowledge.find((r) => r.id === ruleId);

  const flags = insights.flags
    .map((flag) => {
      const rule = ruleFor(flag.ruleId);
      if (!rule) return null;
      return { title: rule.title[language], detail: rule.explanation[language] };
    })
    .filter((f): f is { title: string; detail: string } => f !== null);

  // Questions for the doctor, without duplicates
  const questionsForDoctor = Array.from(
    new Set(
      insights.flags.flatMap((flag) => {
        const rule = ruleFor(flag.ruleId);
        return rule ? rule.questionsForDoctor[language] : [];
      })
    )
  );

  // Sources used, without duplicates
  const sourcesUsed = Array.from(
    new Set(
      insights.flags.flatMap((flag) => {
        const rule = ruleFor(flag.ruleId);
        return rule ? rule.sources.map((s) => s.name) : [];
      })
    )
  );

  // Summary: 2–3 plain sentences built from the numbers above
  const early =
    insights.dataSufficiency === 'minimal'
      ? ' This is based on only one or two cycles, so it is an early picture.'
      : '';
  const flagLine =
    flags.length > 0
      ? `${flags.length} point(s) are worth discussing with a doctor.`
      : 'No points were flagged for discussion in this period.';
  const summary =
    `Based on ${stats.cyclesUsed} completed cycle(s), your average cycle length is ${stats.avgCycleLength} days.` +
    early +
    ' ' +
    flagLine;

  return {
    language,
    generatedAt,
    periodCovered,
    summary,
    cyclePattern,
    symptoms,
    flags,
    questionsForDoctor,
    disclaimer: DISCLAIMER_EN,
    sourcesUsed,
  };
}