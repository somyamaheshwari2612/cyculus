import { useState, useEffect } from "react";
import { Download, HardDrive, ShieldCheck, Trash2, Users, Globe, Check, Sparkles, Minus, Plus } from "lucide-react";
import { UserSetup, LogEntry } from "@/shared/types";
import { PageHeader, Panel } from "../cyculus/ui";
import { today } from "@/shared/dateUtils";
import irregularData from "@/shared/mocks/entries.irregular.json";
import regularData from "@/shared/mocks/entries.regular.json";
import heavyData from "@/shared/mocks/entries.heavy.json";

export function SettingsView({
  userSetup,
  onSaveProfile,
  onExport,
  onDeleteAll,
  onSeedPersona,
  language = "en",
  onLanguageChange,
  onOpenCycleSetup,
}: {
  userSetup: UserSetup | null;
  onSaveProfile: (setup: {
    name: string;
    lastPeriodStart?: string;
    typicalCycleLength: number | null;
    previousStarts?: string[];
  }) => Promise<void>;
  onExport: () => Promise<string>;
  onDeleteAll: () => Promise<void>;
  onSeedPersona: (entries: LogEntry[], name: string) => Promise<void>;
  language?: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
  onOpenCycleSetup?: () => void;
}) {
  const [name, setName] = useState(userSetup?.name || "");
  const [lastPeriodStart, setLastPeriodStart] = useState(userSetup?.lastPeriodStart || "");
  const [cycleMode, setCycleMode] = useState<"know" | "not_sure">(() => {
    return userSetup && userSetup.typicalCycleLength === null && userSetup.lastPeriodStart ? "not_sure" : "know";
  });
  const [len, setLen] = useState(userSetup?.typicalCycleLength ? String(userSetup.typicalCycleLength) : "28");
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activePersona, setActivePersona] = useState<string | null>(() =>
    localStorage.getItem("cyculus_active_persona")
  );

  useEffect(() => {
    if (userSetup) {
      setName(userSetup.name || "");
      setLastPeriodStart(userSetup.lastPeriodStart || "");
      if (userSetup.typicalCycleLength !== null && userSetup.typicalCycleLength !== undefined) {
        setLen(String(userSetup.typicalCycleLength));
        setCycleMode("know");
      } else if (userSetup.lastPeriodStart) {
        setCycleMode("not_sure");
      }
    }
  }, [userSetup]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const parsedLen = cycleMode === "know" && len ? Number(len) : null;
      await onSaveProfile({
        name: name.trim(),
        lastPeriodStart: lastPeriodStart || undefined,
        typicalCycleLength: parsedLen,
        previousStarts: userSetup?.previousStarts,
      });
      setNotice(language === "hi" ? "Profile save ho gayi!" : "Profile saved successfully!");
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const dataStr = await onExport();
      const blob = new Blob([dataStr], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cyculus-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setNotice(language === "hi" ? "Data export download ho gaya!" : "Export downloaded!");
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Export failed.");
    }
  };

  const handleSeed = async (type: "riya" | "regular" | "heavy") => {
    let dataset: LogEntry[] = [];
    let pName = "";
    if (type === "riya") {
      dataset = irregularData as LogEntry[];
      pName = "Riya";
    } else if (type === "regular") {
      dataset = regularData as LogEntry[];
      pName = "Ananya";
    } else {
      dataset = heavyData as LogEntry[];
      pName = "Pooja";
    }

    try {
      await onSeedPersona(dataset, pName);
      localStorage.setItem("cyculus_active_persona", type);
      setActivePersona(type);
      setNotice(
        language === "hi"
          ? `${pName} ka clinical demo scenario load ho gaya!`
          : `Loaded ${dataset.length} days of ${pName}'s scenario!`
      );
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to load demo scenario.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={language === "hi" ? "Your space" : "Your space"}
        title={language === "hi" ? "Settings & Privacy" : "Settings & privacy"}
      />

      {notice && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-lavender p-4 text-sm font-medium text-foreground">
          {notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Panel */}
        <Panel title={language === "hi" ? "Profile & Cycle Prior" : "Profile & Cycle Prior"}>
          {onOpenCycleSetup && (
            <div className="rounded-2xl border border-primary/20 bg-lavender/50 p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{language === "hi" ? "Guided Setup Wizard" : "Guided Setup Wizard"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {language === "hi"
                    ? "Apna naam, cycle baseline aur pichhle 3 periods recalibrate karein."
                    : "Recalibrate your baseline, typical cycle length, and past 3 periods."}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenCycleSetup}
                className="rounded-full bg-primary/10 border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition cursor-pointer shrink-0"
              >
                {language === "hi" ? "Re-open Guided Setup Wizard" : "Re-open Guided Setup Wizard"}
              </button>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleProfileSubmit}>
            <label className="block">
              <span className="eyebrow">{language === "hi" ? "Name" : "Name"}</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary text-foreground font-sans"
              />
            </label>

            {/* Last period start date */}
            <label className="block">
              <span className="eyebrow">
                {language === "hi" ? "Last period start date" : "Last period start date"}
              </span>
              <input
                type="date"
                max={today()}
                value={lastPeriodStart}
                onChange={(e) => setLastPeriodStart(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary text-foreground font-sans"
              />
            </label>

            {/* Typical Cycle Length */}
            <div className="rounded-2xl border border-primary/20 bg-lavender/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="eyebrow">
                  {language === "hi" ? "Typical cycle length" : "Typical cycle length"}
                </span>
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

                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {language === "hi"
                      ? "FIGO / ACOG standards: Healthy cycle 24 se 38 days ke beech normal hoti hai."
                      : "FIGO standard: Healthy menstrual cycles range from 24 to 38 days."}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-card rounded-xl border border-border text-xs text-muted-foreground">
                  <p>
                    {language === "hi"
                      ? "ACOG population baseline (29 days) use kiya jayega jab tak aap 2 complete cycles log nahi karte."
                      : "The clinical population baseline (29 days) will be used until your own entries reveal your natural rhythm."}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lift transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? (language === "hi" ? "Saving…" : "Saving…") : (language === "hi" ? "Save changes" : "Save changes")}
            </button>
          </form>
        </Panel>

        {/* Where your records live Panel */}
        <Panel title={language === "hi" ? "Aapka data kahan save hota hai" : "Where your records live"}>
          <ul className="space-y-4 text-sm leading-relaxed text-foreground">
            <li className="flex gap-3">
              <HardDrive className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span>
                {language === "hi" ? (
                  <>
                    Aapki entries <strong>strictly aapke isi device par browser ke andar (IndexedDB)</strong> safe rehti hain. Internet band hone par bhi sab offline kaam karta hai.
                  </>
                ) : (
                  <>
                    Your entries are stored <strong>strictly on this device in your browser (IndexedDB)</strong>. Everything functions offline and never touches any remote ad-trackers.
                  </>
                )}
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span>
                {language === "hi"
                  ? "Koi ads nahi, koi third-party tracking nahi. Aapka cycle data 100% private hai."
                  : "No analytics, advertising, or third-party tracking is ever added to your records."}
              </span>
            </li>
            <li className="flex gap-3 items-center pt-2">
              <Globe className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Language:</span>
                <button
                  type="button"
                  onClick={() => onLanguageChange("en")}
                  className={`rounded-full px-3 py-1 text-xs cursor-pointer transition ${
                    language === "en" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-foreground"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange("hi")}
                  className={`rounded-full px-3 py-1 text-xs cursor-pointer transition ${
                    language === "hi" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-foreground"
                  }`}
                >
                  हिंदी (Hinglish)
                </button>
              </div>
            </li>
          </ul>
        </Panel>

        {/* Clinical Scenarios & Persona Tester Panel */}
        <Panel
          title={
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>{language === "hi" ? "Clinical Scenarios (Instant Demo)" : "Clinical Scenarios (Instant Demo)"}</span>
            </span>
          }
          className="lg:col-span-2"
        >
          <p className="text-sm text-muted-foreground mb-4">
            {language === "hi"
              ? "Hackathon evaluators aur clinicians ke liye: 6 mahine ka data manually daalne ke bajaye, 1-click mein realistic scenarios load karein aur insights check karein."
              : "For hackathon evaluators & clinicians: Instead of manually inputting 180 days of entries, test rich clinical insights instantly with one-click realistic clinical scenarios."}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleSeed("riya")}
              className={`p-4 rounded-xl border text-left transition cursor-pointer hover:border-primary ${
                activePersona === "riya" ? "border-primary bg-lavender/60 shadow-sm" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Riya (PCOS / Irregular)</span>
                {activePersona === "riya" && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                180 days of variable cycle lengths (32–54 days), hormonal acne & cramps.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSeed("regular")}
              className={`p-4 rounded-xl border text-left transition cursor-pointer hover:border-primary ${
                activePersona === "regular" ? "border-primary bg-lavender/60 shadow-sm" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Ananya (Regular Rhythm)</span>
                {activePersona === "regular" && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Consistent 27–29 day rhythm with regular bleeding duration and mild PMS.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSeed("heavy")}
              className={`p-4 rounded-xl border text-left transition cursor-pointer hover:border-primary ${
                activePersona === "heavy" ? "border-primary bg-lavender/60 shadow-sm" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Pooja (Menorrhagia)</span>
                {activePersona === "heavy" && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Prolonged heavy flow episodes (&gt;7 days) triggering ACOG clinical guidance.
              </p>
            </button>
          </div>
        </Panel>

        {/* Data Management Panel */}
        <Panel title={language === "hi" ? "Your data" : "Your data"} className="lg:col-span-2">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              <Download className="h-4 w-4" />{" "}
              {language === "hi" ? "Export all records (JSON)" : "Export all records (JSON)"}
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
            >
              <Trash2 className="h-4 w-4" />{" "}
              {language === "hi" ? "Delete everything" : "Delete everything"}
            </button>
          </div>
        </Panel>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lift border border-border animate-in fade-in zoom-in-95">
            <h3 className="font-display text-2xl text-foreground">
              {language === "hi" ? "Kya saare records delete karne hain?" : "Delete all your records?"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {language === "hi"
                ? "Aapki profile, har entry aur saved questions is device se permanently delete ho jayenge. Yeh undo nahi ho sakta."
                : "Your profile, every entry, and your saved questions will be permanently erased from this device. This cannot be undone."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full px-5 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {language === "hi" ? "Cancel" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDeleteAll();
                  localStorage.removeItem("cyculus_active_persona");
                  setActivePersona(null);
                  setShowDeleteModal(false);
                }}
                className="rounded-full bg-destructive px-5 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer shadow-sm"
              >
                {language === "hi" ? "Delete everything" : "Delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
