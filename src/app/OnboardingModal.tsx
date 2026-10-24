import React, { useState } from 'react';
import { Button } from './components/Button';
import { HeartHandshake, Lock, ArrowRight, ArrowLeft, Calendar, Sparkles, Check } from 'lucide-react';
import { UserSetup } from '@/shared/types';

export interface OnboardingModalProps {
  language: 'en' | 'hi';
  initialSetup?: UserSetup | null;
  onSaveSetup: (setup: UserSetup) => void;
  onSkip: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  language,
  initialSetup,
  onSaveSetup,
  onSkip
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const todayStr = new Date().toISOString().split('T')[0];

  // Form states: No '28' default! Starts empty.
  const [lastPeriodStart, setLastPeriodStart] = useState<string>(initialSetup?.lastPeriodStart || '');
  const [cycleLengthStr, setCycleLengthStr] = useState<string>(
    initialSetup?.typicalCycleLength ? String(initialSetup.typicalCycleLength) : ''
  );
  const [isNotSureLength, setIsNotSureLength] = useState<boolean>(!initialSetup?.typicalCycleLength);

  // Optional earlier period starts for real intervals
  const [showEarlierDates, setShowEarlierDates] = useState<boolean>(
    Boolean(initialSetup?.previousStarts && initialSetup.previousStarts.length > 0)
  );
  const [prevStart1, setPrevStart1] = useState<string>(initialSetup?.previousStarts?.[0] || '');
  const [prevStart2, setPrevStart2] = useState<string>(initialSetup?.previousStarts?.[1] || '');
  const [prevStart3, setPrevStart3] = useState<string>(initialSetup?.previousStarts?.[2] || '');

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSave = () => {
    setValidationError(null);

    // Validate lastPeriodStart: no future dates
    if (lastPeriodStart && lastPeriodStart > todayStr) {
      setValidationError(
        language === 'hi'
          ? 'माहवारी शुरू होने की तारीख भविष्य की नहीं हो सकती।'
          : 'Last period start date cannot be in the future.'
      );
      return;
    }

    // Validate cycle length if provided
    let typicalCycleLength: number | undefined = undefined;
    if (!isNotSureLength && cycleLengthStr.trim() !== '') {
      const parsed = parseInt(cycleLengthStr, 10);
      if (isNaN(parsed) || parsed < 15 || parsed > 90) {
        setValidationError(
          language === 'hi'
            ? 'कृपया चक्र की लंबाई 15 से 90 दिनों के बीच दर्ज करें।'
            : 'Please enter a typical cycle length between 15 and 90 days.'
        );
        return;
      }
      typicalCycleLength = parsed;
    }

    // Collect previous starts
    const previousStarts: string[] = [];
    [prevStart1, prevStart2, prevStart3].forEach(d => {
      if (d && d <= todayStr && !previousStarts.includes(d)) {
        previousStarts.push(d);
      }
    });

    const setup: UserSetup = {
      lastPeriodStart: lastPeriodStart || undefined,
      typicalCycleLength,
      previousStarts: previousStarts.length > 0 ? previousStarts : undefined,
      updatedAt: new Date().toISOString()
    };

    onSaveSetup(setup);
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
                    {language === 'hi' ? '100% ऑन-डिवाइस PWA (कोई नाम या प्रोफ़ाइल नहीं)' : '100% On-Device PWA (No Profile Needed)'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'कोई खाता, पासवर्ड या नाम आवश्यक नहीं। आपका व्यक्तिगत स्वास्थ्य डेटा केवल आपके इस फ़ोन/ब्राउज़र में रहता है। पूर्ण रूप से ऑफ़लाइन कार्य करता है।'
                      : 'No account, profile, or name required. Everything stays locally in your browser IndexedDB. Installable on phone & desktop with offline caching.'}
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
                      : 'Cyculus evaluates clinical standards (FIGO/ACOG) to help you discuss patterns with your doctor.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(2)}
                className="shadow-soft hover:shadow-card font-medium tracking-wide"
              >
                {language === 'hi' ? 'चक्र सेटअप (ऐच्छिक) →' : 'Next: Set Up Cycle Prior →'}
              </Button>

              <button
                type="button"
                onClick={onSkip}
                className="w-full text-center text-xs text-ink-muted hover:text-ink py-2 transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'अभी छोड़ें (PWA गाइड एवं निर्देश देखें) →' : 'Skip setup (Explore PWA guide & start fresh) →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: USER SETUP (OPTIONAL PRIOR, NO 28 DEFAULT) */}
        {step === 2 && (
          <div className="space-y-5 relative z-10 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint-lavender px-3 py-0.5 rounded-full border border-[#E7DCF8]">
                  {language === 'hi' ? 'कदम 2 · चक्र अनुमान सेटअप' : 'Step 2 · Initial Prior Setup'}
                </span>
                <span className="text-[11px] text-ink-muted">Self-Reported Prior</span>
              </div>
              <h3 className="text-2xl font-serif text-ink tracking-tight mt-2">
                {language === 'hi' ? 'अपने चक्र का अनुमान बताएं' : 'Calibrate Your Cycle Prior'}
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'यह डेटा केवल एक आरंभिक अनुमान (Prior) के रूप में कार्य करता है और वास्तविक लॉग बढ़ने पर स्वतः हट जाता है। यह कभी कोई क्लिनिकल फ़्लैग ट्रिगर नहीं करता।'
                  : 'This self-reported prior seeds early predictions, fading as real logs accumulate. It never triggers clinical flags or fabricates log entries.'}
              </p>
            </div>

            {/* Validation Alert */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
                {validationError}
              </div>
            )}

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {/* Field 1: Last Period Start Date */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center justify-between">
                  <span>{language === 'hi' ? 'पिछला पीरियड कब शुरू हुआ था?' : 'When did your last period start?'}</span>
                  <span className="text-[10px] text-ink-muted">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    max={todayStr}
                    value={lastPeriodStart}
                    onChange={e => setLastPeriodStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-surface-border text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-soft"
                  />
                  <Calendar className="w-4 h-4 text-ink-muted absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Typical Cycle Length (NO 28 DEFAULT) */}
              <div className="p-4 bg-tint-lavender/30 rounded-2xl border border-[#E7DCF8] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink">
                    {language === 'hi' ? 'सामान्य चक्र की लंबाई' : 'Typical Cycle Length'}
                  </label>
                  <span className="text-[10px] text-primary font-bold">28 is a myth</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={15}
                    max={90}
                    disabled={isNotSureLength}
                    placeholder="e.g. 31"
                    value={cycleLengthStr}
                    onChange={e => {
                      setCycleLengthStr(e.target.value);
                      setIsNotSureLength(false);
                    }}
                    className="w-24 px-3 py-2 rounded-xl bg-white border border-surface-border text-xs sm:text-sm font-bold text-center text-ink focus:outline-none focus:border-primary disabled:opacity-40"
                  />
                  <span className="text-xs text-ink-muted">{language === 'hi' ? 'दिन' : 'days'}</span>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNotSureLength(prev => !prev);
                      if (!isNotSureLength) setCycleLengthStr('');
                    }}
                    className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isNotSureLength
                        ? 'bg-primary text-white shadow-soft'
                        : 'bg-white border border-[#E7DCF8] text-ink-muted hover:text-ink'
                    }`}
                  >
                    {language === 'hi' ? 'पक्का नहीं पता' : 'Not sure'}
                  </button>
                </div>

                {isNotSureLength && (
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    {language === 'hi'
                      ? 'कोई बात नहीं! हम जनसंख्या औसत (29.3 दिन, Bull et al. 2019) और व्यापक विंडो का उपयोग करेंगे।'
                      : 'We’ll use the population average (29.3 days from Bull et al.) and show a wide, low-confidence window until your own logs build up.'}
                  </p>
                )}
              </div>

              {/* Field 3: Earlier Period Starts (Better Input for Real Intervals) */}
              <div className="bg-white/80 p-4 rounded-2xl border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <label className="text-xs font-semibold text-ink">
                      {language === 'hi' ? 'पिछली तारीखें (सटीकता बढ़ाएं)' : 'Earlier Period Dates (Improve Accuracy)'}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEarlierDates(prev => !prev)}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    {showEarlierDates ? (language === 'hi' ? 'छिपाएं' : 'Hide') : (language === 'hi' ? '+ तारीखें जोड़ें' : '+ Add Dates')}
                  </button>
                </div>

                <p className="text-[11px] text-ink-muted leading-relaxed">
                  {language === 'hi'
                    ? 'कैलेंडर से 2-3 पिछली माहवारी शुरू होने की तारीखें दर्ज करने से अनुमानित अवधि के बजाय वास्तविक अंतराल प्राप्त होते हैं।'
                    : '2 or 3 earlier start dates provide real observed intervals rather than a rough estimate.'}
                </p>

                {showEarlierDates && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 animate-fade-in">
                    <div>
                      <span className="block text-[10px] text-ink-muted mb-0.5">Period -1</span>
                      <input
                        type="date"
                        max={todayStr}
                        value={prevStart1}
                        onChange={e => setPrevStart1(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-surface-bg border border-surface-border text-xs text-ink focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-ink-muted mb-0.5">Period -2</span>
                      <input
                        type="date"
                        max={todayStr}
                        value={prevStart2}
                        onChange={e => setPrevStart2(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-surface-bg border border-surface-border text-xs text-ink focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-ink-muted mb-0.5">Period -3</span>
                      <input
                        type="date"
                        max={todayStr}
                        value={prevStart3}
                        onChange={e => setPrevStart3(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-surface-bg border border-surface-border text-xs text-ink focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-3">
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
                  onClick={handleSave}
                  className="shadow-soft hover:shadow-card font-medium tracking-wide"
                >
                  {language === 'hi' ? 'सेटअप सहेजें 🌸' : 'Save Prior & Enter 🌸'}
                </Button>
              </div>

              <button
                type="button"
                onClick={onSkip}
                className="w-full text-center text-xs text-ink-muted hover:text-ink py-1.5 transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'सेटअप छोड़ें (Skip for now)' : 'Skip setup (I will rely purely on logged cycles)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
