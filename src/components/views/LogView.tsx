import { useState, useEffect, useRef } from "react";
import { Check, Trash2, Sparkles, Mic, MicOff, AlertCircle, Edit3, X, Send } from "lucide-react";
import { format, parseISO, today } from "@/shared/dateUtils";
import { LogEntry, FlowLevel, Symptom, Mood } from "@/shared/types";
import { PageHeader, Panel } from "../cyculus/ui";

const FLOWS: { key: FlowLevel; label: string }[] = [
  { key: "none", label: "No flow" },
  { key: "spotting", label: "Spotting" },
  { key: "light", label: "Light" },
  { key: "medium", label: "Medium" },
  { key: "heavy", label: "Heavy" },
];

const SYMPTOMS_LIST: { key: Symptom; label: string }[] = [
  { key: "cramps", label: "Cramps" },
  { key: "bloating", label: "Bloating" },
  { key: "fatigue", label: "Fatigue" },
  { key: "headache", label: "Headache" },
  { key: "pelvic_pain", label: "Pelvic pain" },
  { key: "lower_back_pain", label: "Lower back pain" },
  { key: "breast_tenderness", label: "Breast tenderness" },
  { key: "acne", label: "Acne" },
  { key: "nausea", label: "Nausea" },
  { key: "dizziness", label: "Dizziness" },
];

const MOOD_OPTIONS: { key: Mood; label: string; icon: string }[] = [
  { key: "calm", label: "Calm", icon: "🌿" },
  { key: "happy", label: "Happy", icon: "✨" },
  { key: "anxious", label: "Anxious", icon: "💭" },
  { key: "irritable", label: "Irritable", icon: "⚡" },
  { key: "low", label: "Low", icon: "🌧️" },
  { key: "mood_swings", label: "Mood swings", icon: "🌀" },
];

const SEVERITY_LABEL: Record<number, string> = { 1: "Mild", 2: "Moderate", 3: "Severe" };

const SUGGESTION_CHIPS = [
  "kal se pet mein bohot dard hai aur flow heavy hai",
  "light spotting and mild backache",
];

interface CandidateEntry {
  date: string;
  flow: FlowLevel | null;
  painLevel: number | null;
  symptoms: Symptom[];
  moods: Mood[];
  notes: string;
}

