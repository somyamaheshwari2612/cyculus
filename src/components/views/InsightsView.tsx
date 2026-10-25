import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "@/shared/dateUtils";
import { LogEntry, Insights } from "@/shared/types";
import { EmptyState, PageHeader, Panel, Stat } from "../cyculus/ui";
import { ShieldCheck } from "lucide-react";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

const tip = {
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 13,
    color: "var(--foreground)",
  },
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

const SEVERITY_LABEL: Record<number, string> = { 1: "mild", 2: "moderate", 3: "severe" };

export function InsightsView({
  logs,
  insights,
  onNavigateTab,
  language = "en",
}: {
  logs: LogEntry[];
  insights: Insights;
  onNavigateTab: (tab: any) => void;
  language?: "en" | "hi";
}) {
  const cycles = insights.cycles || [];
  const done = cycles.filter((c) => c.lengthDays != null);
  const lengths = done.map((c) => c.lengthDays!);

  const avgLength =
    lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : null;

  const avgPeriodDays =
    cycles.length > 0
      ? cycles.reduce((a, c) => a + c.bleedingDays, 0) / cycles.length
      : null;

  // Chart data for Cycle length
  const cycleData = done.map((c) => ({
    label: format(parseISO(c.startDate), "d MMM"),
    length: c.lengthDays,
    period: c.bleedingDays,
  }));

  // Chart data for Period duration
  const periodData = cycles.map((c) => ({
    label: format(parseISO(c.startDate), "d MMM"),
    days: c.bleedingDays,
  }));

  // Symptom frequency & severities
  const symMap: Record<string, { count: number; totalSev: number }> = {};
  logs.forEach((l) => {
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

  // Symptom appearance by cycle phase buckets
  const buckets = [
    { name: "Days 1–5", from: 1, to: 5, count: 0 },
    { name: "6–13", from: 6, to: 13, count: 0 },
    { name: "14–20", from: 14, to: 20, count: 0 },
    { name: "21+", from: 21, to: 99, count: 0 },
  ];

  logs.forEach((e) => {
    // Find matching cycle
    const c = [...cycles].reverse().find((item) => item.startDate <= e.date);
    if (c) {
      const d =
        Math.round(
          (new Date(e.date).getTime() - new Date(c.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      const n = (e.symptoms || []).length;
      if (d > 0 && n > 0) {
        const b = buckets.find((b) => d >= b.from && d <= b.to);
        if (b) b.count += n;
      }
    }
  });

  const hasBuckets = buckets.some((b) => b.count > 0);

  // Clinical Regularity & Variation from calculus engine
  const lengthVariance = lengths.length > 1 ? Math.max(...lengths) - Math.min(...lengths) : 0;
  const isRegular = lengthVariance <= 7;

  return (
    <>
      <PageHeader
        eyebrow={language === "hi" ? "Calculus" : "The calculus"}
        title={language === "hi" ? "Insights" : "Insights"}
        subtitle={
          language === "hi"
            ? "Aapke recorded data ka summary — koi medical diagnosis nahi. Har cycle ke saath patterns aur clear hote jayenge."
            : "Descriptions of what you've recorded — not diagnoses. Patterns become clearer with each cycle."
        }
      />

      {logs.length === 0 ? (
        <EmptyState
          title={language === "hi" ? "Insights aapke records se develop hoti hain" : "Insights grow from your records"}
          action={
            <button
              onClick={() => onNavigateTab("log")}
              className="text-sm font-semibold text-primary hover:underline cursor-pointer"
            >
              {language === "hi" ? "Logging start karein →" : "Start logging →"}
            </button>
          }
        >
          {language === "hi"
            ? "Kuch cycles ke baad aap dekh payengi ki cycle length mein kitna variation hai, bleeding kitne din chalti hai, aur kaun se symptoms kab aate hain."
            : "After a couple of cycles you'll see how your cycle length varies, how long periods last, and which symptoms recur — and when."}
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              label={language === "hi" ? "Entries" : "Entries"}
              value={logs.length}
              hint={language === "hi" ? "days recorded" : "days recorded"}
            />
            <Stat
              label={language === "hi" ? "Cycles" : "Cycles"}
              value={done.length}
              hint={language === "hi" ? "complete, recorded" : "complete, recorded"}
            />
            <Stat
              label={language === "hi" ? "Avg cycle" : "Avg cycle"}
              value={avgLength ? `${avgLength.toFixed(1)} d` : "—"}
              hint={
                lengths.length > 1
                  ? language === "hi"
                    ? `${lengthVariance} din ka variation`
                    : `varies by ${lengthVariance} days`
                  : language === "hi"
                  ? "needs 2 period starts"
                  : "needs 2 period starts"
              }
            />
            <Stat
              label={language === "hi" ? "Avg bleeding" : "Avg period"}
              value={avgPeriodDays ? `${avgPeriodDays.toFixed(1)} d` : "—"}
              hint={language === "hi" ? "bleeding days" : "bleeding days"}
            />
          </div>

          {/* Clinical Regularity Card */}
          {done.length >= 2 && (
            <div className="card-soft p-5 bg-lavender/40 border border-primary/20 flex items-start gap-4">
              <div className="p-2.5 rounded-full bg-card text-primary shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <h4 className="font-semibold text-foreground">
                  {language === "hi" ? "Clinical Regularity Analysis" : "Clinical Regularity Analysis"}
                </h4>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  {isRegular
                    ? language === "hi"
                      ? `Aapki cycle length ${Math.min(...lengths)} se ${Math.max(...lengths)} din ke beech rahi hai (${lengthVariance} din ka difference). ACOG clinical criteria ke mutabik yeh stable aur regular rhythm hai.`
                      : `Your recorded cycle length varies from ${Math.min(...lengths)} to ${Math.max(...lengths)} days (a ${lengthVariance}-day range). Under ACOG criteria, cycles with under 7–9 days variance are considered clinically regular.`
                    : language === "hi"
                      ? `Aapki cycle length mein ${lengthVariance} din ka variation dekha gaya hai. ACOG criteria ke mutabik aisi cycle variation par doctor se consult karna helpful rehta hai.`
                      : `Your recorded cycle length varies by ${lengthVariance} days. Fluctuations greater than 7–9 days frequently occur with hormonal changes, stress, or cycle irregularities. This is valuable context to share with your physician.`}
                </p>
              </div>
            </div>
          )}

          {/* 4 Core Data Panels */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Cycle Length LineChart */}
            <Panel title={language === "hi" ? "Cycle length over time" : "Cycle length over time"}>
              <p className="-mt-2 mb-4 text-sm text-muted-foreground">
                {language === "hi"
                  ? "Ek recorded period start se next period start ke beech ke din."
                  : "Days from one recorded period start to the next."}
              </p>
              {cycleData.length >= 2 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cycleData} margin={{ left: -16, right: 8 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" {...axis} />
                      <YAxis
                        {...axis}
                        unit=" d"
                        domain={["dataMin - 3", "dataMax + 3"]}
                      />
                      <Tooltip
                        {...tip}
                        formatter={(v: any) => [`${v} days`, "Cycle length"]}
                      />
                      <Line
                        dataKey="length"
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "var(--primary)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  {language === "hi"
                    ? `Kam se kam do complete cycles ki zaroorat hai (abhi ${done.length} recorded hain).`
                    : `Needs at least two complete cycles (${done.length} recorded so far).`}
                </p>
              )}
            </Panel>

            {/* Period Duration BarChart */}
            <Panel title={language === "hi" ? "Period duration" : "Period duration"}>
              <p className="-mt-2 mb-4 text-sm text-muted-foreground">
                {language === "hi"
                  ? "Light, medium ya heavy flow wale consecutive days."
                  : "Consecutive days with light, medium or heavy flow."}
              </p>
              {periodData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={periodData} margin={{ left: -16, right: 8 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" {...axis} />
                      <YAxis {...axis} allowDecimals={false} unit=" d" />
                      <Tooltip
                        {...tip}
                        cursor={{ fill: "var(--muted)" }}
                        formatter={(v: any) => [`${v} days`, "Duration"]}
                      />
                      <Bar
                        dataKey="days"
                        fill="var(--rose-deep)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  {language === "hi"
                    ? "Duration dekhne ke liye period ke dino par flow log karein."
                    : "Record flow on period days to see durations."}
                </p>
              )}
            </Panel>

            {/* Most Recorded Symptoms */}
            <Panel title={language === "hi" ? "Most recorded symptoms" : "Most recorded symptoms"}>
              <p className="-mt-2 mb-4 text-sm text-muted-foreground">
                {language === "hi"
                  ? "Har symptom kitne din log hua, uski average severity ke saath."
                  : "Number of days each symptom was logged, with average severity."}
              </p>
              {freq.length > 0 ? (
                <ul className="space-y-3">
                  {freq.slice(0, 5).map((f) => (
                    <li key={f.key}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{f.label}</span>
                        <span className="text-muted-foreground">
                          {f.count} {language === "hi" ? "din" : "days"} ·{" "}
                          {SEVERITY_LABEL[f.avgSeverity]}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-lavender overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{
                            width: `${(f.count / (freq[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "Abhi koi symptom log nahi hua." : "No symptoms logged yet."}
                </p>
              )}
            </Panel>

            {/* When Symptoms Appear in Cycle */}
            <Panel title={language === "hi" ? "Symptoms cycle mein kab aate hain" : "When symptoms appear"}>
              <p className="-mt-2 mb-4 text-sm text-muted-foreground">
                {language === "hi"
                  ? "Cycle days ke according grouped symptoms. Yeh timing show karta hai, cause nahi."
                  : "Symptoms logged, grouped by cycle day. Shows timing, not cause."}
              </p>
              {hasBuckets ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets} margin={{ left: -16, right: 8 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" {...axis} />
                      <YAxis {...axis} allowDecimals={false} />
                      <Tooltip
                        {...tip}
                        cursor={{ fill: "var(--muted)" }}
                        formatter={(v: any) => [v, "Symptoms logged"]}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--primary)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={48}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  {language === "hi"
                    ? "Period start ke baad symptoms log hone par yahan dikhenge."
                    : "Appears once symptoms are logged after a recorded period start."}
                </p>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
