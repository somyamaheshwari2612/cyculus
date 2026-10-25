import { useState, useEffect, type ReactNode } from "react";
import { Plus, Printer, X, Sparkles } from "lucide-react";
import { format, parseISO, subMonths, fmt, today } from "@/shared/dateUtils";
import { LogEntry, UserSetup, Insights, DoctorQuestion } from "@/shared/types";
import { PageHeader, Panel } from "../cyculus/ui";
import { CycleMark } from "../cyculus/Logo";
import { polishBriefText } from "@/modules/brief/geminiPolish";

const RANGES = [
  { m: 3, l: "3 months" },
  { m: 6, l: "6 months" },
  { m: 12, l: "12 months" },
];

const FLOW_LABELS: Record<string, string> = {
  spotting: "Spotting",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

const SYMPTOM_LABELS: Record<string, string> = {
  cramps: "Cramps",
  bloating: "Bloating",
  fatigue: "Fatigue",
  headache: "Headache",
  mood: "Mood changes",
  mood_swings: "Mood changes",
  tenderness: "Breast tenderness",
  breast_tenderness: "Breast tenderness",
  acne: "Acne",
  backache: "Lower back pain",
  lower_back_pain: "Lower back pain",
  pelvic_pain: "Pelvic pain",
  nausea: "Nausea",
  sleep_trouble: "Sleep trouble",
  cravings: "Cravings",
};

const SEVERITY_LABEL: Record<number, string> = { 1: "Mild", 2: "Moderate", 3: "Severe" };

export function SummaryView({
  logs,
  userSetup,
  insights,
  savedQuestions,
  onSaveQuestions,
  language = "en",
}: {
  logs: LogEntry[];
  userSetup: UserSetup | null;
  insights: Insights;
  savedQuestions: DoctorQuestion[];
  onSaveQuestions: (qs: DoctorQuestion[]) => Promise<DoctorQuestion[]>;
  language?: "en" | "hi";
}) {
  const [months, setMonths] = useState(3);
  const [draft, setDraft] = useState("");
  const [questions, setQuestions] = useState<DoctorQuestion[]>(savedQuestions || []);

  // Gemini Clinical Polish state
  const [isPolishing, setIsPolishing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (savedQuestions) setQuestions(savedQuestions);
  }, [savedQuestions]);

  const from = fmt(subMonths(new Date(), months));
  const inRange = logs.filter((e) => e.date >= from);
  const cycles = (insights.cycles || []).filter((c) => c.startDate >= from);

  // Symptoms in range
  const symMap: Record<string, { count: number; totalSev: number }> = {};
  inRange.forEach((l) => {
    (l.symptoms || []).forEach((s) => {
      const sev = l.symptomSeverities?.[s] || 1;
      if (!symMap[s]) symMap[s] = { count: 0, totalSev: 0 };
      symMap[s].count += 1;
      symMap[s].totalSev += sev;
    });
  });

  const freq = Object.entries(symMap)
    .map(([key, data]) => ({
      key,
      label: SYMPTOM_LABELS[key] || key.replace(/_/g, " "),
      count: data.count,
      avgSeverity: Math.round(data.totalSev / (data.count || 1)),
    }))
    .sort((a, b) => b.count - a.count);

  // Flow distribution
  const flowCounts = ["heavy", "medium", "light", "spotting"]
    .map((f) => ({
      key: f,
      label: FLOW_LABELS[f] || f,
      n: inRange.filter((e) => e.flow === f).length,
    }))
    .filter((f) => f.n > 0);

  const notesList = inRange.filter((e) => e.notes && e.notes.trim()).slice(0, 8);
  const lengths = cycles.filter((c) => c.lengthDays != null).map((c) => c.lengthDays!);
  const avgLen = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : null;

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const newQ: DoctorQuestion = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      text: draft.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [...questions, newQ];
    setQuestions(next);
    setDraft("");
    await onSaveQuestions(next);
  };

  const handleRemoveQuestion = async (id: string) => {
    const next = questions.filter((q) => q.id !== id);
    setQuestions(next);
    await onSaveQuestions(next);
  };

  // Generate AI Executive Clinical Brief with Gemini & strict numeric verification
  const handleGenerateAiBrief = async () => {
    setIsPolishing(true);
    setAiError(null);
    try {
      const draftText = `Patient ${userSetup?.name || "Patient"} self-reported menstrual summary covering ${months} months. Cycles recorded: ${cycles.length}. Average cycle length: ${avgLen ? avgLen.toFixed(1) : "variable"} days. Most frequent symptoms: ${freq.map((f) => `${f.label} (${f.count} days)`).join(", ")}.`;
      const result = await polishBriefText(draftText, language);
      setAiSummary(result.polished);
    } catch (err: any) {
      setAiError(err?.message || "Could not generate AI clinical brief at this time.");
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <>
      <div className="no-print">
        <PageHeader
          eyebrow={language === "hi" ? "Doctor visit ki tayari" : "Appointment prep"}
          title="Summary for Doctor"
          subtitle={
            language === "hi"
              ? "Apne records check karein, doctor se poochne wale sawal add karein, fir Print ya PDF save karein."
              : "Review what's included, add your questions, then print or save as PDF."
          }
          action={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGenerateAiBrief}
                disabled={isPolishing || inRange.length === 0}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary bg-card px-5 py-2.5 text-sm font-medium text-primary hover:bg-lavender shadow-sm disabled:opacity-50 transition"
              >
                <Sparkles className="h-4 w-4" />{" "}
                {isPolishing
                  ? language === "hi"
                    ? "Generate ho raha hai…"
                    : "Polishing…"
                  : language === "hi"
                  ? "AI Clinical Summary"
                  : "AI Clinical Summary"}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-lift hover:brightness-110 transition text-sm"
              >
                <Printer className="h-4 w-4" />{" "}
                {language === "hi" ? "Print / Save PDF" : "Print / Save PDF"}
              </button>
            </div>
          }
        />

        {/* Reporting Period Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">
            {language === "hi" ? "Reporting Period" : "Reporting period"}
          </span>
          {RANGES.map((r) => (
            <button
              key={r.m}
              onClick={() => setMonths(r.m)}
              className={`rounded-full px-4 py-1.5 text-sm cursor-pointer transition ${
                months === r.m
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {language === "hi" ? `${r.m} Months` : r.l}
            </button>
          ))}
        </div>

        {/* AI Brief Notice if generated */}
        {aiSummary && (
          <div className="mb-6 card-soft p-5 bg-lavender/50 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />{" "}
                {language === "hi" ? "AI Clinical Summary (Verified)" : "AI Clinical Overview (Numerically Verified)"}
              </span>
              <button
                onClick={() => setAiSummary(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
            <p className="text-sm text-foreground leading-relaxed font-sans">{aiSummary}</p>
          </div>
        )}

        {aiError && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-rose-soft p-3 text-xs text-foreground">
            {aiError}
          </div>
        )}

        {/* Questions for Clinician Panel */}
        <Panel
          title={language === "hi" ? "Doctor se poochne wale sawal" : "Questions for my clinician"}
          className="mb-8"
        >
          <form className="flex gap-2" onSubmit={handleAddQuestion}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={300}
              placeholder={
                language === "hi"
                  ? "e.g. Kya itna cramps hona normal hai?"
                  : "e.g. Is this level of cramping typical?"
              }
              className="flex-1 rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary text-foreground font-sans"
            />
            <button
              type="submit"
              className="rounded-xl bg-secondary px-4 text-secondary-foreground hover:bg-muted cursor-pointer transition flex items-center justify-center"
              aria-label="Add question"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>

          {questions.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm bg-card/60 hover:bg-muted/60 transition"
                >
                  <span className="text-foreground">{q.text}</span>
                  <button
                    aria-label="Remove question"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="text-muted-foreground hover:text-destructive cursor-pointer p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Clinical Printable Document (Chitthi) */}
      <article className="print-area mx-auto max-w-3xl rounded-xl border border-border bg-card p-8 font-sans text-sm shadow-soft md:p-12 text-foreground">
        <header className="flex items-start justify-between border-b-2 border-foreground pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
              {language === "hi"
                ? "Period Health Record — Summary for Doctor"
                : "Menstrual health record — patient summary"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Prepared by {userSetup?.name || "Patient"} · {format(parseISO(from), "d MMM yyyy")} –{" "}
              {format(new Date(), "d MMM yyyy")}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-primary">
            <CycleMark className="h-6 w-6" />
            <span className="text-sm font-semibold tracking-wide">Cyculus</span>
          </span>
        </header>

        <p className="mt-3 text-xs text-muted-foreground">
          {language === "hi"
            ? `Self-reported records. Yeh koi diagnosis nahi hai. Generated ${format(new Date(), "d MMM yyyy")}.`
            : `Self-reported records. No diagnoses or clinical conclusions are made by this summary. Generated ${format(new Date(), "d MMM yyyy")}.`}
        </p>

        {/* AI Brief paragraph in printout if generated */}
        {aiSummary && (
          <Section title={language === "hi" ? "Clinical Summary (AI)" : "Clinical Summary"}>
            <p className="text-xs leading-relaxed text-foreground bg-muted/40 p-3 rounded-lg border border-border/60">
              {aiSummary}
            </p>
          </Section>
        )}

        <Section title="Overview">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
            <Item
              k={language === "hi" ? "Days recorded" : "Days recorded"}
              v={inRange.length}
            />
            <Item
              k={language === "hi" ? "Period starts" : "Period starts"}
              v={cycles.length}
            />
            <Item
              k={language === "hi" ? "Avg cycle length" : "Avg cycle length"}
              v={avgLen ? `${avgLen.toFixed(1)} d` : "—"}
            />
            <Item
              k={language === "hi" ? "Cycle range" : "Cycle range"}
              v={lengths.length > 0 ? `${Math.min(...lengths)}–${Math.max(...lengths)} d` : "—"}
            />
          </dl>
        </Section>

        <Section title={language === "hi" ? "Cycle History" : "Cycles"}>
          {cycles.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Period start</th>
                  <th>Bleeding days</th>
                  <th>Cycle length</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((c) => (
                  <tr key={c.startDate} className="border-b border-border/60">
                    <td className="py-2">{format(parseISO(c.startDate), "d MMM yyyy")}</td>
                    <td>{c.bleedingDays} days</td>
                    <td>{c.lengthDays ? `${c.lengthDays} days` : "ongoing"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <None text={language === "hi" ? "Is duration mein koi cycle record nahi hai." : "None recorded in this period."} />
          )}
        </Section>

        <Section title={language === "hi" ? "Symptoms History" : "Symptoms"}>
          {freq.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Symptom</th>
                  <th>Days logged</th>
                  <th>Typical severity</th>
                </tr>
              </thead>
              <tbody>
                {freq.map((f) => (
                  <tr key={f.key} className="border-b border-border/60">
                    <td className="py-2">{f.label}</td>
                    <td>{f.count}</td>
                    <td>{SEVERITY_LABEL[f.avgSeverity]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <None text={language === "hi" ? "Koi symptom record nahi hua." : "None recorded in this period."} />
          )}
        </Section>

        <Section title={language === "hi" ? "Flow Observations" : "Flow observations"}>
          {flowCounts.length > 0 ? (
            <p className="text-xs">
              {flowCounts.map((f) => `${f.label}: ${f.n} day${f.n > 1 ? "s" : ""}`).join(" · ")}
            </p>
          ) : (
            <None text={language === "hi" ? "Koi flow record nahi hua." : "None recorded in this period."} />
          )}
        </Section>

        <Section title={language === "hi" ? "Patient Notes" : "Patient notes"}>
          {notesList.length > 0 ? (
            <ul className="space-y-1.5 text-xs">
              {notesList.map((e) => (
                <li key={e.date}>
                  <span className="font-semibold text-foreground">
                    {format(parseISO(e.date), "d MMM")}:
                  </span>{" "}
                  {e.notes}
                </li>
              ))}
            </ul>
          ) : (
            <None text={language === "hi" ? "Koi notes nahi hain." : "None recorded in this period."} />
          )}
        </Section>

        <Section title={language === "hi" ? "Questions for Doctor" : "Questions for the clinician"}>
          {questions.length > 0 ? (
            <ol className="list-decimal space-y-1 pl-5 text-xs">
              {questions.map((q) => (
                <li key={q.id}>{q.text}</li>
              ))}
            </ol>
          ) : (
            <None text={language === "hi" ? "Koi question add nahi kiya gaya." : "No questions added."} />
          )}
        </Section>

        <p className="mt-8 text-right text-[11px] text-muted-foreground">
          Records current through {today()}
        </p>
      </article>
    </>
  );
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-6">
    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{title}</h3>
    {children}
  </section>
);

const Item = ({ k, v }: { k: string; v: ReactNode }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{k}</dt>
    <dd className="text-sm font-semibold text-foreground mt-0.5">{v}</dd>
  </div>
);

const None = ({ text }: { text: string }) => (
  <p className="text-xs text-muted-foreground">{text}</p>
);
