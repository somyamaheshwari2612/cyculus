import { ArrowRight, FileText, Plus, AlertCircle } from "lucide-react";
import { format, parseISO, subDays, fmt } from "@/shared/dateUtils";
import { LogEntry, UserSetup, Insights } from "@/shared/types";
import { CycleRing } from "../cyculus/CycleRing";
import { EntryRow, DisplayEntry } from "../cyculus/EntryCard";
import { EmptyState, Panel, flowTone } from "../cyculus/ui";
import sprig from "@/assets/sprig.png";

export function OverviewView({
  logs,
  userSetup,
  insights,
  currentCycleDay,
  onNavigateTab,
  onSelectDateToLog,
  onOpenCycleSetup,
  language = "en",
}: {
  logs: LogEntry[];
  userSetup: UserSetup | null;
  insights: Insights;
  currentCycleDay: number | null;
  onNavigateTab: (tab: any) => void;
  onSelectDateToLog: (date: string) => void;
  onOpenCycleSetup?: () => void;
  language?: "en" | "hi";
}) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (language === "hi") {
      return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    }
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  };

  const cycles = insights.cycles || [];
  const lengths = cycles.filter((c) => c.lengthDays != null).map((c) => c.lengthDays!);
  const avgLen =
    lengths.length > 0
      ? lengths.reduce((a, b) => a + b, 0) / lengths.length
      : userSetup?.typicalCycleLength ?? null;

  // Last completed / active cycle start
  const lastCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null;
  const lastStart = lastCycle?.startDate || userSetup?.lastPeriodStart;

  // Next estimate from our calculus engine
  const nextEstimate = insights.prediction;

  // 14-day strip (today and past 13 days)
  const byDate = new Map(logs.map((e) => [e.date, e]));
  const strip = Array.from({ length: 14 }, (_, i) => fmt(subDays(new Date(), 13 - i)));

  // Symptoms in the last 30 days
  const cutoff30 = fmt(subDays(new Date(), 30));
  const last30Logs = logs.filter((l) => l.date >= cutoff30);
  const symptomCounts: Record<string, number> = {};
  last30Logs.forEach((l) => {
    (l.symptoms || []).forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Map to DisplayEntry for EntryRow
  const displayLogs: DisplayEntry[] = logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((l) => ({
      id: l.date,
      date: l.date,
      flow: l.flow,
      symptoms: (l.symptomSeverities as any) || (l.symptoms || []).reduce((acc: any, s: string) => {
        acc[s] = 1;
        return acc;
      }, {}),
      sleepHours: l.sleepHours ?? null,
      notes: l.notes || "",
    }));

  // Important clinical flags (if any detected by ACOG engine)
  const hasUrgentFlag = (insights.flags || []).some((f) => f.severity === "urgent" || f.severity === "soon");

  return (
    <>
      <header className="relative mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-foreground md:text-5xl">
            {getGreeting()},{" "}
            <em className="text-primary font-normal">
              {userSetup?.name || (language === "hi" ? "Friend" : "Friend")}
            </em>
          </h1>
          <p className="mt-1 text-muted-foreground">
            {language === "hi" ? "Aaj kaisa lag raha hai?" : "How are you feeling today?"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenCycleSetup && (
            <button
              onClick={onOpenCycleSetup}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/30 bg-card px-5 py-3 text-sm font-medium text-primary shadow-sm transition hover:bg-lavender hover:border-primary"
            >
              <span>⚙️</span> {language === "hi" ? "Cycle length setup" : "Cycle length setup"}
            </button>
          )}
          <button
            onClick={() => {
              onSelectDateToLog(fmt(new Date()));
              onNavigateTab("log");
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lift transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> {language === "hi" ? "Aaj ka din log karein" : "Log today"}
          </button>
        </div>
      </header>

      {/* Reassuring Clinical Notice if red flags detected */}
      {hasUrgentFlag && (
        <div className="mb-6 flex items-start gap-3.5 rounded-2xl border border-rose-deep/30 bg-rose-soft/90 p-4 text-foreground shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-deep" />
          <div className="text-sm">
            <span className="font-semibold text-rose-deep">
              {language === "hi" ? "Doctor visit note:" : "A note for your next visit:"}
            </span>{" "}
            {language === "hi"
              ? "Aapke records mein kuch aise patterns (jaise heavy bleeding ya cycle variation) dikhe hain jinhe doctor ke saath discuss karna helpful rahega."
              : "Your records show patterns (such as prolonged bleeding or significant variation) that are worth discussing with your clinician."}
            <button
              onClick={() => onNavigateTab("summary")}
              className="ml-2 font-medium text-primary underline hover:opacity-80 cursor-pointer"
            >
              {language === "hi" ? "Summary dekhein →" : "View summary →"}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Cycle Ring Panel */}
          <Panel className="relative overflow-hidden">
            <img
              src={sprig}
              alt=""
              aria-hidden
              width={768}
              height={1024}
              loading="lazy"
              className="pointer-events-none absolute -top-6 right-0 h-44 w-auto opacity-50"
            />
            <div className="relative flex flex-wrap items-center gap-8">
              <CycleRing
                day={currentCycleDay}
                length={avgLen ? Math.round(avgLen) : null}
              />
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <p className="eyebrow">
                    {language === "hi" ? "Last period start hua" : "Last period started"}
                  </p>
                  <p className="font-display text-2xl text-foreground">
                    {lastStart ? format(parseISO(lastStart), "d MMMM") : (language === "hi" ? "Abhi record nahi hua" : "Not recorded yet")}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">
                    {language === "hi" ? "Next period · Estimate" : "Next period · estimate"}
                  </p>
                  {nextEstimate ? (
                    <div className="font-display text-2xl text-foreground">
                      around {format(parseISO(nextEstimate.expected), "d MMMM")}
                      <span className="block font-sans text-xs text-muted-foreground mt-0.5">
                        {language === "hi"
                          ? `Aapki pichhli ${nextEstimate.basedOnCycles} cycles par based. Expected window: ${nextEstimate.earliest} se ${nextEstimate.latest}`
                          : `Based on your last ${nextEstimate.basedOnCycles} recorded cycles. Not a confirmed date.`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {language === "hi"
                        ? "Kam se kam do complete cycles record honi chahiye."
                        : "Needs at least two complete recorded cycles."}
                    </p>
                  )}
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {avgLen
                      ? language === "hi"
                        ? `Typical cycle: ${Math.round(avgLen)} din`
                        : `Typical cycle: ${Math.round(avgLen)} days`
                      : language === "hi"
                      ? "Typical cycle length: Abhi set nahi hai"
                      : "Typical cycle length: Not set"}
                  </span>
                  {onOpenCycleSetup && (
                    <button
                      type="button"
                      onClick={onOpenCycleSetup}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <span>·</span>
                      <span>{language === "hi" ? "Calibrate" : "Calibrate"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          {/* 14-Day Interactive Strip */}
          <Panel
            title={language === "hi" ? "Pichhle do hafte" : "Last two weeks"}
            action={
              <button
                onClick={() => onNavigateTab("cycle")}
                className="text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                {language === "hi" ? "Calendar" : "Calendar"}
              </button>
            }
          >
            <div className="grid grid-cols-7 gap-2 sm:grid-cols-14">
              {strip.map((d) => {
                const e = byDate.get(d);
                const bleed = e?.flow && e.flow !== "none";
                const syms = e ? (e.symptoms || []).length : 0;
                const isToday = d === fmt(new Date());

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      onSelectDateToLog(d);
                      onNavigateTab("log");
                    }}
                    className={`flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-xl border text-xs transition hover:border-primary ${
                      bleed
                        ? `${flowTone[e!.flow!] || "bg-rose"} border-transparent`
                        : e
                        ? "border-transparent bg-secondary"
                        : "border-dashed border-border"
                    } ${isToday ? "ring-2 ring-primary/50" : ""}`}
                  >
                    <span className="opacity-70 text-[10px]">
                      {format(parseISO(d), "EEEEE")}
                    </span>
                    <span className="font-display text-lg leading-none mt-0.5">
                      {format(parseISO(d), "d")}
                    </span>
                    <span className="mt-1 flex gap-0.5">
                      {Array.from({ length: Math.min(syms, 3) }).map((_, i) => (
                        <i key={i} className="h-1 w-1 rounded-full bg-primary" />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Recent Entries */}
          <Panel
            title={language === "hi" ? "Recent entries" : "Recent entries"}
            action={
              logs.length > 0 && (
                <button
                  onClick={() => onNavigateTab("cycle")}
                  className="text-sm font-medium text-primary hover:underline cursor-pointer"
                >
                  {language === "hi" ? "Sabhi entries" : "All entries"}
                </button>
              )
            }
          >
            {logs.length === 0 ? (
              <EmptyState
                title={language === "hi" ? "Aapki diary open hai" : "Your journal is open"}
                action={
                  <button
                    onClick={() => {
                      onSelectDateToLog(fmt(new Date()));
                      onNavigateTab("log");
                    }}
                    className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {language === "hi" ? "Pehli entry likhein →" : "Write your first entry →"}
                  </button>
                }
              >
                {language === "hi"
                  ? "Har entry — chahe ek normal quiet day hi kyu na ho — time ke saath aapki body ka natural pattern reveal karti hai."
                  : "Each entry — even a quiet day — helps reveal your own rhythm over time."}
              </EmptyState>
            ) : (
              <div className="-mx-3 divide-y divide-border/70">
                {displayLogs.map((e) => (
                  <EntryRow
                    key={e.date}
                    entry={e}
                    onSelect={(d) => {
                      onSelectDateToLog(d);
                      onNavigateTab("log");
                    }}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* This Month Symptoms */}
          <Panel title={language === "hi" ? "Is month ke symptoms" : "This month"}>
            {sortedSymptoms.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {language === "hi"
                  ? "Pichhle 30 dino mein koi symptom log nahi hua."
                  : "No symptoms logged in the last 30 days."}
              </p>
            ) : (
              <ul className="space-y-3">
                {sortedSymptoms.map(([key, count]) => (
                  <li key={key}>
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="text-muted-foreground">
                        {count} {count === 1 ? (language === "hi" ? "din" : "day") : (language === "hi" ? "din" : "days")}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-lavender overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{
                          width: `${(count / (sortedSymptoms[0][1] || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Cycle Rhythm Summary */}
          <Panel title={language === "hi" ? "Cycle rhythm" : "Cycle rhythm"}>
            {lengths.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="eyebrow">{language === "hi" ? "Average length" : "Avg length"}</p>
                  <p className="font-display text-3xl">
                    {avgLen!.toFixed(0)}
                    <span className="text-base"> {language === "hi" ? "din" : "d"}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="eyebrow">{language === "hi" ? "Range" : "Range"}</p>
                  <p className="font-display text-3xl">
                    {Math.min(...lengths)}–{Math.max(...lengths)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {language === "hi"
                  ? "Do period starts log hone ke baad cycle length calculate hogi."
                  : "Cycle length appears once two period starts are recorded."}
              </p>
            )}
            <button
              onClick={() => onNavigateTab("insights")}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline cursor-pointer"
            >
              {language === "hi" ? "Insights dekhein" : "See insights"}{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Panel>

          {/* Appointment Prep Card */}
          <button
            onClick={() => onNavigateTab("summary")}
            className="group card-soft flex items-center gap-4 bg-lavender p-5 text-left transition hover:shadow-lift cursor-pointer border border-border/70"
          >
            <span className="rounded-full bg-card p-3 text-primary shadow-sm">
              <FileText className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl text-foreground">
                {language === "hi" ? "Doctor se milna hai?" : "Seeing a doctor soon?"}
              </span>
              <span className="text-sm text-muted-foreground">
                {language === "hi"
                  ? "Doctor ke liye clean Summary ready karein."
                  : "Prepare a clear summary of your records."}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </>
  );
}
