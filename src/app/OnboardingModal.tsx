import React, { useState } from 'react';
import { Button } from './components/Button';
import { HeartHandshake, Lock, ArrowRight, ArrowLeft, Calendar, Sparkles, Minus, Plus, PlusCircle } from 'lucide-react';
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
  // If editing an existing setup, open directly on step 2 (Date & Prior Setup)
  const isAlreadyOnboarded = Boolean(initialSetup) || Boolean(localStorage.getItem('cyculus_onboarding_done'));
  const [step, setStep] = useState<1 | 2>(isAlreadyOnboarded ? 2 : 1);
  const todayStr = new Date().toISOString().split('T')[0];

  // Form states:
  const [lastPeriodStart, setLastPeriodStart] = useState<string>(initialSetup?.lastPeriodStart || '');

  // Cycle choice mode: 'know' (default) or 'not_sure' — never default to not sure!
  const [cycleMode, setCycleMode] = useState<'know' | 'not_sure'>(() => {
    if (initialSetup && initialSetup.typicalCycleLength === undefined && initialSetup.lastPeriodStart) {
      return 'not_sure';
    }
    return 'know';
  });

  const [cycleLength, setCycleLength] = useState<number>(() => {
    return initialSetup?.typicalCycleLength ?? 29;
  });
  const [cycleLengthStr, setCycleLengthStr] = useState<string>(
    initialSetup?.typicalCycleLength ? String(initialSetup.typicalCycleLength) : '29'
  );

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
          ? 'पीरियड शुरू होने की तारीख आने वाले कल या भविष्य की नहीं हो सकती।'
          : 'Last period start date cannot be in the future.'
      );
      return;
    }

    // Validate cycle length if in 'know' mode
    let typicalCycleLength: number | undefined = undefined;
    if (cycleMode === 'know') {
      const parsed = parseInt(cycleLengthStr, 10);
      if (isNaN(parsed) || parsed < 15 || parsed > 90) {
        setValidationError(
          language === 'hi'
            ? 'कृपया पीरियड का गैप 15 से 90 दिन के बीच लिखें (या "पक्का नहीं पता" चुनें)।'
            : 'Please enter a typical cycle length between 15 and 90 days, or select "Not sure / Irregular".'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/40 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 shadow-card border border-[#F3E8EE] animate-scale-up relative overflow-hidden my-auto">
        {/* Soft background aura */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-tint-peach/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-tint-lavender/40 rounded-full blur-3xl pointer-events-none" />

        {/* STEP 1: WELCOME & PRIVACY ARCHITECTURE */}
        {step === 1 && (
          <div className="space-y-4 relative z-10 animate-fade-in flex flex-col my-auto">
            {/* Header with Floral Brand Emblem */}
            <div className="text-center pt-1">
              <div className="w-12 h-12 bg-tint-rose text-primary rounded-full mx-auto flex items-center justify-center mb-2.5 shadow-pill border border-[#F8DDE5]">
                <span className="text-xl animate-pulse-subtle">🌸</span>
              </div>
              <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-primary bg-tint-lavender/80 px-2.5 py-0.5 rounded-full border border-[#E7DCF8] mb-1.5">
                Cyculus · 100% On-Device
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-ink tracking-tight">
                {language === 'hi' ? 'साइकुलस में आपका स्वागत है' : 'Welcome to Cyculus'}
              </h2>
              <p className="text-xs text-ink-muted mt-1 font-sans leading-relaxed">
                {language === 'hi'
                  ? 'आपकी प्राइवेट, सुरक्षित पीरियड डायरी और डॉक्टर के लिए चिट्ठी'
                  : 'Your private, phone-first cycle diary & doctor-ready brief'}
              </p>
            </div>

            {/* 3 Core Guarantees with Pastel Card Accents */}
            <div className="space-y-2 sm:space-y-2.5">
              <div className="p-2.5 sm:p-3 bg-tint-mint/40 rounded-2xl flex items-start gap-2.5 border border-[#D8F0E4]">
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-ink">
                    {language === 'hi' ? '100% ऑन-डिवाइस (कोई अकाउंट या नाम नहीं)' : '100% On-Device PWA (No Profile Needed)'}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'कोई अकाउंट, पासवर्ड या नाम की ज़रूरत नहीं। आपका हेल्थ डेटा सिर्फ आपके इस फोन/ब्राउज़र में सुरक्षित रहता है और बिना इंटरनेट भी काम करता है।'
                      : 'No account, profile, or name required. Everything stays locally in your browser IndexedDB. Installable on phone & desktop with offline caching.'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-tint-lavender/40 rounded-2xl flex items-start gap-2.5 border border-[#E7DCF8]">
                <div className="p-1.5 bg-primary-soft text-primary rounded-xl shrink-0 mt-0.5">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-ink">
                    {language === 'hi' ? 'डॉक्टर के लिए 1-पेज की चिट्ठी' : 'Facts ready for your clinician'}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'अपनी रोज़मर्रा की भाषा में बोलें या लिखें। डॉक्टर को दिखाने के लिए 1-पेज PDF चिट्ठी तैयार हो जाएगी।'
                      : 'Log symptoms in your own words. Generate a clear 1-page PDF for medical appointments.'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-tint-peach/40 rounded-2xl flex items-start gap-2.5 border border-[#FADCD0]">
                <div className="p-1.5 bg-amber-100 text-amber-900 rounded-xl shrink-0 mt-0.5 font-bold text-xs">
                  🌿
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-amber-950">
                    {language === 'hi' ? 'ज़रूरी बात (Disclaimer)' : 'Non-Diagnostic Wellness Tool'}
                  </h4>
                  <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'यह ऐप कोई मेडिकल बीमारी डायग्नोज़ नहीं करता। यह सिर्फ आपके पीरियड्स का पैटर्न समझने और डॉक्टर से बात करने में मदद करता है।'
                      : 'Cyculus evaluates clinical standards (FIGO/ACOG) to help you discuss patterns with your doctor.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-1.5 space-y-1.5">
              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => setStep(2)}
                className="shadow-soft hover:shadow-card font-medium tracking-wide py-2.5"
              >
                {language === 'hi' ? 'पीरियड का अंदाज़ा बताएं (ऐच्छिक)' : 'Next: Set Up Cycle Prior'}
              </Button>

              <button
                type="button"
                onClick={onSkip}
                className="w-full text-center text-xs text-ink-muted hover:text-ink py-1 transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'सीधे पहला दिन लॉग करें' : 'Skip to: Log your first day'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: USER SETUP (OPTIONAL PRIOR, NO 28 DEFAULT) */}
        {step === 2 && (
          <div className="space-y-3.5 relative z-10 animate-fade-in flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint-lavender px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                  {language === 'hi' ? 'कदम 2 · पीरियड का अंदाज़ा' : 'Step 2 · Initial Prior Setup'}
                </span>
                <span className="text-[11px] text-ink-muted">Self-Reported Prior</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-ink tracking-tight mt-1">
                {language === 'hi' ? 'अपने पीरियड का अंदाज़ा बताएं' : 'Calibrate Your Cycle Prior'}
              </h3>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'यह सिर्फ एक शुरुआती अंदाज़ा है। जैसे-जैसे आप लॉग करेंगी, यह खुद सटीक होता जाएगा। इससे कोई गलत मेडिकल फ़्लैग नहीं बनेगा।'
                  : 'This self-reported prior seeds early predictions, fading as real logs accumulate. It never triggers clinical flags or fabricates log entries.'}
              </p>
            </div>

            {/* Validation Alert */}
            {validationError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 shrink-0">
                {validationError}
              </div>
            )}

            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 min-h-0">
              {/* Field 1: Last Period Start Date */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1 flex items-center justify-between">
                  <span>{language === 'hi' ? 'पिछला पीरियड कब शुरू हुआ था?' : 'When did your last period start?'}</span>
                  <span className="text-[10px] text-ink-muted">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    max={todayStr}
                    value={lastPeriodStart}
                    onChange={e => setLastPeriodStart(e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-surface-border text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-soft"
                  />
                  <Calendar className="w-4 h-4 text-ink-muted absolute right-3 top-2 sm:top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Typical Cycle Length */}
              <div className="p-3 bg-tint-lavender/30 rounded-2xl border border-[#E7DCF8] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink">
                    {language === 'hi' ? 'आमतौर पर पीरियड्स में कितना गैप रहता है?' : 'Typical Cycle Length'}
                  </label>
                  <span className="text-[10px] text-primary font-bold">28 is a myth</span>
                </div>

                {/* Two explicit segment choices */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/80 rounded-xl border border-[#E7DCF8]">
                  <button
                    type="button"
                    onClick={() => {
                      setCycleMode('know');
                      if (!cycleLengthStr) {
                        setCycleLength(29);
                        setCycleLengthStr('29');
                      }
                    }}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      cycleMode === 'know'
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/30'
                    }`}
                  >
                    <span>🗓️</span>
                    <span>{language === 'hi' ? 'मुझे अपना गैप पता है' : 'I know my cycle'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCycleMode('not_sure')}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      cycleMode === 'not_sure'
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/30'
                    }`}
                  >
                    <span>❓</span>
                    <span>{language === 'hi' ? 'पक्का नहीं पता / अनियमित' : 'Not sure / Irregular'}</span>
                  </button>
                </div>

                {cycleMode === 'know' ? (
                  <div className="space-y-2 pt-0.5 animate-fade-in">
                    {/* Quick Select Chips */}
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] text-ink-muted font-medium">
                        {language === 'hi' ? 'आमतौर पर दिन:' : 'Common days:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[26, 27, 28, 29, 30, 31, 32, 35].map(days => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => {
                              setCycleLength(days);
                              setCycleLengthStr(String(days));
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              cycleLength === days && cycleLengthStr === String(days)
                                ? 'bg-primary text-white shadow-soft scale-105'
                                : 'bg-white border border-[#E7DCF8] text-ink hover:border-primary/50'
                            }`}
                          >
                            {days}d
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stepper + Direct Numeric Input */}
                    <div className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-surface-border shadow-soft">
                      <span className="text-xs text-ink-muted font-medium">
                        {language === 'hi' ? 'सटीक दिन सेट करें:' : 'Adjust exact days:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const val = Math.max(15, (parseInt(cycleLengthStr, 10) || cycleLength || 29) - 1);
                            setCycleLength(val);
                            setCycleLengthStr(String(val));
                          }}
                          className="w-7 h-7 rounded-lg bg-surface-bg border border-surface-border text-ink hover:bg-tint-lavender flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                          aria-label="Decrease cycle length"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          min={15}
                          max={90}
                          value={cycleLengthStr}
                          onChange={e => {
                            setCycleLengthStr(e.target.value);
                            const parsed = parseInt(e.target.value, 10);
                            if (!isNaN(parsed)) {
                              setCycleLength(parsed);
                            }
                          }}
                          className="w-14 px-1 py-1 rounded-lg bg-surface-bg border border-surface-border text-xs sm:text-sm font-bold text-center text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const val = Math.min(90, (parseInt(cycleLengthStr, 10) || cycleLength || 29) + 1);
                            setCycleLength(val);
                            setCycleLengthStr(String(val));
                          }}
                          className="w-7 h-7 rounded-lg bg-surface-bg border border-surface-border text-ink hover:bg-tint-lavender flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                          aria-label="Increase cycle length"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <span className="text-xs font-semibold text-ink pl-0.5">
                          {language === 'hi' ? 'दिन' : 'days'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-ink-muted leading-tight">
                      {language === 'hi'
                        ? 'सामान्य क्लिनिकल रेंज 24–38 दिन है (FIGO मानक)। लॉग करने से अंदाज़ा खुद बेहतर होगा।'
                        : 'FIGO standard clinical range is 24–38 days. Real logs will automatically refine predictions.'}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white/90 rounded-xl border border-[#E7DCF8] space-y-1 animate-fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>{language === 'hi' ? 'औसत अंदाज़े का इस्तेमाल' : 'Population Average Fallback'}</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-ink-muted leading-tight">
                      {language === 'hi'
                        ? 'कोई बात नहीं! जब तक आप कुछ पीरियड्स लॉग नहीं कर लेतीं, हम सामान्य औसत (29 दिन) के हिसाब से एक सुरक्षित दायरा मानकर चलेंगे।'
                        : 'No problem! Cyculus will use the clinical population average (29.3 days from Bull et al. 2019) with a wide prediction window until your logs build up.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Field 3: Earlier Period Starts (Optional calibration) */}
              <div className="bg-white/80 p-2.5 sm:p-3 rounded-xl border border-surface-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <label className="text-xs font-semibold text-ink">
                      {language === 'hi' ? 'पिछली तारीखें (ऐच्छिक)' : 'Earlier Period Dates (Optional)'}
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

                {showEarlierDates && (
                  <div className="space-y-1.5 animate-fade-in pt-1">
                    <p className="text-[10px] text-ink-muted leading-tight">
                      {language === 'hi'
                        ? 'पिछले 2–3 पीरियड्स की तारीखें जोड़ने से अंदाज़ा और सटीक रहेगा।'
                        : '2 or 3 earlier start dates provide real observed intervals rather than a rough estimate.'}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="block text-[9px] text-ink-muted mb-0.5">Period -1</span>
                        <input
                          type="date"
                          max={todayStr}
                          value={prevStart1}
                          onChange={e => setPrevStart1(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg bg-surface-bg border border-surface-border text-xs text-ink focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] text-ink-muted mb-0.5">Period -2</span>
                        <input
                          type="date"
                          max={todayStr}
                          value={prevStart2}
                          onChange={e => setPrevStart2(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg bg-surface-bg border border-surface-border text-xs text-ink focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] text-ink-muted mb-0.5">Period -3</span>
                        <input
                          type="date"
                          max={todayStr}
                          value={prevStart3}
                          onChange={e => setPrevStart3(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg bg-surface-bg border border-surface-border text-xs text-ink focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Log your first day as the only next step */}
            <div className="pt-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="md"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setStep(1)}
                  className="rounded-full shrink-0"
                >
                  {language === 'hi' ? 'पीछे' : 'Back'}
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={<PlusCircle className="w-4 h-4 stroke-[2.5]" />}
                  onClick={handleSave}
                  className="shadow-soft hover:shadow-card font-bold tracking-wide text-xs sm:text-sm py-2.5"
                >
                  {isAlreadyOnboarded
                    ? (language === 'hi' ? 'अंदाज़ा सेव करें' : 'Save Baseline')
                    : (language === 'hi' ? 'पहला दिन लॉग करें' : 'Log your first day')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
