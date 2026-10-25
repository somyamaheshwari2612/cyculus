import { useState } from "react";
import { ArrowRight, Lock, Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "../cyculus/Logo";
import hero from "@/assets/hero-woman.png";
import { UserSetup } from "@/shared/types";
import { today } from "@/shared/dateUtils";

export function WelcomeView({
  userSetup,
  onSaveProfile,
  onComplete,
  language = "en",
}: {
  userSetup: UserSetup | null;
  onSaveProfile: (setup: {
    name: string;
    lastPeriodStart?: string;
    typicalCycleLength: number | null;
    previousStarts?: string[];
  }) => Promise<void>;
  onComplete: () => void;
  language?: "en" | "hi";
}) {
  const [step, setStep] = useState<"intro" | "setup">("intro");
  const [name, setName] = useState(userSetup?.name || "");
  const [lastPeriodStart, setLastPeriodStart] = useState(userSetup?.lastPeriodStart || "");
  const [cycleMode, setCycleMode] = useState<"know" | "not_sure">("know");
  const [len, setLen] = useState(userSetup?.typicalCycleLength ? String(userSetup.typicalCycleLength) : "28");
  const [showEarlier, setShowEarlier] = useState(false);
  const [prevStart1, setPrevStart1] = useState("");
  const [prevStart2, setPrevStart2] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === "hi" ? "Please apna naam enter karein." : "Please add a name to continue.");
      return;
    }
    const cycleLen = cycleMode === "know" && len ? Number(len) : null;
    if (cycleLen != null && (cycleLen < 15 || cycleLen > 90)) {
      setError(
        language === "hi"
          ? "Cycle length 15 se 90 days ke beech honi chahiye."
          : "Typical cycle length should be between 15 and 90 days."
      );
      return;
    }

    const previousStarts: string[] = [];
    if (prevStart1 && prevStart1 <= today()) previousStarts.push(prevStart1);
    if (prevStart2 && prevStart2 <= today()) previousStarts.push(prevStart2);

    try {
      setIsSaving(true);
      setError(null);
      await onSaveProfile({
        name: name.trim(),
        lastPeriodStart: lastPeriodStart || undefined,
        typicalCycleLength: cycleLen,
        previousStarts: previousStarts.length > 0 ? previousStarts : undefined,
      });
      onComplete();
    } catch (err: any) {
      setError(err?.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-wash">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10">
          <Logo />

          {step === "intro" ? (
            <div className="mt-8 sm:mt-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <h1 className="font-display text-5xl leading-[0.98] text-foreground md:text-7xl">
                {language === "hi" ? (
                  <>
                    Aapke cycle patterns,<br />
                    <em className="text-primary">samjhe hue aur safe.</em>
                  </>
                ) : (
                  <>
                    Your patterns,<br />
                    <em className="text-primary">understood.</em>
                  </>
                )}
              </h1>
              <p className="mt-5 max-w-md text-base sm:text-lg leading-relaxed text-muted-foreground">
                {language === "hi"
                  ? "Ek private aur serene jagah jahan aap apne symptoms track kar sakein, changes notice karein, aur doctor visit ke liye better prepare karein."
                  : "A private space to track how you feel, notice changes over time, and prepare for more informed health conversations."}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {userSetup?.name ? (
                  <button
                    onClick={onComplete}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground shadow-lift transition hover:brightness-110"
                  >
                    {language === "hi" ? "Apni journal continue karein" : "Continue to your journal"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setStep("setup")}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground shadow-lift transition hover:brightness-110"
                  >
                    {language === "hi" ? "Apni journal start karein" : "Begin your journal"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="mt-8 flex max-w-sm items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {language === "hi"
                    ? "Cyculus aapki personal diary hai, koi medical diagnosis nahi. Yeh wahi dikhata hai jo aap note karti hain — final advice doctor dete hain."
                    : "Cyculus is a journal, not a diagnosis. It describes what you record — your clinician interprets it."}
                </span>
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 sm:mt-12 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <p className="eyebrow">
                {language === "hi" ? "Two quick things" : "Two small things"}
              </p>
              <h2 className="mt-3 font-display text-4xl text-foreground">
                {language === "hi" ? "Aaiye apni journal ready karein." : "Let's set up your journal."}
              </h2>

              <label className="mt-8 block">
                <span className="text-sm font-semibold">
                  {language === "hi" ? "Aapka naam kya hai?" : "What should we call you?"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {language === "hi" ? "Bas aapko greet karne ke liye use hoga. Nickname bhi chalega." : "Used only to greet you. A nickname is perfect."}
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary text-foreground"
                  placeholder="e.g. Medhya"
                />
              </label>

              {/* Last period start date */}
              <label className="mt-5 block">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {language === "hi" ? "Pichhla period kab start hua tha?" : "When did your last period start?"}
                  </span>
                  <span className="text-[11px] text-muted-foreground uppercase">Optional</span>
                </div>
                <input
                  type="date"
                  max={today()}
                  value={lastPeriodStart}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-2.5 outline-none focus:border-primary text-foreground font-sans text-sm"
                />
              </label>

              {/* Typical Cycle Length */}
              <div className="mt-6 rounded-2xl border border-primary/20 bg-lavender/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {language === "hi" ? "Typical cycle length" : "Typical cycle length"}
                  </span>
                  <span className="text-[10px] font-semibold text-primary bg-card px-2 py-0.5 rounded-full border border-primary/20">
                    28 is a myth
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-card rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setCycleMode("know");
                      if (!len) setLen("28");
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
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
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      cycleMode === "not_sure"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>❓</span>
                    <span>{language === "hi" ? "Not sure / Irregular" : "Not sure / Irregular"}</span>
                  </button>
                </div>

                {cycleMode === "know" ? (
                  <div className="space-y-3 pt-1 animate-in fade-in">
                    <div>
                      <span className="block text-[11px] text-muted-foreground mb-1.5 font-medium">
                        {language === "hi" ? "Quick Select (common cycle days):" : "Quick select typical days:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[26, 27, 28, 29, 30, 31, 32, 35].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setLen(String(d))}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              len === String(d)
                                ? "bg-primary text-primary-foreground shadow-sm scale-105"
                                : "bg-card border border-border text-foreground hover:border-primary/50"
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-card p-2.5 rounded-xl border border-border">
                      <span className="text-xs text-muted-foreground font-medium">
                        {language === "hi" ? "Exact din:" : "Exact days:"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const curr = parseInt(len, 10) || 28;
                            if (curr > 15) setLen(String(curr - 1));
                          }}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground cursor-pointer transition"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={15}
                          max={90}
                          value={len}
                          onChange={(e) => setLen(e.target.value)}
                          className="w-16 rounded-lg border border-input bg-card px-2 py-1 text-center font-sans font-bold text-sm text-foreground outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const curr = parseInt(len, 10) || 28;
                            if (curr < 90) setLen(String(curr + 1));
                          }}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground cursor-pointer transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs text-muted-foreground ml-1">days</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-card rounded-xl border border-border text-xs text-muted-foreground">
                    <p>
                      {language === "hi"
                        ? "ACOG population baseline (29 days) use hoga jab tak aap apni real cycles log nahi karte."
                        : "Population baseline (29 days) will be used until your own entries reveal your natural rhythm."}
                    </p>
                  </div>
                )}
              </div>

              {/* Optional Earlier Starts Accordion */}
              <div className="mt-4 border-t border-border/40 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEarlier(!showEarlier)}
                  className="flex w-full items-center justify-between text-xs font-semibold text-primary hover:underline cursor-pointer py-1"
                >
                  <span>
                    {language === "hi"
                      ? "+ Pichhli dates bhi add karein (optional)"
                      : "+ Add earlier period starts (optional)"}
                  </span>
                  {showEarlier ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showEarlier && (
                  <div className="mt-3 space-y-2.5 rounded-xl bg-card p-3 border border-border animate-in fade-in">
                    <div>
                      <span className="block text-[11px] text-muted-foreground mb-1">
                        {language === "hi" ? "Second last period start:" : "Previous period start:"}
                      </span>
                      <input
                        type="date"
                        max={today()}
                        value={prevStart1}
                        onChange={(e) => setPrevStart1(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-muted-foreground mb-1">
                        {language === "hi" ? "Third last period start:" : "Earlier period start (3rd cycle):"}
                      </span>
                      <input
                        type="date"
                        max={today()}
                        value={prevStart2}
                        onChange={(e) => setPrevStart2(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-rose-soft p-3 text-sm text-foreground">
                  {error}
                </div>
              )}

              <div className="mt-8 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground shadow-lift disabled:opacity-60 transition hover:brightness-110"
                >
                  {isSaving ? (language === "hi" ? "Saving…" : "Saving…") : (language === "hi" ? "Journal open karein" : "Open my journal")}{" "}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep("intro")}
                  className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {language === "hi" ? "Back" : "Back"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-8 rounded-full bg-accent/70 blur-3xl" aria-hidden />
          <img
            src={hero}
            alt="Watercolor illustration of a woman with flowers in her hair"
            width={1024}
            height={1152}
            className="relative mx-auto max-h-[82vh] w-auto drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
