import React, { useState, useEffect, useRef } from 'react';
import { FlowLevel, Symptom, Mood, FLOW_LEVELS, SYMPTOMS, MOODS, DayPatch, LogEntry } from '@/shared/types';
import { FLOW_LABELS, SYMPTOM_LABELS, MOOD_LABELS } from '@/shared/translations';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Chip } from '@/app/components/Chip';
import { ConfirmCard } from './ConfirmCard';
import { UrgentBanner } from './UrgentBanner';
import { Mic, MicOff, Send, CheckCircle2 } from 'lucide-react';

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

  // Update tap logger state if existingEntry changes
  useEffect(() => {
    if (existingEntry) {
      setSelectedFlow(existingEntry.flow);
      setPainLevel(existingEntry.painLevel);
      setSelectedSymptoms(existingEntry.symptoms || []);
      setSelectedMoods(existingEntry.moods || []);
      setNotes(existingEntry.notes || '');
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
      // Offline fallback: save raw text into today's log notes directly
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
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: naturalText,
          today: todayDate,
          locale: language === 'hi' ? 'hi' : 'hinglish'
        })
      });

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
      console.warn('API extraction unavailable, using client-side deterministic fallback:', err);
      // Client-side rule fallback so the user is NEVER blocked
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
          ? 'ऑफ़लाइन नियमों द्वारा समझा गया। पुष्टि करें।'
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
        language === 'hi' ? 'लॉग सफलतापूर्वक सहेज लिया गया!' : 'Log saved successfully!'
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
          language === 'hi' ? 'आज का चेक-इन सहेज लिया गया!' : 'Daily check-in saved!'
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
      {/* Title & Playful Subtitle */}
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-bold text-ink tracking-tight">OofLog</h2>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary-soft/60 px-2.5 py-0.5 rounded-full">
            {language === 'hi' ? 'लक्षण डायरी' : 'Symptom Diary'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          {language === 'hi'
            ? 'अपनी भाषा में बोलें या लिखें — आपका डेटा आपके फ़ोन पर ही रहता है।'
            : 'Describe your day in your own words, or tap quick chips. Stored on-device.'}
        </p>
      </div>

      {/* Urgent Clinical Banner if triggered */}
      {urgentRedFlags.length > 0 && (
        <UrgentBanner
          flagIds={urgentRedFlags}
          language={language}
          onDismiss={() => setUrgentRedFlags([])}
        />
      )}

      {/* 1. Conversational Input Box */}
      <Card variant="default" padding="lg" className="border-primary/20 shadow-soft">
        <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
          {language === 'hi'
            ? 'आज कैसा लग रहा है? अपने शब्दों में बताएं:'
            : 'Tell me about today, in your own words:'}
        </label>

        <div className="relative">
          <textarea
            value={naturalText}
            onChange={e => setNaturalText(e.target.value)}
            rows={3}
            placeholder={
              language === 'hi'
                ? 'उदा. "कल से पेट में बहुत दर्द है और flow heavy है..."'
                : 'e.g. "Cramps started yesterday, flow feels heavy and feeling fatigued..."'
            }
            className="w-full text-sm sm:text-base p-3.5 pr-20 rounded-2xl border border-surface-border bg-surface-subtle focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all placeholder:text-ink-light"
          />

          <div className="absolute right-2.5 bottom-3.5 flex items-center gap-1.5">
            {hasSpeechSupport && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md'
                    : 'bg-primary-soft text-primary hover:bg-primary/20'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || !naturalText.trim()}
              className="p-2 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm cursor-pointer"
              aria-label="Extract entry"
            >
              {isExtracting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Quick sample chips for one-tap try */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-ink-muted">
          <span className="shrink-0 font-medium text-primary">
            {language === 'hi' ? 'सुझाव:' : 'Try:'}
          </span>
          <button
            type="button"
            onClick={() => setNaturalText('kal se pet mein bohot dard hai aur flow heavy hai')}
            className="shrink-0 px-2.5 py-1 bg-surface-subtle hover:bg-primary-soft/50 rounded-lg border border-surface-border text-ink cursor-pointer"
          >
            "kal se pet mein bohot dard hai..."
          </button>
          <button
            type="button"
            onClick={() => setNaturalText('light spotting and mild backache')}
            className="shrink-0 px-2.5 py-1 bg-surface-subtle hover:bg-primary-soft/50 rounded-lg border border-surface-border text-ink cursor-pointer"
          >
            "light spotting and mild backache"
          </button>
        </div>
      </Card>

      {/* Confirm Card Modal/Section */}
      {extractedPatches && (
        <ConfirmCard
          initialPatches={extractedPatches}
          originalText={naturalText}
          confidence={extractionConfidence}
          warnings={extractionWarnings}
          language={language}
          onConfirm={handleConfirmPatches}
          onCancel={() => setExtractedPatches(null)}
        />
      )}

      {/* 2. Direct Tap Check-In (Always 100% Offline) */}
      <Card variant="default" padding="lg" className="space-y-6 border-surface-border">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-semibold text-ink flex items-center gap-2">
            <span>{language === 'hi' ? 'दैनिक चेक-इन' : 'Daily Tap Check-in'}</span>
            <span className="text-xs font-normal text-ink-muted">({todayDate})</span>
          </h3>
          <div className="flex items-center gap-1.5">
            {existingEntry && (
              <span className="text-[11px] font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full border border-primary/20">
                {language === 'hi' ? '✓ आज दर्ज है' : '✓ Logged for today'}
              </span>
            )}
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {language === 'hi' ? 'ऑफ़लाइन' : 'Offline ready'}
            </span>
          </div>
        </div>

        {/* Flow Selection */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            {language === 'hi' ? '1. रक्तस्राव का स्तर (Flow)' : '1. Bleeding Flow'}
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {FLOW_LEVELS.map(fl => {
              const meta = FLOW_LABELS[fl];
              const isSelected = selectedFlow === fl;
              return (
                <button
                  key={fl}
                  type="button"
                  onClick={() => setSelectedFlow(isSelected ? null : fl)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-150 min-h-[58px] cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-soft shadow-primary/20 font-semibold'
                      : 'bg-surface-subtle text-ink border-surface-border hover:bg-white'
                  }`}
                >
                  <span className="text-base sm:text-lg mb-0.5">{meta.icon}</span>
                  <span className="text-[11px] sm:text-xs leading-none">{meta[language]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pain Level 0-10 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {language === 'hi' ? '2. दर्द का पैमाना (0–10)' : '2. Pain Level (0–10)'}
            </label>
            <span className="text-xs font-bold text-primary">
              {painLevel !== null ? `${painLevel}/10` : language === 'hi' ? 'शून्य / दर्ज नहीं' : 'None / Not set'}
            </span>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setPainLevel(painLevel === val ? null : val)}
                className={`flex-1 min-w-[30px] h-11 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  painLevel === val
                    ? val >= 8
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-primary text-white shadow-soft'
                    : 'bg-surface-subtle text-ink-muted hover:bg-white border border-surface-border'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms Chips */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            {language === 'hi' ? '3. शारीरिक लक्षण (Symptoms)' : '3. Symptoms Experienced'}
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

        {/* Mood Chips */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            {language === 'hi' ? '4. मन की स्थिति (Mood)' : '4. Mood'}
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

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
            {language === 'hi' ? '5. व्यक्तिगत नोट्स (वैकल्पिक)' : '5. Personal Notes (Optional)'}
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={language === 'hi' ? 'दवा, व्यायाम, नींद आदि...' : 'Medication, sleep, exercise, etc.'}
            className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-surface-border bg-surface-subtle focus:bg-white focus:ring-2 focus:ring-primary/30 focus:outline-none"
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
          {language === 'hi' ? 'आज का चेक-इन सुरक्षित करें' : 'Save Today’s Check-in'}
        </Button>
      </Card>
    </div>
  );
};
