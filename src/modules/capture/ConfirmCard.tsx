import React, { useState } from 'react';
import { DayPatch, FlowLevel, Symptom, Mood, FLOW_LEVELS, SYMPTOMS, MOODS } from '@/shared/types';
import { FLOW_LABELS, SYMPTOM_LABELS, MOOD_LABELS } from '@/shared/translations';
import { Card, Button, Chip } from '@/app/components';
import { Check, Edit3, Calendar, Sparkles, AlertCircle } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
    <Card variant="lavender" padding="lg" className="border-[#EADBFA] shadow-float mb-6 animate-scale-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E7DCF8]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-soft">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-ink text-base sm:text-lg">
              {language === 'hi' ? 'पुष्टि करें: हमने यह समझा' : 'Review & Confirm Extracted Log'}
            </h3>
            <p className="text-xs text-ink-muted">
              {language === 'hi'
                ? 'सहेजने से पहले जांच लें। आप किसी भी जानकारी को बदल सकती हैं।'
                : 'Double check before saving. You can edit any field.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold bg-white px-3 py-1.5 rounded-full border border-[#E7DCF8] shadow-pill hover:bg-primary-soft/40 cursor-pointer transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? (language === 'hi' ? 'समीक्षा' : 'Review') : (language === 'hi' ? 'बदलें' : 'Edit')}</span>
        </button>
      </div>

      {originalText && (
        <div className="mt-3.5 p-3.5 bg-white rounded-2xl border border-surface-border text-xs text-ink-muted italic shadow-pill">
          "{originalText}"
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-2.5 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{warnings.join(' ')}</span>
        </div>
      )}

      {/* Patches List */}
      <div className="mt-4 space-y-4">
        {patches.map((patch, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-surface-border space-y-3">
            {/* Date line */}
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {isEditing ? (
                  <input
                    type="date"
                    value={patch.date}
                    onChange={e => updatePatch(idx, p => ({ ...p, date: e.target.value }))}
                    className="border border-surface-border rounded-lg px-2 py-1 text-xs text-ink bg-surface-subtle focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <span>
                    {patch.date}
                    {patches.length > 1 ? ` (Day ${idx + 1})` : ''}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-normal text-ink-muted bg-primary-soft/50 px-2 py-0.5 rounded-full">
                {Math.round(confidence * 100)}% match
              </span>
            </div>

            {/* Flow selection */}
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">
                {language === 'hi' ? 'रक्तस्राव (Flow)' : 'Bleeding Flow'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FLOW_LEVELS.map(fl => {
                  const meta = FLOW_LABELS[fl];
                  const selected = patch.flow === fl;
                  return (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setFlow(idx, fl)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border min-h-[44px] transition-all duration-150 flex items-center gap-1.5 ${
                        selected
                          ? 'bg-ink text-white border-ink shadow-sm'
                          : 'bg-surface-subtle text-ink-muted border-surface-border hover:bg-white'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta[language]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pain rating */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-ink-muted mb-1.5">
                <span>{language === 'hi' ? 'दर्द का स्तर (0-10)' : 'Pain Rating (0–10)'}</span>
                <span className="font-bold text-ink">
                  {patch.painLevel !== null ? `${patch.painLevel}/10` : language === 'hi' ? 'दर्ज नहीं' : 'Not recorded'}
                </span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPain(idx, val)}
                    className={`flex-1 min-w-[32px] h-10 rounded-xl text-xs font-semibold transition-all ${
                      patch.painLevel === val
                        ? val >= 8
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-primary text-white shadow-sm'
                        : 'bg-surface-subtle text-ink-muted hover:bg-white border border-surface-border'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">
                {language === 'hi' ? 'लक्षण (Symptoms)' : 'Symptoms Understood'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(isEditing ? SYMPTOMS : patch.symptoms || []).map(sym => {
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
                {!isEditing && (!patch.symptoms || patch.symptoms.length === 0) && (
                  <span className="text-xs text-ink-muted italic">
                    {language === 'hi' ? 'कोई लक्षण नहीं' : 'None detected'}
                  </span>
                )}
              </div>
            </div>

            {/* Moods */}
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">
                {language === 'hi' ? 'मूड (Mood)' : 'Mood'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(isEditing ? MOODS : patch.moods || []).map(md => {
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
                {!isEditing && (!patch.moods || patch.moods.length === 0) && (
                  <span className="text-xs text-ink-muted italic">
                    {language === 'hi' ? 'कोई मूड नहीं' : 'None detected'}
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            {isEditing && (
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  {language === 'hi' ? 'अतिरिक्त नोट्स' : 'Additional Notes'}
                </label>
                <input
                  type="text"
                  value={patch.notes || ''}
                  onChange={e => updatePatch(idx, p => ({ ...p, notes: e.target.value }))}
                  placeholder={language === 'hi' ? 'कोई अन्य विवरण...' : 'Any extra details...'}
                  className="w-full text-xs p-2.5 rounded-xl border border-surface-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-primary/20">
        <Button variant="ghost" size="md" onClick={onCancel}>
          {language === 'hi' ? 'रद्द करें' : 'Discard'}
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={<Check className="w-4 h-4" />}
          onClick={() => onConfirm(patches)}
        >
          {language === 'hi' ? 'स्वीकार कर सुरक्षित करें' : 'Confirm & Save Log'}
        </Button>
      </div>
    </Card>
  );
};
