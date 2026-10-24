import React, { useState, useEffect, useMemo } from 'react';
import { useLogs } from '@/modules/capture/useLogs';
import { OofLog } from '@/modules/capture/OofLog';
import { DayumScreen } from '@/modules/insights';
import { BriefPlaceholder } from '@/modules/brief/BriefPlaceholder';
import { SettingsView } from './SettingsView';
import { LanguageToggle } from './components/LanguageToggle';
import { Toast } from './components/Toast';
import { OnboardingModal } from './OnboardingModal';
import { BotanicalAccent } from './components/BotanicalAccent';
import { Calendar, PlusCircle, FileText, Settings, ShieldCheck } from 'lucide-react';
import { LogEntry, UserSetup } from '@/shared/types';
import knowledgeData from '@/shared/knowledge.json';
import { computeInsights, calculateCurrentCycleDay } from '@/modules/insights/computeInsights';
import irregularData from '@/shared/mocks/entries.irregular.json';
import regularData from '@/shared/mocks/entries.regular.json';
import heavyData from '@/shared/mocks/entries.heavy.json';

export type Tab = 'home' | 'ooflog' | 'brief' | 'settings';

export const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const {
    logs,
    userSetup,
    todayLog,
    savePatch,
    saveSetup,
    clearSetup,
    clearAllLogs,
    seedPersona,
    exportJson
  } = useLogs();

  const todayStr = new Date().toISOString().split('T')[0];

  // Pure Module B engine evaluation with setup prior shrinkage
  const insights = useMemo(() => {
    return computeInsights(logs, knowledgeData.rules as any, todayStr, userSetup);
  }, [logs, todayStr, userSetup]);

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
    await saveSetup(setup);
    localStorage.setItem('cyculus_onboarding_done', 'true');
    setShowOnboarding(false);
    setToastMessage(
      language === 'hi'
        ? 'आरंभिक चक्र सेटअप सहेजा गया! यह प्रायर के रूप में कार्य करेगा।'
        : 'Cycle prior saved! Real logs will refine predictions with shrinkage.'
    );
  };

  // Skip setup
  const handleSkipSetup = () => {
    localStorage.setItem('cyculus_onboarding_done', 'true');
    setShowOnboarding(false);
  };

  const handleLoadPersona = async (type: 'riya' | 'regular' | 'heavy') => {
    let data: LogEntry[];
    let personaName = '';
    if (type === 'riya') {
      data = irregularData as LogEntry[];
      personaName = 'Riya (Irregular)';
    } else if (type === 'heavy') {
      data = heavyData as LogEntry[];
      personaName = 'Heavy Bleeding';
    } else {
      data = regularData as LogEntry[];
      personaName = 'Regular Cycles';
    }
    await seedPersona(data);
    setToastMessage(
      language === 'hi'
        ? `${personaName} का डेमो डेटा लोड किया गया!`
        : `Loaded 6 months of data for ${personaName}!`
    );
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

      {/* Global Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* DESKTOP SIDEBAR (Visible only on desktop/laptop screens >= 1024px) */}
      <aside className="hidden lg:flex flex-col w-64 lg:w-72 shrink-0 bg-white/75 backdrop-blur-xl border-r border-[#F3E8EE] p-5 lg:p-6 justify-between min-h-screen sticky top-0 z-30">
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
            {/* OofLog (Daily Diary) */}
            <button
              type="button"
              onClick={() => setActiveTab('ooflog')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'ooflog'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/50'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${activeTab === 'ooflog' ? 'stroke-[2.5]' : ''}`} />
              <div>
                <span className="block font-bold">OofLog</span>
                <span className={`text-[10px] block ${activeTab === 'ooflog' ? 'text-white/80' : 'text-ink-muted'}`}>
                  {language === 'hi' ? 'दैनिक लक्षण डायरी' : 'Daily Symptom Diary'}
                </span>
              </div>
            </button>

            {/* Dayum (Cycle Tracker & PWA Guide) */}
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'home'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/50'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
              <div>
                <span className="block font-bold">
                  {isFreshBrowser ? 'Guide & Dayum' : 'Dayum'}
                </span>
                <span className={`text-[10px] block ${activeTab === 'home' ? 'text-white/80' : 'text-ink-muted'}`}>
                  {isFreshBrowser
                    ? (language === 'hi' ? 'PWA गाइड एवं निर्देश' : 'PWA Guide & Timeline')
                    : (language === 'hi' ? 'चक्र ट्रैकर व अनुमान' : 'Cycle Timeline & Window')}
                </span>
              </div>
            </button>

            {/* Doctor Brief (Chitthi) */}
            <button
              type="button"
              onClick={() => setActiveTab('brief')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'brief'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/50'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'brief' ? 'stroke-[2.5]' : ''}`} />
              <div>
                <span className="block font-bold">{language === 'hi' ? 'चिट्ठी (Doctor Brief)' : 'Doctor Brief'}</span>
                <span className={`text-[10px] block ${activeTab === 'brief' ? 'text-white/80' : 'text-ink-muted'}`}>
                  {language === 'hi' ? '1-पेज क्लिनिकल रिपोर्ट' : '1-Page Clinical Summary'}
                </span>
              </div>
            </button>

            {/* Settings & Privacy */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'settings'
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
      </header>

      {/* Main Content Area: Mobile-First with Desktop Scaling */}
      <main className="flex-1 max-w-md md:max-w-2xl lg:max-w-3xl w-full mx-auto p-4 sm:p-5 md:p-6 pb-24 md:pb-12 transition-all">
        {activeTab === 'home' && (
          <DayumScreen
            logs={logs}
            language={language}
            onNavigateToLog={() => setActiveTab('ooflog')}
          />
        )}

        {activeTab === 'ooflog' && (
          <OofLog
            todayDate={todayStr}
            existingEntry={todayLog}
            language={language}
            onSavePatch={savePatch}
            onSuccessToast={msg => setToastMessage(msg)}
          />
        )}

        {activeTab === 'brief' && (
          <BriefPlaceholder
            logs={logs}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            language={language}
            logsCount={logs.length}
            onSeedPersona={seedPersona}
            onExportJson={exportJson}
            onClearAll={clearAllLogs}
            onToast={msg => setToastMessage(msg)}
          />
        )}
      </main>

      {/* Bottom Navigation Bar (Visible only on Mobile, hidden on md: and above) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-surface-border px-3 py-1.5 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Dayum / Home */}
          <button
            type="button"
            onClick={() => setActiveTab('ooflog')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[50px] transition-all cursor-pointer active:scale-95 ${
              activeTab === 'ooflog'
                ? 'bg-tint-lavender text-primary font-bold shadow-soft'
                : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/30'
            }`}
          >
            <PlusCircle className={`w-5 h-5 ${activeTab === 'ooflog' ? 'stroke-[2.5] text-primary fill-primary-soft' : ''}`} />
            <span className="text-[10px] mt-1 font-semibold tracking-tight">OofLog</span>
          </button>

          {/* Dayum / Cycle Tracker & Guide */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[50px] transition-all cursor-pointer active:scale-95 ${
              activeTab === 'home'
                ? 'bg-tint-lavender text-primary font-bold shadow-soft'
                : 'text-ink-muted hover:text-ink hover:bg-tint-lavender/30'
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5] text-primary' : ''}`} />
            <span className="text-[10px] mt-1 font-semibold tracking-tight">
              {isFreshBrowser ? (language === 'hi' ? 'गाइड' : 'Guide') : 'Dayum'}
            </span>
          </button>

          {/* Doctor Brief (Chitthi) */}
          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[50px] transition-all cursor-pointer active:scale-95 ${
              activeTab === 'brief'
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
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[50px] transition-all cursor-pointer active:scale-95 ${
              activeTab === 'settings'
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