export function LogView({
  selectedDate,
  existingEntry,
  cycleDay,
  onSave,
  onDelete,
  onDateChange,
  language = "en",
}: {
  selectedDate: string;
  existingEntry?: LogEntry;
  cycleDay?: number | null;
  onSave: (entryData: {
    date: string;
    flow: FlowLevel | null;
    painLevel: number | null;
    symptoms: Symptom[];
    symptomSeverities: Partial<Record<string, 1 | 2 | 3>>;
    moods: Mood[];
    sleepHours: number | null;
    notes: string;
  }) => Promise<void>;
  onDelete?: (date: string) => Promise<void>;
  onDateChange: (date: string) => void;
  language?: "en" | "hi";
}) {
  const [date, setDate] = useState(selectedDate || today());
  const [flow, setFlow] = useState<FlowLevel | null>(null);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<Partial<Record<string, 1 | 2 | 3>>>({});
  const [moods, setMoods] = useState<Mood[]>([]);
  const [sleep, setSleep] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // AI & Conversational state
  const [aiText, setAiText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [urgentAlert, setUrgentAlert] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<CandidateEntry | null>(null);
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (selectedDate) setDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (existingEntry) {
      setFlow(existingEntry.flow ?? null);
      setPainLevel(existingEntry.painLevel ?? null);
      const severities: Partial<Record<string, 1 | 2 | 3>> = existingEntry.symptomSeverities || {};
      if (existingEntry.symptoms) {
        existingEntry.symptoms.forEach((s) => {
          if (!severities[s]) severities[s] = 1;
        });
      }
      setSymptoms(severities);
      setMoods(existingEntry.moods || []);
      setSleep(existingEntry.sleepHours != null ? String(existingEntry.sleepHours) : "");
      setNotes(existingEntry.notes || "");
    } else {
      setFlow(null);
      setPainLevel(null);
      setSymptoms({});
      setMoods([]);
      setSleep("");
      setNotes("");
    }
  }, [existingEntry?.date, existingEntry?.updatedAt, date]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "hi" ? "hi-IN" : "en-US";
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setAiText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleSymptom = (k: string) => {
    setSymptoms((s) => {
      const n = { ...s };
      if (n[k]) {
        delete n[k];
      } else {
        n[k] = 1;
      }
      return n;
    });
  };

  const toggleMood = (m: Mood) => {
    setMoods((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  // Conversational text submission & NLP extraction
  const handleConversationalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = aiText.trim();
    if (!text) return;

    setUrgentAlert(null);
    setAiNotice(null);

    const lower = text.toLowerCase();

    // Check urgent clinical red flags (ALERT-01)
    const isUrgentHeavy =
      (lower.includes("soak") && (lower.includes("30") || lower.includes("hour") || lower.includes("pad"))) ||
      lower.includes("faint") ||
      lower.includes("behosh") ||
      (lower.includes("dizziness") && lower.includes("severe")) ||
      lower.includes("खून बहना बंद नहीं");

    if (isUrgentHeavy) {
      setUrgentAlert(
        language === "hi"
          ? "ACOG & NHS Clinical Red Flag: Har 30–60 minute mein pad soak hona aur chakkar aana urgent medical attention require karta hai. Kripya turant emergency care ya doctor se consult karein. Cyculus sirf journal hai, koi medical diagnosis nahi."
          : "ACOG & NHS Clinical Red Flag: Soaking through a pad or tampon every 30–60 minutes, accompanied by severe dizziness, requires prompt clinical or emergency evaluation. Cyculus is a non-diagnostic tracking journal."
      );
    }

    // Check offline fallback (OFFLINE-01)
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const symKeys = Object.keys(symptoms) as Symptom[];
      const combinedNotes = notes ? `${notes}\n${text}` : text;
      await onSave({
        date,
        flow,
        painLevel,
        symptoms: symKeys,
        symptomSeverities: symptoms,
        moods,
        sleepHours: sleep ? Number(sleep) : null,
        notes: combinedNotes,
      });
      setNotes(combinedNotes);
      setSuccessMsg(
        language === "hi"
          ? "Saved offline! Raw text saved into today's notes."
          : "Saved offline! Raw text saved into today's notes."
      );
      setAiNotice("Saved offline! Raw text saved into today's notes.");
      setAiText("");
      setTimeout(() => setSuccessMsg(null), 4000);
      return;
    }

    // Structured Candidate extraction (NLP-02)
    let candidateFlow: FlowLevel | null = flow;
    if (lower.includes("heavy") || lower.includes("flood") || lower.includes("भारी") || lower.includes("बहुत ज्यादा खून")) {
      candidateFlow = "heavy";
    } else if (lower.includes("medium") || lower.includes("moderate") || lower.includes("मीडियम")) {
      candidateFlow = "medium";
    } else if (lower.includes("spotting") || lower.includes("spots") || lower.includes("स्पॉटिंग") || lower.includes("धब्बे")) {
      candidateFlow = "spotting";
    } else if (lower.includes("light") || lower.includes("हल्का") || lower.includes("कम")) {
      candidateFlow = "light";
    }

    // Pain extraction
    let candidatePain: number | null = painLevel;
    const painNumMatch = lower.match(/(?:pain|dard|दर्द)\s*(?:is|level|hai|=)?\s*(\d{1,2})/);
    if (painNumMatch) {
      const parsedNum = parseInt(painNumMatch[1], 10);
      if (parsedNum >= 0 && parsedNum <= 10) candidatePain = parsedNum;
    } else if (lower.includes("bohot dard") || lower.includes("severe") || lower.includes("terrible") || lower.includes("असहनीय") || lower.includes("तेज दर्द")) {
      candidatePain = 8;
    } else if (lower.includes("mild") || lower.includes("thoda dard") || lower.includes("हल्का दर्द")) {
      candidatePain = 3;
    } else if (lower.includes("dard") || lower.includes("cramp") || lower.includes("pain") || lower.includes("दर्द")) {
      candidatePain = candidatePain ?? 6;
    }

    // Symptom extraction
    const extractedSymptoms = new Set<Symptom>(Object.keys(symptoms) as Symptom[]);
    if (lower.includes("cramp") || lower.includes("dard") || lower.includes("मरोड़") || lower.includes("pet mein")) {
      extractedSymptoms.add("cramps");
    }
    if (lower.includes("back") || lower.includes("कमर") || lower.includes("पीठ")) {
      extractedSymptoms.add("lower_back_pain");
    }
    if (lower.includes("pelvic") || lower.includes("pet ke nichle")) {
      extractedSymptoms.add("pelvic_pain");
    }
    if (lower.includes("bloat") || lower.includes("pet phool") || lower.includes("पेट फूल")) {
      extractedSymptoms.add("bloating");
    }
    if (lower.includes("headache") || lower.includes("migraine") || lower.includes("सिर दर्द") || lower.includes("सर दर्द")) {
      extractedSymptoms.add("headache");
    }
    if (lower.includes("fatigue") || lower.includes("tired") || lower.includes("exhaust") || lower.includes("थकान")) {
      extractedSymptoms.add("fatigue");
    }

    // Mood extraction
    const extractedMoods = new Set<Mood>(moods);
    if (lower.includes("irritable") || lower.includes("gussa") || lower.includes("चिड़चिड़ा")) {
      extractedMoods.add("irritable");
    }
    if (lower.includes("anxious") || lower.includes("ghabrahat") || lower.includes("घबराहट")) {
      extractedMoods.add("anxious");
    }
    if (lower.includes("low") || lower.includes("sad") || lower.includes("उदास")) {
      extractedMoods.add("low");
    }

    // Show Confirmation Card Modal (NLP-02)
    setCandidate({
      date,
      flow: candidateFlow,
      painLevel: candidatePain,
      symptoms: Array.from(extractedSymptoms),
      moods: Array.from(extractedMoods),
      notes: text,
    });
    setIsEditingCandidate(false);
  };

  // Confirm Card: Save approved values (NLP-03)
  const handleConfirmCandidateSave = async () => {
    if (!candidate) return;
    try {
      setIsSaving(true);
      const newSeverities: Partial<Record<string, 1 | 2 | 3>> = { ...symptoms };
      candidate.symptoms.forEach((s) => {
        if (!newSeverities[s]) newSeverities[s] = candidate.painLevel && candidate.painLevel >= 8 ? 3 : 2;
      });

      const combinedNotes = notes ? `${notes}\n${candidate.notes}` : candidate.notes;

      await onSave({
        date: candidate.date,
        flow: candidate.flow,
        painLevel: candidate.painLevel,
        symptoms: candidate.symptoms,
        symptomSeverities: newSeverities,
        moods: candidate.moods,
        sleepHours: sleep ? Number(sleep) : null,
        notes: combinedNotes,
      });

      // Update local tap states reactively
      setFlow(candidate.flow);
      setPainLevel(candidate.painLevel);
      setSymptoms(newSeverities);
      setMoods(candidate.moods);
      setNotes(combinedNotes);

      setCandidate(null);
      setAiText("");
      setSuccessMsg(language === "hi" ? "Daily check-in saved!" : "Daily check-in saved!");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err?.message || "Failed to save entry.");
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Card: Discard candidate (NLP-04)
  const handleDiscardCandidate = () => {
    setCandidate(null);
    setIsEditingCandidate(false);
  };

  // Daily Tap Save (TAP-01 to TAP-06)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sh = sleep === "" ? null : Number(sleep);
    if (sh != null && (sh < 0 || sh > 24)) {
      alert("Sleep should be between 0 and 24 hours.");
      return;
    }

    const symKeys = Object.keys(symptoms) as Symptom[];

    try {
      setIsSaving(true);
      await onSave({
        date,
        flow,
        painLevel,
        symptoms: symKeys,
        symptomSeverities: symptoms,
        moods,
        sleepHours: sh,
        notes: notes.trim(),
      });
      setSuccessMsg(
        existingEntry
          ? language === "hi"
            ? "Daily check-in saved!"
            : "Daily check-in saved!"
          : language === "hi"
          ? "Daily check-in saved!"
          : "Daily check-in saved!"
      );
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err?.message || "Failed to save check-in.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !existingEntry) return;
    try {
      await onDelete(existingEntry.date);
      setShowDeleteModal(false);
      setSuccessMsg(language === "hi" ? "Entry delete ho gayi" : "Entry deleted");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err?.message || "Failed to delete entry.");
    }
  };

  const isToday = date === today();
  const hasExistingForDate = Boolean(existingEntry && existingEntry.date === date);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <PageHeader
          eyebrow={language === "hi" ? "Daily Tap Check-in" : "Daily Tap Check-in"}
          title={language === "hi" ? "Aaj kaisa lag raha hai?" : "How are you, today?"}
          subtitle={
            language === "hi"
              ? "Jo feel ho raha hai bas wahi bharein — sab kuch optional hai."
              : "Fill in only what feels relevant — every field is optional."
          }
        />
        {hasExistingForDate && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lavender px-3.5 py-1.5 text-xs font-semibold text-primary border border-primary/20">
            <Check className="h-3.5 w-3.5" />
            <span>{isToday ? "✓ Logged for today" : `✓ Logged for ${format(parseISO(date), "d MMM")}`}</span>
          </span>
        )}
      </div>

      {/* Urgent Clinical Red Flag Alert Banner (ALERT-01) */}
      {urgentAlert && (
        <div className="mb-6 rounded-2xl border border-rose-deep/40 bg-rose-soft p-4 sm:p-5 text-foreground shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-deep" />
            <div className="text-sm">
              <span className="font-bold text-rose-deep block text-base mb-1">
                {language === "hi" ? "Clinical Urgent Advisory" : "Clinical Urgent Advisory"}
              </span>
              <p className="leading-relaxed text-rose-deep/90">{urgentAlert}</p>
            </div>
            <button
              onClick={() => setUrgentAlert(null)}
              className="p-1 rounded-full text-rose-deep hover:bg-rose-deep/10 ml-auto"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI Conversational Symptom Bar (Feature 3.2: NLP-01 to NLP-04) */}
      <div className="mb-6 card-soft p-5 bg-lavender/50 border border-primary/20">
        <div className="flex items-center gap-2 mb-2 text-primary font-medium text-sm">
          <Sparkles className="h-4 w-4" />
          <span>
            {language === "hi"
              ? "Smart Check-in: Apne shabdon mein likhein ya bolein"
              : "In your own words: Type or speak naturally"}
          </span>
        </div>

        {/* Suggestion Chips (NLP-01) */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            {language === "hi" ? "Quick chips:" : "Suggestions:"}
          </span>
          {SUGGESTION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAiText(chip)}
              className="rounded-full bg-card px-3 py-1 text-xs text-foreground border border-border hover:border-primary/50 hover:bg-lavender transition cursor-pointer"
            >
              "{chip}"
            </button>
          ))}
        </div>

        <form onSubmit={handleConversationalSubmit} className="flex gap-2">
          <input
            type="text"
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder={
              language === "hi"
                ? "Yahan likhein ya mic se bolein…"
                : "Type here or tap the mic to speak…"
            }
            className="flex-1 rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary text-foreground"
          />

          {recognitionRef.current && (
            <button
              type="button"
              onClick={toggleVoice}
              className={`rounded-xl px-3.5 flex items-center justify-center transition cursor-pointer ${
                isListening
                  ? "bg-rose-deep text-white animate-pulse"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
              title="Voice Speech Recognition"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          <button
            type="submit"
            disabled={!aiText.trim()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lift disabled:opacity-50 hover:brightness-110 cursor-pointer transition flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            <span>{language === "hi" ? "Send" : "Send"}</span>
          </button>
        </form>

        {aiNotice && (
          <p className="mt-2 text-xs text-primary font-medium animate-in fade-in">
            ✓ {aiNotice}
          </p>
        )}
      </div>

      {successMsg && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-lavender p-4 text-sm font-medium text-foreground flex items-center justify-between animate-in fade-in">
          <span>{successMsg}</span>
          <span className="text-xs text-muted-foreground">{format(parseISO(date), "EEEE, d MMMM")}</span>
        </div>
      )}

      {/* Main Check-In Form */}
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Flow Section (TAP-01, TAP-06) */}
          <Panel title={language === "hi" ? "Bleeding Flow" : "Flow"}>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Flow">
              {FLOWS.map((f) => {
                const isChecked = flow === f.key;
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    key={f.key}
                    onClick={() => setFlow(isChecked ? null : f.key)}
                    className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition ${
                      isChecked
                        ? "border-primary bg-primary text-primary-foreground font-medium shadow-sm"
                        : "border-input bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {flow === null
                ? language === "hi"
                  ? "Kuch log nahi kiya — agar unsure hon toh blank chhod dein."
                  : "Not recorded — leave blank if you're unsure."
                : language === "hi"
                ? "Clear karne ke liye dubara tap karein."
                : "Tap again to clear."}
            </p>
          </Panel>

          {/* Pain Scale (0-10) with Visual Threshold (TAP-03, TAP-06) */}
          <Panel title={language === "hi" ? "Pain Level (0–10)" : "Pain Scale (0–10)"}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {Array.from({ length: 11 }, (_, i) => i).map((num) => {
                  const isSelected = painLevel === num;
                  const isSevere = num >= 8;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPainLevel(isSelected ? null : num)}
                      className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? isSevere
                            ? "bg-rose-deep text-white shadow-soft ring-2 ring-rose-deep/30 scale-105"
                            : "bg-primary text-primary-foreground shadow-sm scale-105"
                          : isSevere
                          ? "border border-rose-deep/30 bg-card text-rose-deep hover:border-rose-deep"
                          : "border border-input bg-card text-foreground hover:border-primary/50"
                      }`}
                      title={`Pain ${num}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Clinical Anchor Legend */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                <span className={painLevel === 0 ? "font-bold text-foreground" : ""}>0: None</span>
                <span className={painLevel != null && painLevel >= 1 && painLevel <= 3 ? "font-bold text-foreground" : ""}>
                  1–3: Mild
                </span>
                <span className={painLevel != null && painLevel >= 4 && painLevel <= 7 ? "font-bold text-foreground" : ""}>
                  4–7: Moderate
                </span>
                <span className={painLevel != null && painLevel >= 8 ? "font-bold text-rose-deep" : "text-rose-deep/70"}>
                  8–10: Severe Dysmenorrhea
                </span>
              </div>
            </div>
          </Panel>

          {/* Symptoms Section (TAP-01, TAP-04, TAP-06) */}
          <Panel title={language === "hi" ? "Symptoms" : "Symptoms"}>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SYMPTOMS_LIST.map((s) => {
                const sev = symptoms[s.key];
                const isSelected = !!sev;

                return (
                  <div
                    key={s.key}
                    className={`rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-primary/40 bg-lavender/60"
                        : "border-input bg-card hover:border-primary/40"
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleSymptom(s.key)}
                      className="flex w-full cursor-pointer items-center justify-between text-left text-sm font-medium text-foreground"
                    >
                      <span>{s.label}</span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                    </button>

                    {isSelected && (
                      <div
                        className="mt-3 grid grid-cols-3 gap-1 pt-1 border-t border-border/40"
                        role="radiogroup"
                        aria-label={`${s.label} severity`}
                      >
                        {([1, 2, 3] as (1 | 2 | 3)[]).map((v) => (
                          <button
                            type="button"
                            role="radio"
                            aria-checked={sev === v}
                            key={v}
                            onClick={() =>
                              setSymptoms((prev) => ({ ...prev, [s.key]: v }))
                            }
                            className={`rounded-lg py-1.5 text-xs transition cursor-pointer font-medium ${
                              sev === v
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-card text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {SEVERITY_LABEL[v]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Mood Section (TAP-01, TAP-06) */}
          <Panel title={language === "hi" ? "Mood" : "Mood"}>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = moods.includes(m.key);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleMood(m.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-input hover:border-primary/50"
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {language === "hi"
                ? "Multiple moods select kar sakte hain. Dubara tap karne par deselect ho jayega."
                : "Select any that apply. Tap again to deselect."}
            </p>
          </Panel>

          {/* Notes Section */}
          <Panel title={language === "hi" ? "Notes (Apne shabdon mein)" : "In your own words"}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder={
                language === "hi"
                  ? "Aaj ke baare mein kuch bhi jo aap note karna chahein…"
                  : "Anything you'd like to remember about today…"
              }
              className="w-full resize-y rounded-xl border border-input bg-card p-4 font-display text-lg outline-none focus:border-primary text-foreground"
            />
          </Panel>
        </div>

        {/* Right Sticky Column */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
          <Panel>
            <label className="block">
              <span className="eyebrow">{language === "hi" ? "Date" : "Date"}</span>
              <input
                type="date"
                value={date}
                max={today()}
                onChange={(e) => {
                  setDate(e.target.value);
                  onDateChange(e.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary text-foreground font-sans"
              />
            </label>

            <p className="mt-2 text-xs text-muted-foreground">
              {cycleDay
                ? language === "hi"
                  ? `Cycle day ${cycleDay}, aapke recorded period start ke according.`
                  : `Cycle day ${cycleDay}, based on your recorded period starts.`
                : language === "hi"
                ? "Period start record hone ke baad cycle day dikhega."
                : "Cycle day will appear once a period start is recorded."}
            </p>

            <label className="mt-6 block">
              <span className="eyebrow">
                {language === "hi" ? "Sleep (optional)" : "Sleep (optional)"}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={24}
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  className="w-24 rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary text-foreground"
                  placeholder="7.5"
                />
                <span className="text-sm text-muted-foreground">
                  {language === "hi" ? "hours" : "hours"}
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-6 w-full cursor-pointer rounded-full bg-primary py-3.5 font-medium text-primary-foreground shadow-lift transition hover:brightness-110 disabled:opacity-60"
            >
              {isSaving
                ? language === "hi"
                  ? "Saving…"
                  : "Saving…"
                : isToday
                ? language === "hi"
                  ? "Save Today's Check-in"
                  : "Save Today's Check-in"
                : existingEntry
                ? language === "hi"
                  ? "Entry update karein"
                  : "Update entry"
                : language === "hi"
                  ? "Save check-in"
                  : "Save check-in"}
            </button>

            {existingEntry && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="h-4 w-4" />{" "}
                {language === "hi" ? "Yeh entry delete karein" : "Delete this entry"}
              </button>
            )}
          </Panel>
        </div>
      </form>

      {/* Confirmation Card Modal (NLP-02, NLP-03, NLP-04) */}
      {candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card p-6 sm:p-8 shadow-lift border border-border animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-5">
              <div>
                <span className="eyebrow text-primary">
                  {language === "hi" ? "Confirmation Card" : "Confirmation Card"}
                </span>
                <h3 className="font-display text-2xl text-foreground mt-0.5">
                  {language === "hi" ? "Entry Review" : "Confirm Log Entry"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingCandidate(!isEditingCandidate)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-lavender px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditingCandidate ? (language === "hi" ? "View" : "Review") : (language === "hi" ? "बदलें (Edit)" : "Edit")}</span>
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              {language === "hi"
                ? "Cyculus ne aapke text se yeh details organize ki hain. Confirm karein ya modify karein."
                : "Cyculus identified these details from your message. Review and confirm before saving."}
            </p>

            {/* Candidate Review / Edit Mode */}
            {isEditingCandidate ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Date</label>
                  <input
                    type="date"
                    max={today()}
                    value={candidate.date}
                    onChange={(e) => setCandidate({ ...candidate, date: e.target.value })}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Flow</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FLOWS.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() =>
                          setCandidate({
                            ...candidate,
                            flow: candidate.flow === f.key ? null : f.key,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          candidate.flow === f.key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-input bg-card text-foreground"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Pain Level (0-10): {candidate.painLevel ?? "Not set"}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setCandidate({
                            ...candidate,
                            painLevel: candidate.painLevel === num ? null : num,
                          })
                        }
                        className={`h-8 w-8 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          candidate.painLevel === num
                            ? num >= 8
                              ? "bg-rose-deep text-white"
                              : "bg-primary text-primary-foreground"
                            : "border border-input bg-card text-foreground"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Symptoms</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SYMPTOMS_LIST.map((s) => {
                      const hasS = candidate.symptoms.includes(s.key);
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => {
                            const newSyms = hasS
                              ? candidate.symptoms.filter((x) => x !== s.key)
                              : [...candidate.symptoms, s.key];
                            setCandidate({ ...candidate, symptoms: newSyms });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            hasS
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-input bg-card text-foreground"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-6 rounded-2xl bg-lavender/40 border border-primary/20 p-4 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground text-xs uppercase font-semibold">Date</span>
                  <span className="font-semibold text-foreground">
                    {format(parseISO(candidate.date), "EEEE, d MMMM yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground text-xs uppercase font-semibold">Flow</span>
                  <span className="font-semibold text-foreground capitalize">
                    {candidate.flow ? candidate.flow : "Not recorded"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground text-xs uppercase font-semibold">Pain</span>
                  <span
                    className={`font-semibold ${
                      candidate.painLevel && candidate.painLevel >= 8
                        ? "text-rose-deep font-bold"
                        : "text-foreground"
                    }`}
                  >
                    {candidate.painLevel != null
                      ? `${candidate.painLevel}/10 (${
                          candidate.painLevel >= 8
                            ? "Severe"
                            : candidate.painLevel >= 4
                            ? "Moderate"
                            : candidate.painLevel >= 1
                            ? "Mild"
                            : "None"
                        })`
                      : "Not recorded"}
                  </span>
                </div>

                <div className="pb-2 border-b border-border/40">
                  <span className="text-muted-foreground text-xs uppercase font-semibold block mb-1">
                    Symptoms
                  </span>
                  {candidate.symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {candidate.symptoms.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-full bg-card border border-primary/30 text-xs text-primary font-medium"
                        >
                          {SYMPTOMS_LIST.find((x) => x.key === s)?.label || s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">None identified</span>
                  )}
                </div>

                <div>
                  <span className="text-muted-foreground text-xs uppercase font-semibold block mb-1">
                    Raw Note
                  </span>
                  <p className="text-xs italic text-foreground bg-card/60 p-2.5 rounded-xl border border-border">
                    "{candidate.notes}"
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleDiscardCandidate}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                {language === "hi" ? "Discard (रद्द करें)" : "Discard"}
              </button>
              <button
                type="button"
                onClick={handleConfirmCandidateSave}
                disabled={isSaving}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lift hover:brightness-110 transition cursor-pointer disabled:opacity-60"
              >
                {isSaving
                  ? language === "hi"
                    ? "Saving…"
                    : "Saving…"
                  : language === "hi"
                  ? "Confirm & Save Log"
                  : "Confirm & Save Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lift border border-border animate-in fade-in zoom-in-95">
            <h3 className="font-display text-2xl text-foreground">
              {language === "hi" ? "Kya yeh entry delete karni hai?" : "Delete this entry?"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {format(parseISO(date), "d MMMM yyyy")}{" "}
              {language === "hi"
                ? "ka record device se permanently delete ho jayega."
                : "record will be permanently removed from your device."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full px-5 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {language === "hi" ? "Cancel" : "Keep it"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full bg-destructive px-5 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer shadow-sm"
              >
                {language === "hi" ? "Delete karein" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
