import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  SlidersHorizontal
} from 'lucide-react';

export interface PwaUsageGuideProps {
  language: 'en' | 'hi';
  onNavigateToLog?: () => void;
  onOpenSetup?: () => void;
  onOpenSettings?: () => void;
  onLoadPersona?: (type: 'riya' | 'regular' | 'heavy') => Promise<void> | void;
  className?: string;
}

export const PwaUsageGuide: React.FC<PwaUsageGuideProps> = ({
  language,
  onNavigateToLog,
  onOpenSetup,
  onOpenSettings: _onOpenSettings,
  onLoadPersona,
  className = ''
}) => {
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Detect if already installed in standalone PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt for supported browsers (Chrome, Edge, Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className={`space-y-6 animate-fade-in ${className}`}>
      {/* 1. Hero PWA Overview & Architecture Card */}
      <div className="bg-gradient-to-br from-tint-lavender/70 via-white/90 to-tint-peach/40 rounded-[2.25rem] p-6 sm:p-8 border border-[#E7DCF8] shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-white/95 px-3 py-1 rounded-full border border-[#E7DCF8] shadow-soft flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? '100% ऑन-डिवाइस PWA' : '100% On-Device PWA'}</span>
            </span>
            <span className="text-[11px] text-ink-muted bg-white/70 px-2.5 py-1 rounded-full border border-surface-border">
              {language === 'hi' ? 'शून्य क्लाउड · पूर्ण गोपनीयता' : 'Zero Cloud · Zero Tracking'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-bold">
            {language === 'hi' 
              ? 'साइकुलस PWA गाइड और निर्देश' 
              : 'Cyculus PWA: Instructions & Usage Guide'}
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
            {language === 'hi'
              ? 'साइकुलस एक प्रोग्रेसिव वेब ऐप (PWA) है जो बिना किसी इंटरनेट या सर्वर के सीधे आपके फोन/ब्राउज़र में सुरक्षित चलता है। कोई अकाउंट, पासवर्ड या क्लाउड डेटाबेस नहीं है।'
              : 'Cyculus is an installable, offline-first Progressive Web App. It stores all symptom notes, cycles, and clinical summaries directly in your browser’s IndexedDB. No login, no password, and zero data uploads.'}
          </p>

          {/* Quick Action Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {deferredPrompt && !isInstalled && (
              <Button
                variant="primary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={handleInstallClick}
                className="rounded-full shadow-soft"
              >
                {language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install Cyculus App'}
              </Button>
            )}

            {onNavigateToLog && (
              <Button
                variant={deferredPrompt && !isInstalled ? 'outline' : 'primary'}
                size="sm"
                icon={<PlusCircle className="w-4 h-4" />}
                onClick={onNavigateToLog}
                className="rounded-full shadow-soft text-xs"
              >
                {language === 'hi' ? 'आज का चेक-इन (OofLog · आज कैसा रहा)' : 'Log Today (OofLog · aaj kaisa raha)'}
              </Button>
            )}

            {onOpenSetup && (
              <Button
                variant="outline"
                size="sm"
                icon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={onOpenSetup}
                className="rounded-full shadow-pill text-xs"
              >
                {language === 'hi' ? 'चक्र सेटअप प्रायर (वैकल्पिक)' : 'Set Cycle Prior (Optional)'}
              </Button>
            )}

            {isInstalled && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {language === 'hi' ? 'ऐप इंस्टॉल है (Standalone)' : 'App Installed (Standalone PWA)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step Instructions: How to Use Cyculus */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="font-serif font-bold text-ink text-lg sm:text-xl">
              {language === 'hi' ? 'साइकुलस का उपयोग कैसे करें' : 'How Cyculus Works: 4 Simple Steps'}
            </h3>
            <p className="text-xs text-ink-muted">
              {language === 'hi'
                ? 'दैनिक चेक-इन से लेकर डॉक्टर की चिट्ठी तक का आसान मार्गदर्शन'
                : 'From daily effortless check-ins to an evidence-grounded clinician summary'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1: OofLog */}
          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[2rem] border border-[#F3E8EE] shadow-soft space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tint-rose text-primary flex items-center justify-center font-bold text-sm shadow-soft shrink-0">
                1
              </div>
              <div>
                <h4 className="font-serif font-bold text-ink text-sm sm:text-base">
                  {language === 'hi' ? 'OofLog · आज कैसा रहा' : 'OofLog · aaj kaisa raha'}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {language === 'hi' ? 'रोज़ के लक्षण और फ्लो' : 'Daily Capture · Works Offline'}
                </span>
              </div>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {language === 'hi'
                ? 'पीरियड का फ्लो (Spotting, Light, Medium, Heavy), दर्द (0–10) और लक्षण 1-टैप में लॉग करें। आप माइक दबाकर अपनी रोज़मर्रा की भाषा में बोल भी सकती हैं। कन्फर्म कार्ड में चेक करने के बाद ही डेटा सेव होता है।'
                : 'Log flow (Spotting to Heavy), pain scale (0–10), and symptoms in one tap. Or tap the mic to speak naturally in Hindi or English. Cyculus formats an editable confirm card so nothing is auto-saved without your approval.'}
            </p>
          </div>

          {/* Step 2: Dayum */}
          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[2rem] border border-[#F3E8EE] shadow-soft space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tint-lavender text-primary flex items-center justify-center font-bold text-sm shadow-soft shrink-0">
                2
              </div>
              <div>
                <h4 className="font-serif font-bold text-ink text-sm sm:text-base">
                  {language === 'hi' ? 'Dayum · पीरियड टाइमलाइन' : 'Dayum · cycle timeline'}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {language === 'hi' ? '28-दिन के भ्रम से मुक्त' : 'No 28-Day Myth · Shrinkage Prior'}
                </span>
              </div>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {language === 'hi'
                ? 'हम काल्पनिक 28-दिन का चक्र नहीं मानते। शुरुआत में यह जनसंख्या औसत (29.3 दिन, Bull et al. 2019) या आपके दिए गए अंदाज़े का उपयोग करता है। जैसे-जैसे असली पीरियड्स लॉग होते हैं, अंदाज़ा और सटीक होता जाता है।'
                : 'We reject the mythical 28-day default. Starting with a realistic population prior (29.3 days, Bull et al. 2019) or your own estimate, prediction smoothly shrinks towards your actual observed cycles as real logs accumulate.'}
            </p>
          </div>

          {/* Step 3: Chitthi (Doctor Brief) */}
          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[2rem] border border-[#F3E8EE] shadow-soft space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tint-mint text-emerald-800 flex items-center justify-center font-bold text-sm shadow-soft shrink-0">
                3
              </div>
              <div>
                <h4 className="font-serif font-bold text-ink text-sm sm:text-base">
                  {language === 'hi' ? 'चिट्ठी (Doctor Brief) · 1-पेज सारांश' : 'Doctor Brief (Chitthi) · 1-Page Summary'}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {language === 'hi' ? 'FIGO / ACOG क्लिनिकल मानक' : 'FIGO / ACOG Grounded · No Hallucination'}
                </span>
              </div>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {language === 'hi'
                ? 'डॉक्टर से बात करने के लिए 1-क्लिक में 1-पेज चिट्ठी और PDF बनाएं। यह सिर्फ आपके लॉग किए गए असली तथ्यों को दिखाती है—कोई मनगढ़ंत डेटा नहीं।'
                : 'Generate a print-ready 1-page clinical sheet for your doctor appointment. FIGO-grounded observations restate only what you actually logged; self-reported answers remain clearly marked as unverified estimates.'}
            </p>
          </div>

          {/* Step 4: Privacy & Zero Cloud */}
          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[2rem] border border-[#F3E8EE] shadow-soft space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tint-peach text-amber-900 flex items-center justify-center font-bold text-sm shadow-soft shrink-0">
                4
              </div>
              <div>
                <h4 className="font-serif font-bold text-ink text-sm sm:text-base">
                  {language === 'hi' ? 'प्राइवेसी और डेटा बैकअप' : 'Privacy & Full Data Ownership'}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  {language === 'hi' ? 'JSON डाउनलोड और डिलीट' : 'IndexedDB · Export / Clear Anytime'}
                </span>
              </div>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {language === 'hi'
                ? 'आपका डेटा सिर्फ आपके इसी फोन/ब्राउज़र में है। सेटिंग्स से कभी भी सारा डेटा JSON फाइल में डाउनलोड करें या एक क्लिक में सारा डेटा मिटाएं।'
                : 'Your health history is strictly in your hands. Head to Settings anytime to export a full JSON backup of your records or wipe local storage with one click.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. PWA Installation Instructions (Platform Specific) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-[2.25rem] p-6 sm:p-7 border border-[#F3E8EE] shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8EE] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint-lavender px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                Installation Guide
              </span>
              <span className="text-[11px] text-ink-muted">Progressive Web App (PWA)</span>
            </div>
            <h3 className="font-serif font-bold text-ink text-lg sm:text-xl mt-1">
              {language === 'hi' ? 'फ़ोन या कंप्यूटर पर ऐप कैसे इंस्टॉल करें' : 'How to Install Cyculus on Your Device'}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {language === 'hi'
                ? 'होम स्क्रीन पर जोड़ें ताकि यह बिना इंटरनेट भी एक सामान्य ऐप की तरह खुले।'
                : 'Add to your home screen to launch full-screen and access offline anytime.'}
            </p>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="flex bg-tint-lavender/40 rounded-full p-1 border border-[#E7DCF8] text-xs shrink-0">
            <button
              type="button"
              onClick={() => setActivePlatform('ios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activePlatform === 'ios'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone / iOS</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePlatform('android')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activePlatform === 'android'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePlatform('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activePlatform === 'desktop'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Desktop / Mac</span>
            </button>
          </div>
        </div>

        {/* Platform Step Contents */}
        {activePlatform === 'ios' && (
          <div className="space-y-3 text-xs animate-fade-in">
            <div className="p-4 bg-tint-rose/30 rounded-2xl border border-[#F8DDE5] space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed text-ink">
                  {language === 'hi'
                    ? 'Safari ब्राउज़र में नीचे दिए गए **शेयर बटन** (Square with Arrow ⎋) पर टैप करें।'
                    : 'Open in **Safari**, then tap the **Share** icon (a square with an upward arrow ⎋) in the bottom toolbar.'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed text-ink">
                  {language === 'hi'
                    ? 'सूची में नीचे स्क्रॉल करें और **"Add to Home Screen"** (+ चिह्न) चुनें।'
                    : 'Scroll down the share options and tap **"Add to Home Screen"** (+ icon).'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p className="leading-relaxed text-ink">
                  {language === 'hi'
                    ? 'ऊपरी दाएँ कोने में **"Add"** पर टैप करें। साइकुलस आपके होम स्क्रीन पर ऐप की तरह जुड़ जाएगा!'
                    : 'Tap **"Add"** in the top right corner. Cyculus will now launch with its custom icon in fullscreen standalone mode.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activePlatform === 'android' && (
          <div className="space-y-3 text-xs animate-fade-in">
            <div className="p-4 bg-tint-lavender/30 rounded-2xl border border-[#E7DCF8] space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed text-ink">
                  {language === 'hi'
                    ? 'Chrome या Brave ब्राउज़र में ऊपर दाएँ कोने में **तीन बिंदुओं (⋮)** पर टैप करें।'
                    : 'In **Chrome** or **Brave**, tap the **three dots menu (⋮)** in the top right corner.'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed text-ink">
                  {language === 'hi'
                    ? '**"Install app"** या **"Add to Home screen"** विकल्प पर टैप करें।'
                    : 'Tap **"Install app"** or **"Add to Home screen"** from the browser menu.'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p className="leading-relaxed text-ink">
                  {language === 'hi'
                    ? 'पुष्टि करें। ऐप बिना ब्राउज़र एड्रेस बार के सीधे फ़ोन में इंस्टॉल हो जाएगा।'
                    : 'Confirm the prompt. Cyculus will be installed to your device app drawer with full offline caching.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activePlatform === 'desktop' && (
          <div className="space-y-3 text-xs animate-fade-in">
            <div className="p-4 bg-tint-mint/30 rounded-2xl border border-[#D8F0E4] space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed text-ink">
                  {language === 'hi'
                    ? 'Chrome, Edge या Brave ब्राउज़र में एड्रेस बार के दाएँ कोने में **इंस्टॉल आइकन** (⊕) देखें।'
                    : 'In **Chrome, Edge, or Brave**, look for the **Install icon** (⊕ or app computer icon) in the right side of the address bar.'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed text-ink">
                  {language === 'hi'
                    ? '**"Install Cyculus"** पर क्लिक करें। ऐप एक अलग, विचलित-रहित विंडो में खुलेगा।'
                    : 'Click **"Install"**. Cyculus opens as an independent native window on your desktop with keyboard shortcuts.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Hackathon Evaluation Personas Callout (Judges / Testing) */}
      {onLoadPersona && (
        <div className="bg-tint-rose/40 rounded-[2rem] p-5 sm:p-6 border border-[#F8DDE5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {language === 'hi' ? 'परीक्षण उपकरण (Hackathon Judges)' : 'Hackathon Evaluation Tool'}
              </span>
            </div>
            <h4 className="font-serif font-bold text-ink text-sm sm:text-base">
              {language === 'hi' ? '6 महीने का डेमो डेटा लोड करें' : 'Explore with Preloaded Evaluation Logs'}
            </h4>
            <p className="text-xs text-ink-muted">
              {language === 'hi'
                ? 'ऐप को टेस्ट करने के लिए: अनियमित पीरियड (Riya), नियमित पीरियड या हैवी फ्लो का डेटा तुरंत लोड करें।'
                : 'Instantly populate 6 months of realistic longitudinal entries to evaluate cycle shrinkage and clinician brief generation.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLoadPersona('riya')}
              className="rounded-full shadow-pill text-xs bg-white/90 border-[#E7DCF8]"
            >
              ✨ Riya (Irregular)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLoadPersona('regular')}
              className="rounded-full shadow-pill text-xs bg-white/90 border-[#D8F0E4]"
            >
              🌿 Regular
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
