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
  const [activeTab, setActiveTab] = useState<Tab>('ooflog');
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
    setActiveTab('ooflog');
    setToastMessage(
      language === 'hi'
        ? 'शुरुआती अंदाज़ा सेव हो गया! अब आज का दिन लॉग करें।'
        : 'Initial cycle baseline saved! Now log your first day.'
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
          ? 'डेमो डेटा हटा दिया गया और आपकी एंट्री सेव हो गई!'
          : 'Demo data removed. Your real health entry has been saved!'
      );
    }
    return savePatch(patch, source, rawText);
  };

  // Skip setup directly to logging first day
  const handleSkipSetup = () => {
    localStorage.setItem('cyculus_onboarding_done', 'true');
    setShowOnboarding(false);
    setActiveTab('ooflog');
    setToastMessage(
      language === 'hi'
        ? 'स्वागत है! आज कैसा रहा, लिखकर या बोलकर बताएं।'
        : 'Welcome! Tell us about today to start your diary.'
    );
  };

  const requestSeedPersona = (type: 'riya' | 'regular' | 'heavy') => {
    if (type === 'riya') {
      setConfirmPersonaSeed({
        type: 'riya',
        name: 'Riya (Irregular / 41-day cycle)',
        description: language === 'hi'
          ? '41 दिन का लंबा चक्र, 27 से 41 दिन का भारी उतार-चढ़ाव और FIGO cycle_long फ़्लैग का उदाहरण।'
          : 'Demonstrates a 41-day cycle, high cycle variability (27–41 days), and FIGO cycle_long clinical flag.',
        daysCount: (irregularData as LogEntry[]).length
      });
    } else if (type === 'heavy') {
      setConfirmPersonaSeed({
        type: 'heavy',
        name: 'Heavy Menstrual Bleeding',
        description: language === 'hi'
          ? 'हर पीरियड में 4+ दिन हैवी फ्लो और तेज़ क्रैम्प्स (दर्द 8/10), NICE व ACOG फ़्लैग का उदाहरण।'
          : 'Demonstrates 4+ heavy bleeding days per cycle and severe dysmenorrhea (pain 8/10), triggering NICE/ACOG heavy flow flag.',
        daysCount: (heavyData as LogEntry[]).length
      });
    } else {
      setConfirmPersonaSeed({
        type: 'regular',
        name: 'Regular Cycles Baseline',
        description: language === 'hi'
          ? '28–29 दिन का नियमित पीरियड, बिल्कुल सामान्य गैप और कोई क्लिनिकल फ़्लैग नहीं।'
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
        ? 'डेमो डेटा हटा दिया गया। अब डायरी एकदम खाली और आपकी अपनी है।'
        : 'Demo data removed. Returned to clean, private diary.'
    );
  };

  const handleClearAll = async () => {
    await clearAllLogs();
    localStorage.removeItem('cyculus_demo_persona');
    setDemoPersona(null);
  };

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
                  {language === 'hi' ? 'डेमो डेटा' : 'Seed Demo Data'}
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-ink mt-0.5">
                  {language === 'hi' ? 'क्या आप डेमो डेटा लोड करना चाहते हैं?' : 'Load Demonstration Persona?'}
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
                ? 'इससे आपके फोन/ब्राउज़र में टेस्ट करने के लिए डेमो डेटा लोड हो जाएगा ताकि आप देख सकें कि डॉक्टर की चिट्ठी और टाइमलाइन कैसी दिखती है। आप इसे कभी भी हटा सकते हैं।'
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

          {/* Desktop Navigation Links (Main Path: 3 Core Jobs) */}
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
                <span className="block font-bold">Dayum</span>
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
          </nav>
        </div>

        {/* Secondary Utility: Quiet Settings Link (Pushed out of main path) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer text-left ${activeTab === 'settings'
                ? 'bg-tint-lavender text-primary font-bold shadow-soft border border-[#E7DCF8]'
                : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/40'
              }`}
          >
            <Settings className="w-4 h-4 text-ink-muted shrink-0" />
            <div className="min-w-0">
              <span className="block font-semibold truncate">{language === 'hi' ? 'सेटिंग्स व डेटा' : 'Settings & Privacy'}</span>
              <span className="text-[10px] block text-ink-muted truncate">
                {language === 'hi' ? '100% ऑन-डिवाइस' : '100% On-Device'}
              </span>
            </div>
          </button>

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
                {activeTab === 'home' && (language === 'hi' ? 'Dayum · पीरियड टाइमलाइन' : 'Dayum · cycle timeline')}
                {activeTab === 'brief' && (language === 'hi' ? 'Doctor Brief · क्लिनिकल चिट्ठी' : 'Doctor Brief · chitthi')}
                {activeTab === 'settings' && (language === 'hi' ? 'सेटिंग्स · प्राइवेसी और डेटा' : 'Settings · privacy & data')}
              </span>
              <span className="text-ink-muted/50">•</span>
              <span className="text-[11px] text-ink-muted font-medium bg-white/70 px-2.5 py-0.5 rounded-full border border-surface-border">
                {todayStr}
              </span>
              {currentCycleDay !== null && (
                <span className="text-[11px] font-bold text-primary bg-tint-lavender/60 px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                  🌸 Day {currentCycleDay}
                </span>
              )}
            </div>

            {/* Right Controls: Storage Badge, Language Toggle & Quiet Settings */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-tint-lavender/60 px-3 py-1 rounded-full border border-[#E7DCF8]">
                <span>🔒 100% On-Device</span>
              </div>

              {/* Language toggle stays visible */}
              <LanguageToggle
                language={language}
                onToggle={setLanguage}
              />

              {/* Quiet Settings button pushed out of main path */}
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                aria-label={language === 'hi' ? 'सेटिंग्स और डेटा' : 'Settings & Privacy'}
                title={language === 'hi' ? 'सेटिंग्स और डेटा' : 'Settings & Privacy'}
                className={`p-2 rounded-full border transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                  activeTab === 'settings'
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-white/90 text-ink-muted hover:text-ink hover:bg-surface-subtle border-surface-border shadow-pill'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
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
                      {language === 'hi' ? 'डेमो डेटा चालू है' : 'Demo Data Active'}
                    </span>
                    <span className="text-xs sm:text-sm font-serif font-bold text-ink">
                      {demoPersona}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">
                    {language === 'hi'
                      ? 'टेस्टिंग के लिए डेमो डेटा लोड है। आप इसे कभी भी हटा सकते हैं:'
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

          {/* Active Tab Screen: One Job Per Screen */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              <DayumScreen
                logs={logs}
                language={language}
                onNavigateToLog={() => setActiveTab('ooflog')}
                onOpenSettings={() => setActiveTab('settings')}
              />
            </div>
          )}

          {activeTab === 'ooflog' && (
            <div className="space-y-4">
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
              onNavigateToLog={() => setActiveTab('ooflog')}
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

      {/* MOBILE / PHONE BOTTOM NAVIGATION BAR (Main Path: 3 Core Jobs) */}
      <nav className="print:hidden lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-xl border-t border-[#F0E6EE] px-4 py-2 shadow-sheet safe-area-bottom">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
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
            <span className="text-[11px] mt-1 font-semibold tracking-tight">
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
            <span className="text-[11px] mt-1 font-semibold tracking-tight">
              {language === 'hi' ? 'चक्र' : 'Cycle'}
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
            <span className="text-[11px] mt-1 font-semibold tracking-tight">
              {language === 'hi' ? 'चिट्ठी' : 'Brief'}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
