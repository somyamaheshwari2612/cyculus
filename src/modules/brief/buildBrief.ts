import type { Brief, Insights, KnowledgeRule, LogEntry } from '../../shared/types';
import { BRIEF_TEXT } from '../../shared/translations';

export function buildBrief(
  insights: Insights,
  entries: LogEntry[],
  knowledge: KnowledgeRule[],
  language: 'en' | 'hi'
): Brief {
  // Pick the right phrase set for this language
  const t = BRIEF_TEXT[language];
  const generatedAt = new Date().toISOString();

  // Not enough data yet: say so, don't invent anything
  if (insights.dataSufficiency === 'none' || insights.stats === null) {
    return {
      language,
      generatedAt,
      periodCovered: { from: '', to: '' },
      summary: t.notEnoughData,
      cyclePattern: [],
      symptoms: [],
      flags: [],
      questionsForDoctor: [],
      disclaimer: t.disclaimer,
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
    `${t.cycleCount}: ${stats.cyclesUsed}`,
    `${t.avgLength}: ${stats.avgCycleLength} ${t.days}`,
    `${t.range}: ${stats.shortest} – ${stats.longest} ${t.days}`,
    `${t.avgBleeding}: ${stats.avgBleedingDays}`,
  ];

  const completed = insights.cycles.filter((c) => c.lengthDays !== null);
  if (completed.length > 0) {
    const latest = completed[completed.length - 1];
    cyclePattern.push(`${t.latestCycle}: ${latest.lengthDays} ${t.days}`);
  }

  // Top 3 most frequent symptoms
  const symptoms = [...insights.patterns]
    .sort((a, b) => b.totalDays - a.totalDays)
    .slice(0, 3)
    .map((p) => `${p.symptom.replace(/_/g, ' ')}: ${p.totalDays}`);

  // Flags: text comes from knowledge.json, in the chosen language
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

  // Summary: a few plain sentences built from the numbers above.
  // Word order differs between English and Hindi, so each has its own sentence.
  const cycleSentence =
    language === 'hi'
      ? `${stats.cyclesUsed} ${t.completedCycles} ${stats.avgCycleLength} ${t.days}।`
      : `${t.summaryStart} ${stats.cyclesUsed} ${t.completedCycles} ${stats.avgCycleLength} ${t.days}.`;

  const early = insights.dataSufficiency === 'minimal' ? ' ' + t.earlyPicture : '';
  const flagLine = flags.length > 0 ? `${flags.length} ${t.flagsFound}` : t.noFlags;

  const summary = cycleSentence + early + ' ' + flagLine;

  return {
    language,
    generatedAt,
    periodCovered,
    summary,
    cyclePattern,
    symptoms,
    flags,
    questionsForDoctor,
    disclaimer: t.disclaimer,
    sourcesUsed,
  };
}