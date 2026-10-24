import React, { useState } from 'react';
import { Button } from './components/Button';
import { HeartHandshake, Lock, ArrowRight, ArrowLeft, Calendar, Sparkles, Check } from 'lucide-react';
import { UserProfile } from '@/shared/types';
import { addDays } from '@/modules/insights/cycleEngine';

export interface OnboardingModalProps {
  language: 'en' | 'hi';
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  language,
  onComplete,
  initialProfile
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const defaultLastDate = initialProfile?.lastPeriodStartDate || addDays(new Date().toISOString().split('T')[0], -13);
  const [name, setName] = useState<string>(initialProfile?.name || 'Somya');
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(defaultLastDate);
  const [cycleLength, setCycleLength] = useState<number>(initialProfile?.typicalCycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState<number>(initialProfile?.typicalPeriodDuration || 5);
  
  // Optional past 3 cycles
  const [pastCycle1, setPastCycle1] = useState<string>(
    initialProfile?.previousCycleLengths?.[0] ? String(initialProfile.previousCycleLengths[0]) : '28'
  );
  const [pastCycle2, setPastCycle2] = useState<string>(
    initialProfile?.previousCycleLengths?.[1] ? String(initialProfile.previousCycleLengths[1]) : '29'
  );
  const [pastCycle3, setPastCycle3] = useState<string>(
    initialProfile?.previousCycleLengths?.[2] ? String(initialProfile.previousCycleLengths[2]) : '28'
  );

  const handleSubmitProfile = () => {
    const prevLengths: number[] = [];
    const p1 = parseInt(pastCycle1, 10);
    const p2 = parseInt(pastCycle2, 10);
    const p3 = parseInt(pastCycle3, 10);

    if (!isNaN(p1) && p1 >= 18 && p1 <= 60) prevLengths.push(p1);
    if (!isNaN(p2) && p2 >= 18 && p2 <= 60) prevLengths.push(p2);
    if (!isNaN(p3) && p3 >= 18 && p3 <= 60) prevLengths.push(p3);

    const profile: UserProfile = {
      name: name.trim() || 'Somya',
      lastPeriodStartDate: lastPeriodDate,
      typicalCycleLength: Math.min(45, Math.max(20, cycleLength)),
      typicalPeriodDuration: Math.min(10, Math.max(2, periodDuration)),
      previousCycleLengths: prevLengths.length > 0 ? prevLengths : [cycleLength, cycleLength],
      createdAt: new Date().toISOString(),
      isCustomProfile: true
    };

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2.25rem] p-6 sm:p-8 shadow-card border border-[#F3E8EE] space-y-6 animate-scale-up relative overflow-hidden my-auto">
        {/* Soft background aura */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-tint-peach/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-tint-lavender/40 rounded-full blur-3xl pointer-events-none" />

        {/* STEP 1: WELCOME & PRIVACY ARCHITECTURE */}
        {step === 1 && (
          <div className="space-y-6 relative z-10 animate-fade-in">
            {/* Header with Floral Brand Emblem */}
            <div className="text-center pt-2">
              <div className="w-16 h-16 bg-tint-rose text-primary rounded-full mx-auto flex items-center justify-center mb-4 shadow-pill border border-[#F8DDE5]">
                <span className="text-2xl animate-pulse-subtle">🌸</span>
              </div>
              <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-primary bg-tint-lavender/80 px-3 py-1 rounded-full border border-[#E7DCF8] mb-2">
                Cyculus · 100% On-Device
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
                {language === 'hi' ? 'साइकुलस में आपका स्वागत है' : 'Welcome to Cyculus'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-1.5 font-sans leading-relaxed">
                {language === 'hi'
                  ? 'आपकी निजी, सुरक्षित मासिक चक्र डायरी एवं क्लिनिकल चिट्ठी'
                  : 'Your private, phone-first cycle diary & doctor-ready brief'}
              </p>
            </div>

            {/* 3 Core Guarantees with Pastel Card Accents */}
            <div className="space-y-3">
              <div className="p-3.5 bg-tint-mint/40 rounded-2xl flex items-start gap-3 border border-[#D8F0E4]">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-ink">
                    {language === 'hi' ? 'आपका डेटा केवल आपके फ़ोन पर रहता है' : 'Your data never leaves your phone'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'कोई खाता नहीं, कोई क्लाउड सर्वर नहीं। सभी प्रविष्टियाँ ब्राउज़र IndexedDB में सुरक्षित रहती हैं।'
                      : 'Zero cloud database. No login needed. Everything stays in your browser IndexedDB.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-tint-lavender/40 rounded-2xl flex items-start gap-3 border border-[#E7DCF8]">
                <div className="p-2 bg-primary-soft text-primary rounded-xl shrink-0 mt-0.5">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-ink">
                    {language === 'hi' ? 'डॉक्टर के लिए तथ्य-आधारित चिट्ठी' : 'Facts ready for your clinician'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'हिंग्लिश या सामान्य शब्दों में बोलें। क्लिनिक में दिखाने हेतु 1-पेज पीडीएफ चिट्ठी तैयार करें।'
                      : 'Log symptoms in your own words. Generate a clear 1-page PDF for medical appointments.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-tint-peach/40 rounded-2xl flex items-start gap-3 border border-[#FADCD0]">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl shrink-0 mt-0.5 font-bold text-xs">
                  🌿
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-amber-950">
                    {language === 'hi' ? 'चिकित्सकीय अस्वीकरण (Disclaimer)' : 'Non-Diagnostic Wellness Tool'}
                  </h4>
                  <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'यह ऐप कोई रोग निदान नहीं करता। यह केवल आपके चक्र के रुझान समझने और डॉक्टर से सवाल पूछने में सहायक है।'
                      : 'Cyculus identifies clinical standards (FIGO/ACOG) to help you discuss patterns with your doctor.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1 CTA */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(2)}
                className="shadow-soft hover:shadow-card font-medium tracking-wide"
              >
                {language === 'hi' ? 'अपनी डायरी सेट करें →' : 'Set Up Your Profile →'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: USER PROFILE & CYCLE BASELINE SETUP */}
        {step === 2 && (
          <div className="space-y-5 relative z-10 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint-lavender px-3 py-0.5 rounded-full border border-[#E7DCF8]">
                  {language === 'hi' ? 'कदम 2 का 2 · व्यक्तिगत प्रोफ़ाइल' : 'Step 2 of 2 · Personal Profile'}
                </span>
                <span className="text-[11px] text-ink-muted">🔒 Local Only</span>
              </div>
              <h3 className="text-2xl font-serif text-ink tracking-tight mt-2">
                {language === 'hi' ? 'अपनी चक्र जानकारी दर्ज करें' : 'Personalize Your Cycle Diary'}
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'यह डेटा केवल आपके ब्राउज़र में रहता है। इसके आधार पर आपका रोलिंग एवरेज और आगामी पीरियड विंडो तय होगा।'
                  : 'Everything stays local in your browser. This calibrates your rolling averages and prediction window.'}
              </p>
            </div>

            <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  {language === 'hi' ? 'आपका नाम (या उपनाम)' : 'Your Name (or preferred nickname)'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Somya"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-surface-border text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-soft"
                />
              </div>

              {/* Field 2: Last Period Start Date */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center justify-between">
                  <span>{language === 'hi' ? 'पिछला पीरियड कब शुरू हुआ था?' : 'When did your last period start?'}</span>
                  <span className="text-[10px] text-primary font-normal">Day 1 of bleeding</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={lastPeriodDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setLastPeriodDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-surface-border text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-soft"
                  />
                  <Calendar className="w-4 h-4 text-ink-muted absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Field 3 & 4: Typical Cycle Length & Bleeding Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-tint-lavender/40 rounded-2xl border border-[#E7DCF8]">
                  <label className="block text-[11px] font-semibold text-ink mb-1">
                    {language === 'hi' ? 'चक्र की लंबाई' : 'Typical Cycle'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={20}
                      max={45}
                      value={cycleLength}
                      onChange={e => setCycleLength(Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 rounded-xl bg-white border border-[#E7DCF8] text-xs font-bold text-center text-ink focus:outline-none focus:border-primary"
                    />
                    <span className="text-xs text-ink-muted">{language === 'hi' ? 'दिन' : 'days'}</span>
                  </div>
                  <p className="text-[10px] text-ink-muted mt-1">Normal: 24–38d</p>
                </div>

                <div className="p-3 bg-tint-peach/40 rounded-2xl border border-[#FADCD0]">
                  <label className="block text-[11px] font-semibold text-ink mb-1">
                    {language === 'hi' ? 'रक्तस्राव के दिन' : 'Bleeding Days'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={periodDuration}
                      onChange={e => setPeriodDuration(Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 rounded-xl bg-white border border-[#FADCD0] text-xs font-bold text-center text-ink focus:outline-none focus:border-primary"
                    />
                    <span className="text-xs text-ink-muted">{language === 'hi' ? 'दिन' : 'days'}</span>
                  </div>
                  <p className="text-[10px] text-ink-muted mt-1">Typical: 4–7d</p>
                </div>
              </div>

              {/* Field 5: Past 3 Cycles for Rolling Average */}
              <div className="bg-white/80 p-3.5 rounded-2xl border border-surface-border space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <label className="text-xs font-semibold text-ink">
                    {language === 'hi' ? 'पिछले 3 चक्र (रोलिंग औसत हेतु)' : 'Past 3 Cycle Intervals (Optional)'}
                  </label>
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  {language === 'hi'
                    ? 'यदि याद हो तो पिछले 2-3 चक्रों की अवधि (दिनों में) लिखें ताकि साइकुलस का रोलिंग एवरेज तुरंत कैलिब्रेट हो सके:'
                    : 'If remembered, enter your past cycle lengths to bootstrap the rolling average and prediction range:'}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <span className="block text-[10px] text-ink-muted mb-0.5">Cycle -1</span>
                    <input
                      type="number"
                      min={18}
                      max={60}
                      value={pastCycle1}
                      onChange={e => setPastCycle1(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-surface-bg border border-surface-border text-xs text-center font-bold text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-ink-muted mb-0.5">Cycle -2</span>
                    <input
                      type="number"
                      min={18}
                      max={60}
                      value={pastCycle2}
                      onChange={e => setPastCycle2(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-surface-bg border border-surface-border text-xs text-center font-bold text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-ink-muted mb-0.5">Cycle -3</span>
                    <input
                      type="number"
                      min={18}
                      max={60}
                      value={pastCycle3}
                      onChange={e => setPastCycle3(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-surface-bg border border-surface-border text-xs text-center font-bold text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="ghost"
                size="md"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep(1)}
                className="rounded-full"
              >
                {language === 'hi' ? 'पीछे' : 'Back'}
              </Button>

              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={<Check className="w-4 h-4" />}
                onClick={handleSubmitProfile}
                className="shadow-soft hover:shadow-card font-medium tracking-wide"
              >
                {language === 'hi' ? 'प्रोफ़ाइल सहेजें व शुरू करें 🌸' : 'Save & Enter Diary 🌸'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
