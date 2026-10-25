import { useState } from "react";
import { UserSetup } from "@/shared/types";
import { Calendar, Minus, Plus, X, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { today } from "@/shared/dateUtils";

export interface CycleSetupModalProps {
  userSetup: UserSetup | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (setup: {
    name: string;
    lastPeriodStart?: string;
    typicalCycleLength: number | null;
    previousStarts?: string[];
  }) => Promise<void>;
  language?: "en" | "hi";
}

export function CycleSetupModal({
  userSetup,
  isOpen,
  onClose,
  onSave,
  language = "en",
}: CycleSetupModalProps) {
  const [name, setName] = useState(userSetup?.name || "");
  const [lastPeriodStart, setLastPeriodStart] = useState<string>(
    userSetup?.lastPeriodStart || ""
  );

  const [cycleMode, setCycleMode] = useState<"know" | "not_sure">(() => {
    if (userSetup && userSetup.typicalCycleLength === null && userSetup.lastPeriodStart) {
      return "not_sure";
    }
    return "know";
  });

  const [cycleLength, setCycleLength] = useState<number>(() => {
    return userSetup?.typicalCycleLength ?? 28;
  });

  const [cycleLengthStr, setCycleLengthStr] = useState<string>(() => {
    return userSetup?.typicalCycleLength ? String(userSetup.typicalCycleLength) : "28";
  });

  const [showEarlierDates, setShowEarlierDates] = useState(
    Boolean(userSetup?.previousStarts && userSetup.previousStarts.length > 0)
  );
  const [prevStart1, setPrevStart1] = useState(userSetup?.previousStarts?.[0] || "");
  const [prevStart2, setPrevStart2] = useState(userSetup?.previousStarts?.[1] || "");
  const [prevStart3, setPrevStart3] = useState(userSetup?.previousStarts?.[2] || "");

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const todayStr = today();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lastPeriodStart && lastPeriodStart > todayStr) {
      setError(
        language === "hi"
          ? "Period start date future ki nahi ho sakti."
          : "Last period start date cannot be in the future."
      );
      return;
    }

    let finalLength: number | null = null;
    if (cycleMode === "know") {
      const parsed = parseInt(cycleLengthStr, 10);
      if (isNaN(parsed) || parsed < 15 || parsed > 90) {
        setError(
          language === "hi"
            ? "Cycle length 15 se 90 days ke beech enter karein (ya 'Not sure / Irregular' chunein)."
            : "Please enter a typical cycle length between 15 and 90 days, or select 'Not sure / Irregular'."
        );
        return;
      }
      finalLength = parsed;
    }

    const previousStarts: string[] = [];
    [prevStart1, prevStart2, prevStart3].forEach((d) => {
      if (d && d <= todayStr && !previousStarts.includes(d)) {
        previousStarts.push(d);
      }
    });

    try {
      setIsSaving(true);
      await onSave({
        name: name.trim() || userSetup?.name || "Friend",
        lastPeriodStart: lastPeriodStart || undefined,
        typicalCycleLength: finalLength,
        previousStarts: previousStarts.length > 0 ? previousStarts : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save cycle setup.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-card p-6 sm:p-8 shadow-lift border border-border animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender text-primary text-xs font-semibold uppercase tracking-wider mb-2 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{language === "hi" ? "Cycle Calibration" : "Cycle Prior Calibration"}</span>
          </div>
          <h2 className="font-display text-3xl text-foreground">
            {language === "hi" ? "Cycle Length & Dates Setup" : "Calibrate Your Cycle Prior"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {language === "hi"
              ? "Yeh data shuruati predictions ko accurate banata hai. Jaise hi aap real logs enter karenge, Cyculus aapke actual patterns ko follow karega."
              : "This self-reported baseline seeds initial predictions. It fades naturally as real recorded cycles accumulate."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-rose-soft p-3 text-xs text-foreground">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {language === "hi" ? "Aapka naam ya nickname" : "Your name or nickname"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Somya"
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary font-sans"
            />
          </div>

          {/* Last Period Start Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">
                {language === "hi" ? "Pichhla period kab start hua tha?" : "When did your last period start?"}
              </label>
              <span className="text-[10px] text-muted-foreground uppercase">
                {language === "hi" ? "Optional" : "Optional"}
              </span>
            </div>
            <div className="relative">
              <input
                type="date"
                max={todayStr}
                value={lastPeriodStart}
                onChange={(e) => setLastPeriodStart(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary font-sans"
              />
              <Calendar className="h-4 w-4 text-muted-foreground absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Typical Cycle Length */}
          <div className="rounded-2xl border border-primary/20 bg-lavender/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {language === "hi" ? "Aam taur par cycle kitne din ki rehti hai?" : "Typical Cycle Length"}
              </label>
              <span className="text-[10px] font-semibold text-primary bg-card px-2 py-0.5 rounded-full border border-primary/20">
                28 is a myth
              </span>
            </div>

            {/* Mode selection toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-card rounded-xl border border-border">
              <button
                type="button"
                onClick={() => {
                  setCycleMode("know");
                  if (!cycleLengthStr) {
                    setCycleLength(28);
                    setCycleLengthStr("28");
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  cycleMode === "know"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>🗓️</span>
                <span>{language === "hi" ? "Cycle length pata hai" : "I know my cycle"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCycleMode("not_sure")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  cycleMode === "not_sure"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>❓</span>
                <span>{language === "hi" ? "Pakka nahi pata / Irregular" : "Not sure / Irregular"}</span>
              </button>
            </div>

            {cycleMode === "know" ? (
              <div className="space-y-3 pt-1 animate-in fade-in">
                {/* Quick Select Chips */}
                <div>
                  <span className="block text-[11px] text-muted-foreground mb-1.5 font-medium">
                    {language === "hi" ? "Quick Select (common cycle days):" : "Quick select typical days:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[26, 27, 28, 29, 30, 31, 32, 35].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setCycleLength(d);
                          setCycleLengthStr(String(d));
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          cycleLength === d && cycleLengthStr === String(d)
                            ? "bg-primary text-primary-foreground shadow-sm scale-105"
                            : "bg-card border border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stepper + Input */}
                <div className="flex items-center justify-between gap-3 bg-card p-2.5 rounded-xl border border-border">
                  <span className="text-xs text-muted-foreground font-medium">
                    {language === "hi" ? "Exact din adjust karein:" : "Adjust exact days:"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.max(15, (parseInt(cycleLengthStr, 10) || cycleLength || 28) - 1);
                        setCycleLength(val);
                        setCycleLengthStr(String(val));
                      }}
                      className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted flex items-center justify-center transition active:scale-95 cursor-pointer"
                      aria-label="Decrease cycle length"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <input
                      type="number"
                      min={15}
                      max={90}
                      value={cycleLengthStr}
                      onChange={(e) => {
                        setCycleLengthStr(e.target.value);
                        const p = parseInt(e.target.value, 10);
                        if (!isNaN(p)) setCycleLength(p);
                      }}
                      className="w-16 px-2 py-1.5 rounded-lg border border-input bg-card text-center text-sm font-bold text-foreground outline-none focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.min(90, (parseInt(cycleLengthStr, 10) || cycleLength || 28) + 1);
                        setCycleLength(val);
                        setCycleLengthStr(String(val));
                      }}
                      className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted flex items-center justify-center transition active:scale-95 cursor-pointer"
                      aria-label="Increase cycle length"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {language === "hi"
                    ? "FIGO guidelines ke according 24 se 38 din ka cycle normal range mein aata hai."
                    : "Clinical guidance (FIGO standard) considers cycles between 24 and 38 days regular."}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-card rounded-xl border border-border text-xs text-muted-foreground">
                <p>
                  {language === "hi"
                    ? "Koi baat nahi! Hum clinical median (29 din) se shuru karenge aur jaise-jaise aap period log karengi, exact pattern update hota jayega."
                    : "No problem! We'll start with the clinical population median (29 days) and adapt automatically as you record periods."}
                </p>
              </div>
            )}
          </div>

          {/* Earlier Dates Accordion (Optional) */}
          <div className="border border-border rounded-xl p-3 bg-card">
            <button
              type="button"
              onClick={() => setShowEarlierDates(!showEarlierDates)}
              className="w-full flex items-center justify-between text-xs font-semibold text-foreground cursor-pointer"
            >
              <span>{language === "hi" ? "Pehle ki tareekhein (Accuracy badhane ke liye)" : "Earlier period dates (Optional calibration)"}</span>
              {showEarlierDates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showEarlierDates && (
              <div className="mt-3 space-y-2.5 pt-2 border-t border-border animate-in fade-in">
                <p className="text-[11px] text-muted-foreground">
                  {language === "hi"
                    ? "Agar calendar se pichhli 1-3 tareekhein yaad hon toh add kar lijiye:"
                    : "If you remember your previous 1–3 period starts from your calendar:"}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    type="date"
                    max={todayStr}
                    value={prevStart1}
                    onChange={(e) => setPrevStart1(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground"
                  />
                  <input
                    type="date"
                    max={todayStr}
                    value={prevStart2}
                    onChange={(e) => setPrevStart2(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground"
                  />
                  <input
                    type="date"
                    max={todayStr}
                    value={prevStart3}
                    onChange={(e) => setPrevStart3(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {language === "hi" ? "Cancel" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-sm font-medium text-primary-foreground shadow-lift hover:brightness-110 transition disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              <span>{isSaving ? "Saving…" : language === "hi" ? "Calibrate karein" : "Save & Calibrate"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
