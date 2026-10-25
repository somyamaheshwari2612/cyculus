import React, { useState } from 'react';
import { DayPatch, FlowLevel, Symptom, Mood, FLOW_LEVELS, SYMPTOMS, MOODS } from '@/shared/types';
import { FLOW_LABELS, SYMPTOM_LABELS, MOOD_LABELS } from '@/shared/translations';
import { Card, Button, Chip } from '@/app/components';
import { Check, Calendar, Sparkles, AlertCircle, ShieldCheck, X } from 'lucide-react';

export interface ConfirmCardProps {
  initialPatches: DayPatch[];
  originalText?: string;
  confidence?: number;
  warnings?: string[];
  language?: 'en' | 'hi';
  onConfirm: (patches: DayPatch[]) => void;
  onCancel: () => void;
}

export const ConfirmCard: React.FC<ConfirmCardProps> = ({
  initialPatches,
  originalText,
  confidence = 0.9,
  warnings = [],
  language = 'en',
  onConfirm,
  onCancel
}) => {
  const [patches, setPatches] = useState<DayPatch[]>(initialPatches);

  const updatePatch = (index: number, updater: (prev: DayPatch) => DayPatch) => {
    setPatches(prev => prev.map((p, i) => (i === index ? updater(p) : p)));
  };

  const toggleSymptom = (patchIdx: number, symptom: Symptom) => {
    updatePatch(patchIdx, p => {
      const current = p.symptoms || [];
      const next = current.includes(symptom)
        ? current.filter(s => s !== symptom)
        : [...current, symptom];
      return { ...p, symptoms: next };
    });
  };

  const toggleMood = (patchIdx: number, mood: Mood) => {
    updatePatch(patchIdx, p => {
      const current = p.moods || [];
      const next = current.includes(mood)
        ? current.filter(m => m !== mood)
        : [...current, mood];
      return { ...p, moods: next };
    });
  };

  const setFlow = (patchIdx: number, flow: FlowLevel) => {
    updatePatch(patchIdx, p => ({
      ...p,
      flow: p.flow === flow ? null : flow
    }));
  };

  const setPain = (patchIdx: number, pain: number) => {
    updatePatch(patchIdx, p => ({
      ...p,
      painLevel: p.painLevel === pain ? null : pain
    }));
  };

  return (
    <Card
      variant="lavender"
      padding="lg"
      className="border-2 border-primary/30 bg-gradient-to-b from-[#FAF6FE] to-[#F5EEFD] shadow-float mb-6 animate-scale-up ring-4 ring-primary/5"
    >
      {/* Header with exact copy & dismiss button */}
      <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#E7DCF8]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-soft shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? '100% आपके फ़ोन में' : 'On-Device Interpretation'}</span>
            </div>
            <h3 className="font-serif font-bold text-ink text-lg sm:text-xl leading-tight">
              {language === 'hi' ? 'मैंने यह समझा।' : 'This is what I understood.'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-medium mt-0.5">
              {language === 'hi'
                ? 'अगर कुछ ठीक करना हो तो बदल लीजिए, फिर सेव करें।'
                : 'Change anything that’s wrong, then save.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label={language === 'hi' ? 'रद्द करें' : 'Discard'}
          className="p-1.5 text-ink-muted hover:text-ink hover:bg-white/80 rounded-full transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Trust Story Reassurance Banner */}
      <div className="mt-3.5 p-3.5 rounded-2xl bg-white/90 border border-[#E7DCF8] shadow-sm flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-ink flex items-center gap-1.5">
            <span>{language === 'hi' ? '🔒 100% ऑन-डिवाइस · पूर्ण गोपनीयता' : '🔒 100% On-Device · Complete Privacy'}</span>
          </div>
          <p className="text-ink-muted leading-relaxed text-[11px] sm:text-xs">
            {language === 'hi'
              ? 'यह समझ केवल आपका समय बचाने के लिए आपके फोन पर ही निकाली गई है। जब तक आप नीचे "सहेजें" नहीं दबातीं, यह आपकी स्थायी डायरी में दर्ज नहीं होता।'
              : 'This extraction ran 100% locally on your phone to save you typing. Nothing is committed to your medical history until you click Save.'}
          </p>
        </div>
      </div>

      {/* Original voice or text transcript */}
      {originalText && (
        <div className="mt-3 px-3.5 py-2 bg-white/70 rounded-2xl border border-surface-border text-xs text-ink-muted italic flex items-center gap-2 shadow-pill">
          <span className="text-[11px] font-semibold text-primary not-italic shrink-0">
            {language === 'hi' ? 'आपने कहा:' : 'You said:'}
          </span>
          <span className="truncate">"{originalText}"</span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{warnings.join(' ')}</span>
        </div>
      )}

      {/* Patches List - Directly Editable in Place */}
      <div className="mt-4 space-y-4">
        {patches.map((patch, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-4 sm:p-5 border border-surface-border space-y-4 shadow-card">
            {/* Date line with direct date selector */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-surface-border">
              <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{language === 'hi' ? 'तारीख:' : 'Date:'}</span>
                <input
                  type="date"
                  value={patch.date}
                  onChange={e => updatePatch(idx, p => ({ ...p, date: e.target.value }))}
                  className="border border-surface-border rounded-xl px-2.5 py-1 text-xs text-ink font-semibold bg-surface-subtle focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-sm"
                />
              </label>
              <div className="flex items-center gap-2">
                {patches.length > 1 && (
                  <span className="text-[11px] font-semibold text-primary bg-primary-soft/60 px-2.5 py-0.5 rounded-full">
                    Day {idx + 1} of {patches.length}
                  </span>
                )}
                <span className="text-[11px] font-medium text-ink-muted bg-surface-subtle px-2.5 py-0.5 rounded-full border border-surface-border">
                  {Math.round(confidence * 100)}% {language === 'hi' ? 'सटीकता' : 'match'}
                </span>
              </div>
            </div>

            {/* Flow selection - 1-tap toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  {language === 'hi' ? 'पीरियड फ्लो (Bleeding Flow)' : 'Bleeding Flow'}
                </label>
                <span className="text-[11px] font-medium text-ink-muted">
                  {patch.flow ? FLOW_LABELS[patch.flow][language] : (language === 'hi' ? 'कोई नहीं' : 'None / Not recorded')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {FLOW_LEVELS.map(fl => {
                  const meta = FLOW_LABELS[fl];
                  const selected = patch.flow === fl;
                  return (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setFlow(idx, fl)}
                      className={`px-3 py-2 rounded-2xl text-xs font-semibold border min-h-[42px] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                        selected
                          ? 'bg-ink text-white border-ink shadow-soft ring-2 ring-ink/20 font-bold'
                          : 'bg-white text-ink-muted border-surface-border hover:bg-surface-subtle hover:text-ink shadow-pill'
                      }`}
                    >
                      <span className="text-base">{meta.icon}</span>
                      <span>{meta[language]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pain rating - 0-10 buttons */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-2">
                <span className="uppercase tracking-wider">
                  {language === 'hi' ? 'दर्द का स्तर (0–10)' : 'Pain Rating (0–10)'}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  typeof patch.painLevel === 'number' && patch.painLevel >= 8
                    ? 'bg-red-100 text-red-700'
                    : typeof patch.painLevel === 'number'
                    ? 'bg-tint-lavender text-primary'
                    : 'text-ink-muted bg-surface-subtle'
                }`}>
                  {typeof patch.painLevel === 'number' ? `${patch.painLevel}/10` : (language === 'hi' ? 'दर्ज नहीं' : 'Not recorded')}
                </span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPain(idx, val)}
                    className={`flex-1 min-w-[28px] sm:min-w-[32px] h-10 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer shadow-pill active:scale-95 ${
                      patch.painLevel === val
                        ? val >= 8
                          ? 'bg-red-600 text-white shadow-soft scale-105 ring-2 ring-red-300'
                          : 'bg-primary text-white shadow-soft scale-105 ring-2 ring-primary/30'
                        : 'bg-white text-ink-muted hover:text-ink hover:bg-surface-subtle border border-surface-border'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms - Direct 1-tap chips (Extracted highlighted, all others tappable) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  {language === 'hi' ? 'लक्षण (जोड़ें या हटाएं)' : 'Symptoms Understood (Tap to adjust)'}
                </label>
                <span className="text-[11px] font-medium text-ink-muted">
                  {(patch.symptoms || []).length > 0
                    ? `${(patch.symptoms || []).length} ${language === 'hi' ? 'चुने गए' : 'selected'}`
                    : (language === 'hi' ? 'कोई लक्षण नहीं चुना' : 'None selected')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(sym => {
                  const meta = SYMPTOM_LABELS[sym];
                  const isSelected = (patch.symptoms || []).includes(sym);
                  return (
                    <Chip
                      key={sym}
                      label={`${meta.emoji} ${meta[language]}`}
                      selected={isSelected}
                      onClick={() => toggleSymptom(idx, sym)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Moods - Direct 1-tap chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  {language === 'hi' ? 'मूड (जोड़ें या हटाएं)' : 'Mood (Tap to adjust)'}
                </label>
                <span className="text-[11px] font-medium text-ink-muted">
                  {(patch.moods || []).length > 0
                    ? `${(patch.moods || []).length} ${language === 'hi' ? 'चुने गए' : 'selected'}`
                    : (language === 'hi' ? 'कोई मूड नहीं चुना' : 'None selected')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(md => {
                  const meta = MOOD_LABELS[md];
                  const isSelected = (patch.moods || []).includes(md);
                  return (
                    <Chip
                      key={md}
                      label={`${meta.emoji} ${meta[language]}`}
                      selected={isSelected}
                      onClick={() => toggleMood(idx, md)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Editable Notes Input */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                {language === 'hi' ? 'कुछ और लिखना चाहें तो' : 'Personal Notes / Context'}
              </label>
              <input
                type="text"
                value={patch.notes || ''}
                onChange={e => updatePatch(idx, p => ({ ...p, notes: e.target.value }))}
                placeholder={
                  language === 'hi'
                    ? 'दवा, वॉक, कैसा लगा वगैरह...'
                    : 'Any medication taken, remedies tried, or extra context...'
                }
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-surface-border bg-white focus:ring-2 focus:ring-primary/25 focus:border-primary/40 focus:outline-none text-ink shadow-pill"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons: Clear Save Primary Action & Quiet Discard */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#E7DCF8] gap-3">
        <Button
          variant="ghost"
          size="md"
          onClick={onCancel}
          className="text-ink-muted hover:text-ink hover:bg-white/80"
        >
          {language === 'hi' ? 'रद्द करें' : 'Discard'}
        </Button>
        <Button
          variant="primary"
          size="lg"
          icon={<Check className="w-4 h-4 stroke-[2.5]" />}
          onClick={() => onConfirm(patches)}
          className="shadow-soft px-7 font-bold text-sm"
        >
          {language === 'hi' ? 'हाँ, सेव करें' : 'Save'}
        </Button>
      </div>
    </Card>
  );
};

