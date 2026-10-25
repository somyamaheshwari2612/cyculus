import { ChevronRight, Droplet, Moon } from "lucide-react";
import { format, parseISO } from "@/shared/dateUtils";
import { flowTone } from "./ui";

export interface DisplayEntry {
  id?: string;
  date: string;
  flow: "none" | "spotting" | "light" | "medium" | "heavy" | null;
  symptoms: Partial<Record<string, 1 | 2 | 3>>;
  sleepHours: number | null;
  notes: string;
}

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

const FLOW_LABELS: Record<string, string> = {
  none: "No flow",
  spotting: "Spotting",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

export function EntryRow({
  entry,
  cycleDay,
  onSelect,
}: {
  entry: DisplayEntry;
  cycleDay?: number | null;
  onSelect?: (date: string) => void;
}) {
  const symKeys = Object.keys(entry.symptoms).filter((k) => entry.symptoms[k]);

  return (
    <div
      onClick={() => onSelect && onSelect(entry.date)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect && onSelect(entry.date);
        }
      }}
      className="group flex cursor-pointer items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/70"
    >
      <div className="w-14 shrink-0 text-center">
        <p className="font-display text-2xl leading-none text-foreground">
          {format(parseISO(entry.date), "d")}
        </p>
        <p className="eyebrow mt-1 !text-[0.6rem]">
          {format(parseISO(entry.date), "MMM")}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {entry.flow && entry.flow !== "none" && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${flowTone[entry.flow] || ""}`}
            >
              <Droplet className="h-3 w-3" /> {FLOW_LABELS[entry.flow] || entry.flow}
            </span>
          )}

          {symKeys.slice(0, 3).map((k) => (
            <span
              key={k}
              className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {SYMPTOM_LABELS[k] || k} · {SEVERITY_NAMES[entry.symptoms[k]!] || "Mild"}
            </span>
          ))}

          {symKeys.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{symKeys.length - 3}
            </span>
          )}

          {entry.sleepHours != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sage-soft px-2 py-0.5 text-xs text-foreground">
              <Moon className="h-3 w-3" />
              {entry.sleepHours}h
            </span>
          )}

          {!symKeys.length &&
            (!entry.flow || entry.flow === "none") &&
            entry.sleepHours == null && (
              <span className="text-xs text-muted-foreground">
                No symptoms recorded
              </span>
            )}
        </div>

        {entry.notes && (
          <p className="mt-1 truncate text-sm text-muted-foreground font-sans">
            "{entry.notes}"
          </p>
        )}
      </div>

      {cycleDay != null && (
        <span className="hidden text-xs text-muted-foreground sm:block">
          Day {cycleDay}
        </span>
      )}

      <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
    </div>
  );
}
