import React, { useState, useEffect } from 'react';
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
import { UserProfile } from '@/shared/types';
import { loadUserProfile, saveUserProfile, generateBaselineLogs } from '@/modules/profile/profileStorage';
import { deriveCycles, calculateRollingStats, getCurrentCycleStatus } from '@/modules/insights/cycleEngine';

export type Tab = 'home' | 'ooflog' | 'brief' | 'settings';

export const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ooflog');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile());

  const {
    logs,
    todayLog,
    savePatch,
    seedPersona,
    exportJson,
    clearAllLogs
  } = useLogs();

  const todayStr = new Date().toISOString().split('T')[0];

  // Derive active cycles, rolling stats, and cycle status dynamically from real logs & profile
  const cycles = deriveCycles(logs, userProfile);
  const stats = calculateRollingStats(cycles, userProfile);
  const lastCycleStart = cycles.length > 0
    ? cycles[cycles.length - 1].startDate
    : userProfile.lastPeriodStartDate;
  const cycleStatus = getCurrentCycleStatus(
    lastCycleStart,
    todayStr,
    stats,
    userProfile.typicalPeriodDuration
  );

  // Check onboarding status
  useEffect(() => {
    const done = localStorage.getItem('cyculus_onboarding_done');
    if (!done) {
      setShowOnboarding(true);
    }
  }, []);

  // When completing onboarding setup
  const handleCompleteOnboarding = async (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    localStorage.setItem('cyculus_onboarding_done', 'true');
    setShowOnboarding(false);

    // If no logs exist yet, seed initial baseline logs matching user's actual entered cycle
    if (logs.length === 0) {
      const baselineLogs = generateBaselineLogs(profile);
      await seedPersona(baselineLogs);
    }

    setToastMessage(
      language === 'hi'
        ? `नमस्ते ${profile.name}! आपकी 100% ऑन-डिवाइस डायरी तैयार है।`
        : `Welcome ${profile.name}! Your on-device diary is ready.`
    );
  };

  // Update profile from Settings
  const handleUpdateProfile = async (profile: UserProfile, regenerateLogs: boolean = false) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    if (regenerateLogs) {
      const baselineLogs = generateBaselineLogs(profile);
      await seedPersona(baselineLogs);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex font-sans selection:bg-primary-soft selection:text-ink">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          language={language}
          onComplete={handleCompleteOnboarding}
          initialProfile={userProfile}
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

            {/* Dayum (Cycle Tracker) */}
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
                <span className="block font-bold">Dayum</span>
                <span className={`text-[10px] block ${activeTab === 'home' ? 'text-white/80' : 'text-ink-muted'}`}>
                  {language === 'hi' ? 'चक्र ट्रैकर व अनुमान' : 'Cycle Timeline & Window'}
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
              <span>Offline Ready</span>
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
                {activeTab === 'home' && 'Dayum · Cycle Timeline'}
                {activeTab === 'brief' && 'Doctor Brief · Chitthi'}
                {activeTab === 'settings' && 'Privacy & Settings'}
              </span>
              <span className="text-ink-muted/50">•</span>
              <span className="text-[11px] text-ink-muted font-medium bg-white/70 px-2.5 py-0.5 rounded-full border border-surface-border">
                {todayStr}
              </span>
            </div>

            {/* Right Controls: Storage Badge, Language Toggle, and Avatar Pill */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-tint-lavender/60 px-3 py-1 rounded-full border border-[#E7DCF8]">
                <span>🔒 100% On-Device</span>
              </div>

              <LanguageToggle
                language={language}
                onToggle={setLanguage}
              />

              {/* Dynamic User Avatar Pill */}
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-soft border border-white">
                {userProfile.name.charAt(0).toUpperCase() || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12 transition-all">
          {/* Ambient Welcome Banner with Dynamic User Name & Cycle Status */}
          <div className="bg-gradient-to-r from-tint-rose/40 via-white/80 to-tint-lavender/40 border border-[#F3E8EE] rounded-[2.25rem] p-6 sm:p-7 relative overflow-hidden mb-6 shadow-card">
            <div className="absolute top-0 right-0 pointer-events-none opacity-60">
              <BotanicalAccent className="w-36 h-36 lg:w-44 lg:h-44 text-primary" />
            </div>

            <div className="relative z-10 max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
                {language === 'hi' ? `नमस्ते, ${userProfile.name} 👋` : `Hey there, ${userProfile.name} 👋`}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'आज आप कैसा महसूस कर रही हैं? बोलें या 1-टैप से दर्ज करें।'
                  : 'What would you like to log or explore today? Speak naturally or tap below.'}
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-white/90 px-3 py-1 rounded-full border border-[#E7DCF8] shadow-soft">
                  🌸 Cycle Day {cycleStatus.cycleDay} · {language === 'hi' ? cycleStatus.bandLabel.hi : cycleStatus.bandLabel.en}
                </span>
                <span className="text-[11px] text-ink-muted bg-white/70 px-2.5 py-1 rounded-full border border-surface-border">
                  {logs.length} days recorded
                </span>
              </div>
            </div>
          </div>

          {/* Active Tab Screen */}
          {activeTab === 'home' && (
            <DayumPlaceholder
              logs={logs}
              profile={userProfile}
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
              profile={userProfile}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              language={language}
              logsCount={logs.length}
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onSeedPersona={seedPersona}
              onExportJson={exportJson}
              onClearAll={clearAllLogs}
              onToast={msg => setToastMessage(msg)}
              onOpenOnboarding={() => setShowOnboarding(true)}
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

          {/* Dayum / Cycle Tracker */}
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
            <span className="text-[10px] mt-1 font-semibold tracking-tight">Dayum</span>
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
