import React, { useState, useEffect, useMemo } from 'react';
import { useLogs } from '@/modules/capture/useLogs';
import { OofLog } from '@/modules/capture/OofLog';
import { DayumScreen } from '@/modules/insights';
import { BriefScreen } from '@/modules/brief/BriefScreen';
import { SettingsView } from './SettingsView';
import { LanguageToggle } from './components/LanguageToggle';
import { Toast } from './components/Toast';
import { OnboardingModal } from './OnboardingModal';
import { BotanicalAccent } from './components/BotanicalAccent';
import { Calendar, PlusCircle, FileText, Settings, ShieldCheck, Trash2 } from 'lucide-react';
import { DayPatch, LogEntry, UserSetup } from '@/shared/types';
import knowledgeData from '@/shared/knowledge.json';
import { computeInsights, calculateCurrentCycleDay } from '@/modules/insights';
import irregularData from '@/shared/mocks/entries.irregular.json';
import regularData from '@/shared/mocks/entries.regular.json';
import heavyData from '@/shared/mocks/entries.heavy.json';

export type Tab = 'home' | 'ooflog' | 'brief' | 'settings';

export const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [demoPersona, setDemoPersona] = useState<string | null>(() => localStorage.getItem('cyculus_demo_persona'));
  const [confirmPersonaSeed, setConfirmPersonaSeed] = useState<{
    type: 'riya' | 'regular' | 'heavy';
    name: string;
    description: string;
    daysCount: number;
  } | null>(null);

  const {
    logs,
    userSetup,
    todayLog,
    savePatch,
    saveSetup,
    clearSetup,
    clearAllLogs,
    clearLogsOnly,
    seedPersona,
    exportJson
  } = useLogs();

  const todayStr = new Date().toISOString().split('T')[0];

  // Pure Module B engine evaluation
  const insights = useMemo(() => {
    return computeInsights(logs, knowledgeData as any, todayStr);
  }, [logs, todayStr]);

  // Current cycle day relative to latest bleeding start or self-reported start
  const latestStart = insights.cycles.length > 0
    ? insights.cycles[insights.cycles.length - 1].startDate
    : userSetup?.lastPeriodStart;
  const currentCycleDay = latestStart ? calculateCurrentCycleDay(latestStart, todayStr) : null;

  // Check onboarding status
  useEffect(() => {
    const done = localStorage.getItem('cyculus_onboarding_done');
    if (!done) {
      setShowOnboarding(true);
    }
  }, []);

  // When saving setup prior (writes to separate userSetup table, NEVER writes fake logs)
  const handleSaveSetup = async (setup: UserSetup) => {
    // If mock demo persona is active, wipe all mock logs so the user starts fresh with their own setup!
    if (demoPersona || localStorage.getItem('cyculus_demo_persona')) {
      await clearLogsOnly();
      localStorage.removeItem('cyculus_demo_persona');
      setDemoPersona(null);
    }
    await saveSetup(setup);
    localStorage.setItem('cyculus_onboarding_done', 'true');
    setShowOnboarding(false);
    setToastMessage(
      language === 'hi'
        ? 'आरंभिक चक्र सेटअप सहेजा गया! यह प्रायर के रूप में कार्य करेगा।'
        : 'Cycle prior saved! Real logs will refine predictions with shrinkage.'
    );
  };

  // When saving a real log entry from OofLog (tap check-in or natural text confirmation)
  const handleSavePatch = async (
    patch: DayPatch,
    source: 'tap' | 'text' | 'voice',
    rawText?: string
  ): Promise<LogEntry> => {
    // If mock demo persona is active, wipe mock persona logs before writing user's own data!
    if (demoPersona || localStorage.getItem('cyculus_demo_persona')) {
      await clearLogsOnly();
      localStorage.removeItem('cyculus_demo_persona');
      setDemoPersona(null);
      setToastMessage(
        language === 'hi'
          ? 'डेमो डेटा हटा दिया गया और आपकी वास्तविक प्रविष्टि सहेजी गई!'
          : 'Demo data removed. Your real health entry has been saved!'
      );
    }
    return savePatch(patch, source, rawText);
  };

  // Skip setup
  const handleSkipSetup = () => {
    localStorage.setItem('cyculus_onboarding_done', 'true');
    setShowOnboarding(false);
  };

  const requestSeedPersona = (type: 'riya' | 'regular' | 'heavy') => {
    if (type === 'riya') {
      setConfirmPersonaSeed({
        type: 'riya',
        name: 'Riya (Irregular / 41-day cycle)',
        description: language === 'hi'
          ? '41-दिन का लंबा चक्र, उच्च चक्र परिवर्तनशीलता (27–41 दिन) और FIGO cycle_long फ़्लैग का प्रदर्शन।'
          : 'Demonstrates a 41-day cycle, high cycle variability (27–41 days), and FIGO cycle_long clinical flag.',
        daysCount: (irregularData as LogEntry[]).length
      });
    } else if (type === 'heavy') {
      setConfirmPersonaSeed({
        type: 'heavy',
        name: 'Heavy Menstrual Bleeding',
        description: language === 'hi'
          ? 'प्रति चक्र 4+ भारी रक्तस्राव दिवस एवं तीव्र कष्टार्तव (दर्द 8/10), NICE व ACOG फ़्लैग का प्रदर्शन।'
          : 'Demonstrates 4+ heavy bleeding days per cycle and severe dysmenorrhea (pain 8/10), triggering NICE/ACOG heavy flow flag.',
        daysCount: (heavyData as LogEntry[]).length
      });
    } else {
      setConfirmPersonaSeed({
        type: 'regular',
        name: 'Regular Cycles Baseline',
        description: language === 'hi'
          ? 'नियमित 28–29 दिन के चक्र, निम्न परिवर्तनशीलता, कोई क्लिनिकल फ़्लैग नहीं।'
          : 'Demonstrates consistent 28–29 day physiological rhythms with low variability and 0 clinical flags.',
        daysCount: (regularData as LogEntry[]).length
      });
    }
  };

  const handleConfirmSeed = async () => {
    if (!confirmPersonaSeed) return;
    const { type, name } = confirmPersonaSeed;
    let data: LogEntry[];
    if (type === 'riya') data = irregularData as LogEntry[];
    else if (type === 'heavy') data = heavyData as LogEntry[];
    else data = regularData as LogEntry[];

    await seedPersona(data);
    localStorage.setItem('cyculus_demo_persona', name);
    setDemoPersona(name);
    setConfirmPersonaSeed(null);
    setToastMessage(
      language === 'hi'
        ? `${name} का 6 महीने का डेमो डेटा लोड किया गया!`
        : `Loaded 6 months of demo data for ${name}!`
    );
  };

  const handleRemoveDemoData = async () => {
    await clearAllLogs();
    localStorage.removeItem('cyculus_demo_persona');
    setDemoPersona(null);
    setToastMessage(
      language === 'hi'
        ? 'डेमो डेटा हटा दिया गया। अब डायरी पूरी तरह से साफ़ है।'
        : 'Demo data removed. Returned to clean, private diary.'
    );
  };

  const handleClearAll = async () => {
    await clearAllLogs();
    localStorage.removeItem('cyculus_demo_persona');
    setDemoPersona(null);
  };

  const isFreshBrowser = logs.length === 0 && !userSetup;

  return (
    <div className="min-h-screen bg-surface-bg flex font-sans selection:bg-primary-soft selection:text-ink">
      {/* Onboarding / Setup Modal */}
      {showOnboarding && (
        <OnboardingModal
          language={language}
          initialSetup={userSetup}
          onSaveSetup={handleSaveSetup}
          onSkip={handleSkipSetup}
        />
      )}

      {/* Confirm Demo Seeding Modal */}
      {confirmPersonaSeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-7 shadow-modal border border-[#F3E8EE] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-tint-peach flex items-center justify-center text-primary text-xl shadow-soft border border-[#FADCD0] shrink-0">
                ✨
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint-lavender px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                  {language === 'hi' ? 'डेमो डेटा लोड' : 'Seed Demo Data'}
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-ink mt-0.5">
                  {language === 'hi' ? 'क्या आप डेमो डेटा लोड करना चाहती हैं?' : 'Load Demonstration Persona?'}
                </h3>
              </div>
            </div>

            <div className="p-4 bg-tint-lavender/30 rounded-2xl border border-[#E7DCF8] space-y-2 text-xs">
              <div className="font-bold text-ink text-sm">
                {confirmPersonaSeed.name}
              </div>
              <p className="text-ink-muted leading-relaxed">
                {confirmPersonaSeed.description}
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-primary">
                <span>📊 {confirmPersonaSeed.daysCount} longitudinal days</span>
                <span>•</span>
                <span>6 complete cycles</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>⚠️ {language === 'hi' ? 'कृपया ध्यान दें:' : 'Notice:'}</strong>{' '}
              {language === 'hi'
                ? 'यह क्रिया आपके ब्राउज़र में डेमो डेटा लोड करेगी ताकि आप क्लिनिकल अंतर्दृष्टि का परीक्षण कर सकें। आप कभी भी "डेमो डेटा हटाएं" बटन से इसे साफ़ कर सकती हैं।'
                : 'This will seed mock entries into your local IndexedDB for clinical rule evaluation. A persistent banner will allow you to remove it at any time.'}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPersonaSeed(null)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-ink-muted hover:text-ink hover:bg-tint-lavender/50 transition-all cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmSeed}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-soft transition-all cursor-pointer active:scale-95"
              >
                {language === 'hi' ? 'हाँ, डेमो डेटा लोड करें' : 'Confirm & Load Persona'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* DESKTOP SIDEBAR (Visible only on desktop/laptop screens >= 1024px) */}
      <aside className="print:hidden hidden lg:flex flex-col w-64 lg:w-72 shrink-0 bg-white/75 backdrop-blur-xl border-r border-[#F3E8EE] p-5 lg:p-6 justify-between min-h-screen sticky top-0 z-30">
        <div className="space-y-7">
          {/* Brand Logo & Tagline */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-tint-lavender flex items-center justify-center text-primary shadow-pill border border-[#E7DCF8] shrink-0">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <h1 className="text-2xl font-serif text-ink tracking-tight leading-tight">
                Cyculus
              </h1>
              <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                {language === 'hi' ? 'स्वास्थ्य को सरल बनाएं' : 'Making health make sense.'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="space-y-2">
            {/* OofLog (Daily Check-in) */}
            <button
              type="button"
              onClick={() => setActiveTab('ooflog')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === 'ooflog'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/50'
                }`}
            >
              <PlusCircle className={`w-4 h-4 ${activeTab === 'ooflog' ? 'stroke-[2.5]' : ''}`} />
              <div>
                <span className="block font-bold">OofLog</span>
                <span className={`text-[10px] block ${activeTab === 'ooflog' ? 'text-white/80' : 'text-ink-muted'}`}>
                  {language === 'hi' ? 'आज कैसा रहा' : 'aaj kaisa raha'}
                </span>
              </div>
            </button>

            {/* Dayum (Cycle Timeline) */}
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === 'home'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/50'
                }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
              <div>
                <span className="block font-bold">
                  {isFreshBrowser ? (language === 'hi' ? 'गाइड व Dayum' : 'Guide & Dayum') : 'Dayum'}
                </span>
                <span className={`text-[10px] block ${activeTab === 'home' ? 'text-white/80' : 'text-ink-muted'}`}>
                  {language === 'hi' ? 'चक्र टाइमलाइन' : 'cycle timeline'}
                </span>
              </div>
            </button>

            {/* Doctor Brief (Chitthi) */}
            <button
              type="button"
              onClick={() => setActiveTab('brief')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === 'brief'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/50'
                }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'brief' ? 'stroke-[2.5]' : ''}`} />
              <div>
                <span className="block font-bold">Doctor Brief</span>
                <span className={`text-[10px] block ${activeTab === 'brief' ? 'text-white/80' : 'text-ink-muted'}`}>
                  {language === 'hi' ? 'क्लिनिकल चिट्ठी' : 'clinical chitthi'}
                </span>
              </div>
            </button>

            {/* Settings & Privacy */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === 'settings'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/50'
                }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
              <div>
                <span className="block font-bold">{language === 'hi' ? 'गोपनीयता व सेटिंग्स' : 'Privacy & Settings'}</span>
                <span className={`text-[10px] block ${activeTab === 'settings' ? 'text-white/80' : 'text-ink-muted'}`}>
                  {language === 'hi' ? '100% ऑन-डिवाइस डेटा' : 'Zero-Cloud & Data'}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Card */}
        <div className="bg-tint-rose/40 rounded-3xl p-4 border border-[#F8DDE5] relative overflow-hidden">
          <div className="absolute -bottom-4 -right-4 pointer-events-none opacity-40">
            <BotanicalAccent className="w-24 h-24 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-serif font-bold text-ink leading-snug">
              {language === 'hi'
                ? 'आपका स्वास्थ्य। आपके सवाल। पूर्ण गोपनीयता।'
                : 'Your health. Your questions. Our priority.'}
            </p>
            <p className="text-[10px] text-ink-muted mt-1">
              100% on-device · Zero cloud
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline Ready PWA</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="print:hidden sticky top-0 z-40 bg-surface-bg/85 backdrop-blur-md border-b border-surface-border px-4 sm:px-6 py-3 transition-all">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            {/* Mobile Branding (Hidden on desktop) */}
            <div className="lg:hidden flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-tint-lavender flex items-center justify-center text-primary shadow-pill border border-[#E7DCF8]">
                <span className="text-base">🌸</span>
              </div>
              <div>
                <h1 className="text-xl font-serif text-ink tracking-tight leading-none">
                  Cyculus
                </h1>
                <p className="text-[10px] text-ink-muted mt-0.5">
                  {language === 'hi' ? 'प्राइवेट चक्र डायरी' : 'Private Cycle Diary'}
                </p>
              </div>
            </div>

            {/* Desktop Breadcrumb / Tab Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="font-serif font-bold text-ink text-base">
                {activeTab === 'ooflog' && (language === 'hi' ? 'OofLog · आज कैसा रहा' : 'OofLog · aaj kaisa raha')}
                {activeTab === 'home' && (isFreshBrowser ? (language === 'hi' ? 'गाइड · PWA निर्देश' : 'Guide · PWA Instructions') : (language === 'hi' ? 'Dayum · चक्र टाइमलाइन' : 'Dayum · cycle timeline'))}
                {activeTab === 'brief' && (language === 'hi' ? 'Doctor Brief · क्लिनिकल चिट्ठी' : 'Doctor Brief · chitthi')}
                {activeTab === 'settings' && (language === 'hi' ? 'सेटिंग्स · गोपनीयता व डेटा' : 'Settings · privacy & data')}
              </span>
              <span className="text-ink-muted/50">•</span>
              <span className="text-[11px] text-ink-muted font-medium bg-white/70 px-2.5 py-0.5 rounded-full border border-surface-border">
                {todayStr}
              </span>
            </div>

            {/* Right Controls: Storage Badge & Language Toggle */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-tint-lavender/60 px-3 py-1 rounded-full border border-[#E7DCF8]">
                <span>🔒 100% On-Device</span>
              </div>

              <LanguageToggle
                language={language}
                onToggle={setLanguage}
              />
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12 transition-all">
          {/* Persistent Demo Data Banner (Flag stored outside LogEntry in localStorage) */}
          {demoPersona && (
            <div className="print:hidden mb-6 p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-400/50 backdrop-blur-md shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-ink">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-900 border border-amber-400/30 flex items-center justify-center shrink-0 text-lg shadow-soft">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300">
                      {language === 'hi' ? 'डेमो डेटा सक्रिय' : 'Demo Data Active'}
                    </span>
                    <span className="text-xs sm:text-sm font-serif font-bold text-ink">
                      {demoPersona}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">
                    {language === 'hi'
                      ? 'सिंथेटिक डेमो डेटा लोड है (फ्लैग LogEntry के बाहर localStorage में सुरक्षित)। कभी भी हटाएं:'
                      : 'Mock longitudinal logs loaded for testing. Flag stored strictly outside LogEntry in localStorage.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleRemoveDemoData}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 shadow-soft transition-all cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>{language === 'hi' ? 'डेमो डेटा हटाएं' : 'Remove Demo Data'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Ambient Welcome Banner - When new browser with no profile set, no name is shown, just clear PWA guidance */}
          <div className="print:hidden bg-gradient-to-r from-tint-rose/40 via-white/80 to-tint-lavender/40 border border-[#F3E8EE] rounded-[2.25rem] p-6 sm:p-7 relative overflow-hidden mb-6 shadow-card">
            <div className="absolute top-0 right-0 pointer-events-none opacity-60">
              <BotanicalAccent className="w-36 h-36 lg:w-44 lg:h-44 text-primary" />
            </div>

            {isFreshBrowser ? (
              <div className="relative z-10 max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint-lavender px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                    {language === 'hi' ? '🌸 नया ब्राउज़र · शून्य क्लाउड PWA' : '🌸 New Browser · Zero-Cloud PWA'}
                  </span>
                  <span className="text-[11px] text-ink-muted bg-white/80 px-2.5 py-0.5 rounded-full border border-[#F3E8EE]">
                    {language === 'hi' ? 'कोई प्रोफ़ाइल सेट नहीं (अनाम)' : 'No Profile Set (Private & Anonymous)'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-bold">
                  {language === 'hi' ? 'साइकुलस PWA · ऑफ़लाइन स्वास्थ्य डायरी' : 'Cyculus PWA · Offline Health Diary'}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
                  {language === 'hi'
                    ? 'कोई खाता, प्रोफ़ाइल या नाम आवश्यक नहीं है। आपका व्यक्तिगत स्वास्थ्य डेटा 100% केवल इस ब्राउज़र में रहता है। नीचे उपयोग निर्देश एवं इंस्टॉलेशन गाइड देखें।'
                    : 'No account, profile, or name required. Your health data stays 100% inside this browser. Follow the instructions and PWA usage guide below.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${activeTab === 'home'
                        ? 'bg-primary text-white border-primary shadow-soft'
                        : 'bg-white/90 text-primary border-[#E7DCF8] hover:bg-tint-lavender/50'
                      }`}
                  >
                    📖 {language === 'hi' ? 'PWA उपयोग निर्देश देखें' : 'View PWA Instructions & Guide'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ooflog')}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${activeTab === 'ooflog'
                        ? 'bg-primary text-white border-primary shadow-soft'
                        : 'bg-white/90 text-primary border-[#E7DCF8] hover:bg-tint-lavender/50'
                      }`}
                  >
                    ✍️ {language === 'hi' ? 'आज का चेक-इन (OofLog · आज कैसा रहा)' : 'Log Today (OofLog · aaj kaisa raha)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 max-w-lg">
                <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
                  {language === 'hi' ? 'नमस्ते, साइकुलस में आपका स्वागत है 👋' : 'Hey there, welcome to Cyculus 👋'}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
                  {language === 'hi'
                    ? 'आज आप कैसा महसूस कर रही हैं? बोलें या 1-टैप से दर्ज करें।'
                    : 'What would you like to log or explore today? Speak naturally or tap below.'}
                </p>
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {currentCycleDay !== null ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-white/90 px-3 py-1 rounded-full border border-[#E7DCF8] shadow-soft">
                      🌸 Cycle Day {currentCycleDay}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-white/90 px-3 py-1 rounded-full border border-[#E7DCF8] shadow-soft">
                      🌸 Longitudinal Cycle Diary
                    </span>
                  )}
                  <span className="text-[11px] text-ink-muted bg-white/70 px-2.5 py-1 rounded-full border border-surface-border">
                    {logs.length} days recorded
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Active Tab Screen */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {isFreshBrowser && (
                <div className="p-4 rounded-3xl bg-tint-lavender/40 border border-[#E7DCF8] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-ink">
                    <span className="text-base">🌸</span>
                    <span className="font-medium">
                      {language === 'hi'
                        ? 'कोई डेटा नहीं मिला। आप सीधे आज का लक्षण लॉग कर सकती हैं या नीचे डेमो प्रोफाइल आज़मा सकती हैं।'
                        : 'No logs recorded yet. Start logging symptoms or test with demonstration personas.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => requestSeedPersona('riya')}
                      className="px-3.5 py-1.5 rounded-full bg-white text-primary font-bold border border-[#E7DCF8] hover:bg-primary hover:text-white shadow-soft transition-all cursor-pointer"
                    >
                      ✨ {language === 'hi' ? 'रिया का डेटा लोड करें' : 'Try Riya Persona'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ooflog')}
                      className="px-3.5 py-1.5 rounded-full bg-primary text-white font-bold shadow-soft hover:bg-primary-dark transition-all cursor-pointer"
                    >
                      ✍️ {language === 'hi' ? 'आज का चेक-इन' : 'Log Today'}
                    </button>
                  </div>
                </div>
              )}
              <DayumScreen
                logs={logs}
                language={language}
                onNavigateToLog={() => setActiveTab('ooflog')}
              />
            </div>
          )}

          {activeTab === 'ooflog' && (
            <div className="space-y-4">
              {isFreshBrowser && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-tint-lavender/50 border border-[#E7DCF8] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-ink">
                    <span className="text-base">🌸</span>
                    <span>
                      {language === 'hi'
                        ? 'नया ब्राउज़र: कोई प्रोफ़ाइल सेट नहीं है। आप सीधे आज का लक्षण लॉग कर सकती हैं या PWA गाइड देख सकती हैं।'
                        : 'New browser: No profile is set. You can start logging directly or explore the PWA guide.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="font-bold text-primary hover:underline shrink-0 cursor-pointer"
                  >
                    {language === 'hi' ? 'PWA गाइड देखें →' : 'View PWA Guide →'}
                  </button>
                </div>
              )}
              <OofLog
                todayDate={todayStr}
                existingEntry={demoPersona ? undefined : todayLog}
                language={language}
                onSavePatch={handleSavePatch}
                onSuccessToast={msg => setToastMessage(msg)}
              />
            </div>
          )}

          {activeTab === 'brief' && (
            <BriefScreen
              insights={insights}
              entries={logs}
              knowledge={knowledgeData.rules as any}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              language={language}
              logsCount={logs.length}
              userSetup={userSetup}
              demoPersona={demoPersona}
              onClearSetup={clearSetup}
              onRequestSeedPersona={requestSeedPersona}
              onRemoveDemoData={handleRemoveDemoData}
              onExportJson={exportJson}
              onClearAll={handleClearAll}
              onToast={msg => setToastMessage(msg)}
              onOpenSetup={() => setShowOnboarding(true)}
            />
          )}
        </main>
      </div>

      {/* MOBILE / PHONE BOTTOM NAVIGATION BAR (Visible on all phone & tablet screens < lg) */}
      <nav className="print:hidden lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-xl border-t border-[#F0E6EE] px-3 py-2 shadow-sheet safe-area-bottom">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5">
          {/* Log / Check-in */}
          <button
            type="button"
            onClick={() => setActiveTab('ooflog')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[50px] transition-all cursor-pointer active:scale-95 ${activeTab === 'ooflog'
                ? 'bg-tint-lavender text-primary font-bold shadow-soft'
                : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/30'
              }`}
          >
            <PlusCircle className={`w-5 h-5 ${activeTab === 'ooflog' ? 'stroke-[2.5] text-primary fill-primary-soft' : ''}`} />
            <span className="text-[10px] mt-1 font-semibold tracking-tight">
              {language === 'hi' ? 'लॉग' : 'Log'}
            </span>
          </button>

          {/* Cycle Timeline */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[50px] transition-all cursor-pointer active:scale-95 ${activeTab === 'home'
                ? 'bg-tint-lavender text-primary font-bold shadow-soft'
                : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/30'
              }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5] text-primary' : ''}`} />
            <span className="text-[10px] mt-1 font-semibold tracking-tight">
              {isFreshBrowser ? (language === 'hi' ? 'गाइड' : 'Guide') : (language === 'hi' ? 'चक्र' : 'Cycle')}
            </span>
          </button>

          {/* Doctor Brief (Chitthi) */}
          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[50px] transition-all cursor-pointer active:scale-95 ${activeTab === 'brief'
                ? 'bg-tint-lavender text-primary font-bold shadow-soft'
                : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/30'
              }`}
          >
            <FileText className={`w-5 h-5 ${activeTab === 'brief' ? 'stroke-[2.5] text-primary' : ''}`} />
            <span className="text-[10px] mt-1 font-semibold tracking-tight">
              {language === 'hi' ? 'चिट्ठी' : 'Brief'}
            </span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[50px] transition-all cursor-pointer active:scale-95 ${activeTab === 'settings'
                ? 'bg-tint-lavender text-primary font-bold shadow-soft'
                : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/30'
              }`}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'stroke-[2.5] text-primary' : ''}`} />
            <span className="text-[10px] mt-1 font-semibold tracking-tight">
              {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
