import type { Brief, Insights, KnowledgeRule, LogEntry, Symptom } from '../../shared/types';
import { BRIEF_TEXT, SYMPTOM_LABELS } from '../../shared/translations';

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
    .map((p) => {
      const sym = p.symptom as Symptom;
      const label = SYMPTOM_LABELS[sym]?.[language] || p.symptom.replace(/_/g, ' ');
      const daysText = language === 'hi' ? 'दिन' : 'days';
      return `${label}: ${p.totalDays} ${daysText}`;
    });

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

  // Summary: natural full sentence templates (never piecemeal concatenation)
  const cycleSentence =
    language === 'hi'
      ? `पिछले ${stats.cyclesUsed} पूरे पीरियड्स के हिसाब से, आपका औसत गैप ${stats.avgCycleLength} दिन रहा है।`
      : `Based on ${stats.cyclesUsed} completed cycle(s), your average cycle length is ${stats.avgCycleLength} days.`;

  const early = insights.dataSufficiency === 'minimal' ? ' ' + t.earlyPicture : '';
  const flagLine =
    flags.length > 0
      ? language === 'hi'
        ? `${flags.length} बातें ऐसी हैं जिन पर डॉक्टर से बात कर लेना अच्छा रहेगा।`
        : `${flags.length} ${t.flagsFound}`
      : t.noFlags;

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