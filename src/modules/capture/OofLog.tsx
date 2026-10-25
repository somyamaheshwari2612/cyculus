import React, { useState, useEffect, useRef } from 'react';
import { FlowLevel, Symptom, Mood, FLOW_LEVELS, SYMPTOMS, MOODS, DayPatch, LogEntry } from '@/shared/types';
import { FLOW_LABELS, SYMPTOM_LABELS, MOOD_LABELS } from '@/shared/translations';
import { Card, Button, Chip } from '@/app/components';
import { ConfirmCard } from './ConfirmCard';
import { UrgentBanner } from './UrgentBanner';
import { Mic, MicOff, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface OofLogProps {
  todayDate: string;
  existingEntry?: LogEntry;
  language: 'en' | 'hi';
  onSavePatch: (patch: DayPatch, source: 'tap' | 'text' | 'voice', rawText?: string) => Promise<LogEntry>;
  onSuccessToast?: (msg: string) => void;
}

export const OofLog: React.FC<OofLogProps> = ({
  todayDate,
  existingEntry,
  language,
  onSavePatch,
  onSuccessToast
}) => {
  // Conversational text state
  const [naturalText, setNaturalText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedPatches, setExtractedPatches] = useState<DayPatch[] | null>(null);
  const [extractionConfidence, setExtractionConfidence] = useState<number>(0.9);
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [urgentRedFlags, setUrgentRedFlags] = useState<string[]>([]);

  // Direct Tap Logger state
  const [selectedFlow, setSelectedFlow] = useState<FlowLevel | null>(existingEntry?.flow ?? null);
  const [painLevel, setPainLevel] = useState<number | null>(existingEntry?.painLevel ?? null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>(existingEntry?.symptoms ?? []);
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>(existingEntry?.moods ?? []);
  const [notes, setNotes] = useState<string>(existingEntry?.notes ?? '');
  const [isSavingTap, setIsSavingTap] = useState<boolean>(false);

  // Voice speech recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const confirmCardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll confirm card into view after extraction (P0-2)
  useEffect(() => {
    if (extractedPatches && extractedPatches.length > 0) {
      const timer = setTimeout(() => {
        confirmCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [extractedPatches]);

  // Update tap logger state if existingEntry changes or is cleared
  useEffect(() => {
    if (existingEntry) {
      setSelectedFlow(existingEntry.flow);
      setPainLevel(existingEntry.painLevel);
      setSelectedSymptoms(existingEntry.symptoms || []);
      setSelectedMoods(existingEntry.moods || []);
      setNotes(existingEntry.notes || '');
    } else {
      setSelectedFlow(null);
      setPainLevel(null);
      setSelectedSymptoms([]);
      setSelectedMoods([]);
      setNotes('');
    }
  }, [existingEntry]);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNaturalText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition start failed', err);
      }
    }
  };

  // Submit natural language for extraction
  const handleExtract = async () => {
    if (!naturalText.trim()) return;

    setIsExtracting(true);
    setUrgentRedFlags([]);

    // Check offline state
    if (!navigator.onLine) {
      const patch: DayPatch = {
        date: todayDate,
        notes: naturalText.trim()
      };
      await onSavePatch(patch, 'text', naturalText.trim());
      setIsExtracting(false);
      setNaturalText('');
      if (onSuccessToast) {
        onSuccessToast(
          language === 'hi'
            ? 'ऑफ़लाइन सहेजा गया। इंटरनेट आने पर व्याख्या की जाएगी।'
            : 'Saved offline! Raw text saved into today’s notes.'
        );
      }
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      let response: Response;
      try {
        response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: naturalText,
            today: todayDate,
            locale: language === 'hi' ? 'hi' : 'hinglish'
          })
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new Error(`Extraction HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.ok && data.patches && data.patches.length > 0) {
        setExtractedPatches(data.patches);
        setExtractionConfidence(data.confidence || 0.9);
        setExtractionWarnings(data.warnings || []);
        if (data.redFlags && data.redFlags.length > 0) {
          setUrgentRedFlags(data.redFlags);
        }
      } else {
        throw new Error('Extraction returned no patches');
      }
    } catch (err) {
      console.warn('API extraction unavailable or timed out, using on-device deterministic fallback:', err);
      const isHeavy = /heavy|zyada|bohot flow|bahut/i.test(naturalText);
      const isSpotting = /spotting/i.test(naturalText);
      const hasCramps = /pet dard|cramps|ainthan/i.test(naturalText);
      const hasBackPain = /kamar dard|back pain/i.test(naturalText);
      const isSeverePain = /bohot dard|severe|asahay/i.test(naturalText);

      const fallbackPatch: DayPatch = {
        date: todayDate,
        flow: isHeavy ? 'heavy' : isSpotting ? 'spotting' : null,
        painLevel: isSeverePain ? 8 : hasCramps ? 5 : null,
        symptoms: [
          ...(hasCramps ? ['cramps' as Symptom] : []),
          ...(hasBackPain ? ['lower_back_pain' as Symptom] : [])
        ],
        moods: /mood off|low|udaas/i.test(naturalText) ? ['low'] : [],
        notes: naturalText.trim()
      };

      setExtractedPatches([fallbackPatch]);
      setExtractionConfidence(0.8);
      setExtractionWarnings([
        language === 'hi'
          ? 'ऑफ़लाइन समझ लिया है। नीचे देखकर चेक कर लीजिए।'
          : 'Understood via local rules. Please verify below.'
      ]);
    } finally {
      setIsExtracting(false);
    }
  };

  // Confirm extracted data
  const handleConfirmPatches = async (patches: DayPatch[]) => {
    for (const patch of patches) {
      await onSavePatch(patch, 'text', naturalText.trim());
    }
    setExtractedPatches(null);
    setNaturalText('');
    if (onSuccessToast) {
      onSuccessToast(
        language === 'hi' ? 'आज का लॉग सेव हो गया!' : 'Log saved successfully!'
      );
    }
  };

  // Direct Tap Save
  const handleSaveTap = async () => {
    setIsSavingTap(true);
    try {
      const patch: DayPatch = {
        date: todayDate,
        flow: selectedFlow,
        painLevel: painLevel,
        symptoms: selectedSymptoms,
        moods: selectedMoods,
        notes: notes.trim()
      };
      await onSavePatch(patch, 'tap');
      if (onSuccessToast) {
        onSuccessToast(
          language === 'hi' ? 'आज का चेक-इन सेव हो गया!' : 'Daily check-in saved!'
        );
      }
    } finally {
      setIsSavingTap(false);
    }
  };

  const toggleSymptom = (s: Symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const toggleMood = (m: Mood) => {
    setSelectedMoods(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Urgent Clinical Banner if triggered */}
      {urgentRedFlags.length > 0 && (
        <UrgentBanner
          flagIds={urgentRedFlags}
          language={language}
          onDismiss={() => setUrgentRedFlags([])}
        />
      )}

      {/* Header with Brand & Plain Subtitle */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">OofLog</h2>
            <span className="text-[11px] font-bold text-primary bg-tint-lavender px-3 py-1 rounded-full border border-[#E7DCF8]">
              {language === 'hi' ? 'आज कैसा रहा' : 'aaj kaisa raha'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
            {language === 'hi'
              ? '1-टैप में या बोलकर आज के लक्षण, फ्लो और मूड दर्ज करें'
              : 'Log today’s flow, symptoms, pain, and mood in 1-tap or your own voice'}
          </p>
        </div>
      </div>

      {/* Responsive Grid: Single column on mobile, Dual-column on desktop (lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Conversational NLP & Voice Card (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          <Card variant="default" padding="lg" className="border-surface-border shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-tint-peach flex items-center justify-center text-xs">
              ✨
            </div>
            <label className="text-xs sm:text-sm font-semibold text-ink">
              {language === 'hi'
                ? 'आज कैसा रहा? अपनी भाषा में लिख दीजिए'
                : 'Tell me about today, in your own words:'}
            </label>
          </div>
          {!hasSpeechSupport && (
            <span className="text-[10px] text-ink-muted bg-tint-lavender/50 px-2 py-0.5 rounded-full border border-[#E7DCF8]">
              {language === 'hi' ? 'माइक Chrome/Edge में' : 'Voice: Chrome & Edge'}
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            value={naturalText}
            onChange={e => setNaturalText(e.target.value)}
            rows={3}
            placeholder={
              language === 'hi'
                ? 'जैसे: "कल से पेट में बहुत दर्द है और flow heavy है..."'
                : 'e.g. "Cramps started yesterday, flow is heavy and feeling low..."'
            }
            className="w-full text-sm sm:text-base p-4 pr-24 rounded-2xl border border-surface-border bg-[#FDFBFD] focus:bg-white focus:ring-2 focus:ring-primary/25 focus:border-primary/40 focus:outline-none transition-all placeholder:text-ink-light leading-relaxed"
          />

          <div className="absolute right-3 bottom-3.5 flex items-center gap-2">
            {hasSpeechSupport && (
              <button
                type="button"
                onClick={toggleListening}
                className={`w-10 h-10 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-pill ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md'
                    : 'bg-tint-lavender text-primary hover:bg-[#E5DAF7]'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || !naturalText.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-soft cursor-pointer"
              aria-label="Extract entry"
            >
              {isExtracting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Quick sample chips */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="shrink-0 text-ink-muted font-medium text-[11px]">
            {language === 'hi' ? 'सुझाव:' : 'Try:'}
          </span>
          <button
            type="button"
            onClick={() => setNaturalText('kal se pet mein bohot dard hai aur flow heavy hai')}
            className="shrink-0 min-h-[44px] inline-flex items-center px-4 py-2 bg-tint-lavender/60 hover:bg-tint-lavender rounded-full text-primary text-xs font-medium border border-[#E7DCF8] transition-all cursor-pointer shadow-pill"
          >
            "kal se pet mein bohot dard hai..."
          </button>
          <button
            type="button"
            onClick={() => setNaturalText('light spotting and mild backache')}
            className="shrink-0 min-h-[44px] inline-flex items-center px-4 py-2 bg-tint-rose/60 hover:bg-tint-rose rounded-full text-tint-roseText text-xs font-medium border border-[#F8D7E0] transition-all cursor-pointer shadow-pill"
          >
            "light spotting and mild backache"
          </button>
        </div>
      </Card>

      {/* Confirm Card Modal/Section (P0-2 auto-scrolls into view) */}
      {extractedPatches && (
        <div ref={confirmCardRef} className="scroll-mt-6">
          <ConfirmCard
            initialPatches={extractedPatches}
            originalText={naturalText}
            confidence={extractionConfidence}
            warnings={extractionWarnings}
            language={language}
            onConfirm={handleConfirmPatches}
            onCancel={() => setExtractedPatches(null)}
          />
        </div>
      )}

      {/* Quick Tip / Manifesto Card (Screen 2 collage) */}
          <div className="hidden lg:block bg-tint-peach/30 rounded-3xl p-5 border border-[#FADCD0] text-xs text-amber-950 space-y-1.5 shadow-soft">
            <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <span>💡</span>
              <span>{language === 'hi' ? 'हिंग्लिश समझता है' : 'Natural Hinglish Ready'}</span>
            </h4>
            <p className="leading-relaxed text-[11px] text-amber-900">
              {language === 'hi'
                ? 'आप "dard bohot hai", "spotting hui thi", "pet phoola lag raha hai" लिख या बोल सकते हैं। साइकुलस इसे समझ कर सटीक टैग्स में बदलता है।'
                : 'Cyculus parses colloquial Hinglish and English symptoms securely without storing your private text.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Direct Tap Check-In (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 2. Direct Tap Check-In (Always 100% Offline) */}
          <Card variant="default" padding="lg" className="space-y-6 border-surface-border shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-surface-border">
          <div>
            <h3 className="text-base font-serif font-bold text-ink">
              {language === 'hi' ? 'दैनिक चेक-इन' : 'Daily Tap Check-in'}
            </h3>
            <p className="text-[11px] text-ink-muted">
              {todayDate} · {language === 'hi' ? 'फास्ट टैग्स' : 'Instant 1-tap logging'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {existingEntry && (
              <span className="text-[11px] font-semibold text-primary bg-tint-lavender px-3 py-1 rounded-full border border-[#E7DCF8] shadow-pill">
                {language === 'hi' ? '✓ आज सेव है' : '✓ Logged today'}
              </span>
            )}
            <span className="text-[11px] font-medium text-emerald-800 bg-tint-mint px-3 py-1 rounded-full border border-[#D4F2E3] shadow-pill">
              {language === 'hi' ? 'ऑफ़लाइन' : 'Offline ready'}
            </span>
          </div>
        </div>

        {/* 1. Flow Selection with Pastel Icon Circles */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {language === 'hi' ? '1. पीरियड फ्लो (Bleeding Flow)' : '1. Bleeding Flow'}
            </label>
            <span className="text-[11px] text-ink-muted">
              {language === 'hi'
                ? 'पीरियड नहीं है तो "नहीं" चुनें या खाली छोड़ें'
                : 'Leave unselected if not bleeding today'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {FLOW_LEVELS.map(fl => {
              const meta = FLOW_LABELS[fl];
              const isSelected = selectedFlow === fl;
              return (
                <button
                  key={fl}
                  type="button"
                  onClick={() => setSelectedFlow(isSelected ? null : fl)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-200 min-h-[64px] cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-soft'
                      : 'bg-white text-ink border-surface-border hover:border-primary-soft hover:bg-[#FAF6FE] shadow-pill'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-base mb-1 ${
                    isSelected ? 'bg-white/20' : 'bg-surface-bg'
                  }`}>
                    {meta.icon}
                  </span>
                  <span className="text-[11px] font-medium leading-none">{meta[language]}</span>
                </button>
              );
            })}
          </div>

          {/* Zero-log helper card (P1-7) */}
          <div className="mt-2.5 bg-tint-lavender/40 border border-[#E7DCF8] rounded-2xl p-2.5 flex items-center gap-2 text-xs text-ink-muted">
            <span className="text-sm shrink-0">💡</span>
            <p className="text-[11px] leading-snug">
              {language === 'hi'
                ? 'आज पीरियड नहीं है? आप फिर भी नीचे मूड, क्रैम्प्स या दर्द दर्ज कर सकती हैं।'
                : 'Not bleeding today? You can still log cramps, mood, or other symptoms below.'}
            </p>
          </div>
        </div>

        {/* 2. Pain Level 0-10 */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {language === 'hi' ? '2. दर्द कैसा है? (0–10)' : '2. Pain Level (0–10)'}
            </label>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              painLevel && painLevel >= 8
                ? 'bg-red-100 text-red-700'
                : painLevel
                ? 'bg-tint-lavender text-primary'
                : 'text-ink-muted'
            }`}>
              {painLevel !== null ? `${painLevel}/10` : language === 'hi' ? 'बिल्कुल नहीं' : 'None'}
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setPainLevel(painLevel === val ? null : val)}
                className={`flex-1 min-w-[32px] h-11 rounded-2xl text-xs font-bold transition-all min-h-[44px] cursor-pointer shadow-pill ${
                  painLevel === val
                    ? val >= 8
                      ? 'bg-red-600 text-white shadow-soft scale-105'
                      : 'bg-primary text-white shadow-soft scale-105'
                    : 'bg-white text-ink-muted hover:text-ink hover:bg-[#FAF6FE] border border-surface-border'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          {/* Clinical Pain Anchors (P1-10) */}
          <div className="grid grid-cols-4 text-[10px] text-ink-muted pt-2 px-1">
            <div className="text-left">
              <span className="font-bold text-ink block">0: {language === 'hi' ? 'कोई नहीं' : 'None'}</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-ink block">3: {language === 'hi' ? 'हल्का' : 'Mild'}</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-amber-800 block">7: {language === 'hi' ? 'तेज़ दर्द' : 'Severe'}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-rose-800 block">10: {language === 'hi' ? 'असहनीय' : 'Incapacitating'}</span>
            </div>
          </div>
        </div>

        {/* 3. Symptoms Chips */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2.5">
            {language === 'hi' ? '3. लक्षण (Symptoms)' : '3. Symptoms Experienced'}
          </label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map(sym => {
              const meta = SYMPTOM_LABELS[sym];
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <Chip
                  key={sym}
                  label={`${meta.emoji} ${meta[language]}`}
                  selected={isSelected}
                  onClick={() => toggleSymptom(sym)}
                />
              );
            })}
          </div>
        </div>

        {/* 4. Mood Chips */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2.5">
            {language === 'hi' ? '4. मूड (Mood)' : '4. Mood'}
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(m => {
              const meta = MOOD_LABELS[m];
              const isSelected = selectedMoods.includes(m);
              return (
                <Chip
                  key={m}
                  label={`${meta.emoji} ${meta[language]}`}
                  selected={isSelected}
                  onClick={() => toggleMood(m)}
                />
              );
            })}
          </div>
        </div>

        {/* 5. Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
            {language === 'hi' ? '5. कुछ और लिखना चाहें तो (ऑप्शनल)' : '5. Personal Notes (Optional)'}
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={language === 'hi' ? 'दवा, वॉक, कैसा लगा वगैरह...' : 'Medication, sleep, exercise, etc.'}
            className="w-full text-xs sm:text-sm p-3.5 rounded-full border border-surface-border bg-white focus:ring-2 focus:ring-primary/25 focus:border-primary/40 focus:outline-none shadow-pill"
          />
        </div>

        {/* Save Tap Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSavingTap}
          icon={<CheckCircle2 className="w-5 h-5" />}
          onClick={handleSaveTap}
        >
          {language === 'hi' ? 'आज का लॉग सेव करें' : 'Save Today’s Check-in'}
        </Button>
      </Card>
        </div>
      </div>
    </div>
  );
};
