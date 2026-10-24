import React, { useState, useEffect, useMemo } from 'react';
import { useLogs } from '@/modules/capture/useLogs';
import { OofLog } from '@/modules/capture/OofLog';
import { DayumPlaceholder } from '@/modules/insights/DayumPlaceholder';
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
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-surface-bg/85 backdrop-blur-md border-b border-surface-border px-4 sm:px-6 py-3 transition-all">
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
                {activeTab === 'ooflog' && 'OofLog · Daily Diary'}
                {activeTab === 'home' && (isFreshBrowser ? 'Guide & Instructions · PWA' : 'Dayum · Cycle Timeline')}
                {activeTab === 'brief' && 'Doctor Brief · Chitthi'}
                {activeTab === 'settings' && 'Privacy & Settings'}
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
          {/* Ambient Welcome Banner - When new browser with no profile set, no name is shown, just clear PWA guidance */}
          <div className="bg-gradient-to-r from-tint-rose/40 via-white/80 to-tint-lavender/40 border border-[#F3E8EE] rounded-[2.25rem] p-6 sm:p-7 relative overflow-hidden mb-6 shadow-card">
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
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                      activeTab === 'home'
                        ? 'bg-primary text-white border-primary shadow-soft'
                        : 'bg-white/90 text-primary border-[#E7DCF8] hover:bg-tint-lavender/50'
                    }`}
                  >
                    📖 {language === 'hi' ? 'PWA उपयोग निर्देश देखें' : 'View PWA Instructions & Guide'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ooflog')}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                      activeTab === 'ooflog'
                        ? 'bg-primary text-white border-primary shadow-soft'
                        : 'bg-white/90 text-primary border-[#E7DCF8] hover:bg-tint-lavender/50'
                    }`}
                  >
                    ✍️ {language === 'hi' ? 'दैनिक चेक-इन शुरू करें (OofLog)' : 'Start Daily Check-in (OofLog)'}
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
            <DayumPlaceholder
              logs={logs}
              insights={insights}
              userSetup={userSetup}
              language={language}
              onNavigateToLog={() => setActiveTab('ooflog')}
              onOpenSetup={() => setShowOnboarding(true)}
              onLoadPersona={handleLoadPersona}
            />
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
                existingEntry={todayLog}
                language={language}
                onSavePatch={savePatch}
                onSuccessToast={msg => setToastMessage(msg)}
              />
            </div>
          )}

          {activeTab === 'brief' && (
            <BriefPlaceholder
              logs={logs}
              insights={insights}
              userSetup={userSetup}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              language={language}
              logsCount={logs.length}
              userSetup={userSetup}
              onClearSetup={clearSetup}
              onSeedPersona={seedPersona}
              onExportJson={exportJson}
              onClearAll={clearAllLogs}
              onToast={msg => setToastMessage(msg)}
              onOpenSetup={() => setShowOnboarding(true)}
            />
          )}
        </main>
      </div>

      {/* MOBILE / PHONE BOTTOM NAVIGATION BAR (Visible on all phone & tablet screens < lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-xl border-t border-[#F0E6EE] px-3 py-2 shadow-sheet safe-area-bottom">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5">
          {/* OofLog (Daily Diary) */}
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
