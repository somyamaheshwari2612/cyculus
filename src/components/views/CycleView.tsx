import { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  fmt,
  today,
} from "@/shared/dateUtils";
import { LogEntry, Insights } from "@/shared/types";
import { EmptyState, PageHeader, Panel, flowTone } from "../cyculus/ui";
import { EntryRow, DisplayEntry } from "../cyculus/EntryCard";

const FLOW_LABELS: Record<string, string> = {
  none: "No flow",
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

const SEVERITY_NAMES: Record<number, string> = {
  1: "Mild",
  2: "Moderate",
  3: "Severe",
};

export function CycleView({
  logs,
  insights,
  onSelectDateToLog,
  onNavigateTab,
  language = "en",
}: {
  logs: LogEntry[];
  insights: Insights;
  onSelectDateToLog: (date: string) => void;
  onNavigateTab: (tab: any) => void;
  language?: "en" | "hi";
}) {
  const [view, setView] = useState<"calendar" | "timeline">("calendar");
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selected, setSelected] = useState<string>(today());

  const byDate = new Map(logs.map((e) => [e.date, e]));
  const cycles = insights.cycles || [];

  // Estimated next period dates (4-day window from prediction)
  const next = insights.prediction;
  const estDays = next
    ? new Set([0, 1, 2, 3].map((i) => fmt(addDays(parseISO(next.expected), i))))
    : new Set<string>();

  // Days in month grid (starting on Monday)
  const days = eachDayOfInterval({
    start: startOfWeek(month, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  const sel = byDate.get(selected);

  // Helper to compute cycle day for any date
  const getCycleDayForDate = (dateStr: string): number | null => {
    const c = [...cycles].reverse().find((item) => item.startDate <= dateStr);
    if (!c) return null;
    const diff = Math.round(
      (new Date(dateStr).getTime() - new Date(c.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    return c.lengthDays && diff > c.lengthDays ? null : diff > 0 ? diff : null;
  };

  const selCycleDay = getCycleDayForDate(selected);

  // Display logs for timeline
  const displayLogs: DisplayEntry[] = logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
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

  const tabCls = (on: boolean) =>
    `rounded-full px-5 py-2 text-sm transition cursor-pointer ${
      on
        ? "bg-primary text-primary-foreground font-medium shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <>
      <PageHeader
        eyebrow={language === "hi" ? "History" : "History"}
        title={language === "hi" ? "Aapki Cycle" : "Your cycle"}
        action={
          <div className="flex rounded-full bg-secondary p-1 border border-border/40">
            <button
              onClick={() => setView("calendar")}
              className={tabCls(view === "calendar")}
            >
              {language === "hi" ? "Calendar" : "Calendar"}
            </button>
            <button
              onClick={() => setView("timeline")}
              className={tabCls(view === "timeline")}
            >
              {language === "hi" ? "Timeline" : "Timeline"}
            </button>
          </div>
        }
      />

      {view === "timeline" ? (
        <Panel>
          {logs.length === 0 ? (
            <EmptyState
              title={language === "hi" ? "Abhi kuch record nahi hua" : "Nothing recorded yet"}
            >
              {language === "hi"
                ? "Aapki entries yahan chronological order mein timeline par dikhengi."
                : "Your entries will appear here as a chronological journal."}
            </EmptyState>
          ) : (
            <div className="-mx-3 divide-y divide-border/70">
              {displayLogs.map((e) => (
                <EntryRow
                  key={e.date}
                  entry={e}
                  cycleDay={getCycleDayForDate(e.date)}
                  onSelect={(d) => {
                    onSelectDateToLog(d);
                    onNavigateTab("log");
                  }}
                />
              ))}
            </div>
          )}
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Calendar Grid */}
          <Panel>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-3xl text-foreground">
                {format(month, "MMMM yyyy")}
              </h2>
              <div className="flex gap-1">
                <button
                  aria-label="Previous month"
                  onClick={() => setMonth(addMonths(month, -1))}
                  className="rounded-full p-2 hover:bg-muted text-foreground cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next month"
                  onClick={() => setMonth(addMonths(month, 1))}
                  className="rounded-full p-2 hover:bg-muted text-foreground cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center" role="grid">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="eyebrow pb-2 !text-[0.65rem]">
                  {d}
                </div>
              ))}

              {days.map((d) => {
                const k = fmt(d);
                const e = byDate.get(k);
                const bleed = e?.flow && e.flow !== "none";
                const est = estDays.has(k) && !e;
                const isSel = k === selected;
                const symCount = e ? (e.symptoms || []).length : 0;

                return (
                  <button
                    key={k}
                    onClick={() => setSelected(k)}
                    aria-pressed={isSel}
                    aria-label={format(d, "d MMMM")}
                    className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl text-sm transition ${
                      !isSameMonth(d, month) ? "opacity-35" : ""
                    } ${
                      bleed
                        ? flowTone[e!.flow!] || "bg-rose"
                        : est
                        ? "border border-dashed border-rose-deep/50 text-rose-deep"
                        : e
                        ? "bg-secondary"
                        : "hover:bg-muted"
                    } ${
                      isSel ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    } ${k === today() ? "font-bold" : ""}`}
                  >
                    <span className="font-display text-lg leading-none">
                      {format(d, "d")}
                    </span>
                    {symCount > 0 && (
                      <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <span className="flex items-center gap-1.5">
                <i className="h-3 w-3 rounded bg-rose" />{" "}
                {language === "hi" ? "Bleeding flow" : "Recorded flow"}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-3 w-3 rounded bg-secondary" />{" "}
                {language === "hi" ? "Entry, no flow" : "Entry, no flow"}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-1.5 w-1.5 rounded-full bg-primary" />{" "}
                {language === "hi" ? "Symptoms" : "Symptoms"}
              </span>
              {next && (
                <span className="flex items-center gap-1.5">
                  <i className="h-3 w-3 rounded border border-dashed border-rose-deep" />{" "}
                  {language === "hi" ? "Expected window (Estimate)" : "Estimated, not recorded"}
                </span>
              )}
            </div>
          </Panel>

          {/* Day Inspector Panel */}
          <Panel title={format(parseISO(selected), "EEEE, d MMMM")}>
            {selCycleDay && (
              <p className="-mt-2 mb-4 text-sm text-muted-foreground">
                {language === "hi" ? `Cycle day ${selCycleDay}` : `Cycle day ${selCycleDay}`}
              </p>
            )}

            {sel ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="eyebrow mb-1">
                    {language === "hi" ? "Flow" : "Flow"}
                  </p>
                  <p className="font-medium text-foreground">
                    {sel.flow ? FLOW_LABELS[sel.flow] || sel.flow : (language === "hi" ? "Record nahi hua" : "Not recorded")}
                  </p>
                </div>

                <div>
                  <p className="eyebrow mb-1">
                    {language === "hi" ? "Symptoms" : "Symptoms"}
                  </p>
                  {(sel.symptoms || []).length > 0 ? (
                    <ul className="space-y-1.5">
                      {sel.symptoms.map((s) => {
                        const sev = sel.symptomSeverities?.[s] || 1;
                        return (
                          <li key={s} className="flex justify-between text-foreground">
                            <span>{SYMPTOM_LABELS[s] || s.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground">{SEVERITY_NAMES[sev]}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">
                      {language === "hi" ? "Koi symptom record nahi hua" : "None recorded"}
                    </span>
                  )}
                </div>

                {sel.sleepHours != null && (
                  <div>
                    <p className="eyebrow mb-1">
                      {language === "hi" ? "Sleep" : "Sleep"}
                    </p>
                    <p className="text-foreground">{sel.sleepHours} {language === "hi" ? "hours" : "hours"}</p>
                  </div>
                )}

                {sel.notes && (
                  <div>
                    <p className="eyebrow mb-1">
                      {language === "hi" ? "Notes" : "Notes"}
                    </p>
                    <p className="font-display text-lg leading-snug text-foreground">
                      "{sel.notes}"
                    </p>
                  </div>
                )}
              </div>
            ) : estDays.has(selected) ? (
              <p className="text-sm text-muted-foreground">
                {language === "hi"
                  ? "Yeh din aapki pichhli recorded cycles ke basis par expected period window mein aata hai. Abhi koi entry log nahi hai."
                  : "This day falls in an estimated period window based on your recorded cycle lengths. Nothing has been recorded."}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {language === "hi" ? "Is din ke liye koi entry nahi hai." : "Nothing recorded for this day."}
              </p>
            )}

            {selected <= today() && (
              <button
                type="button"
                onClick={() => {
                  onSelectDateToLog(selected);
                  onNavigateTab("log");
                }}
                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition"
              >
                <Pencil className="h-3.5 w-3.5" />{" "}
                {sel
                  ? language === "hi"
                    ? "Entry edit karein"
                    : "Edit entry"
                  : language === "hi"
                  ? "Entry log karein"
                  : "Add entry"}
              </button>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
