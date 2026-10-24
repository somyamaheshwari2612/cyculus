import React, { useState, useEffect } from 'react';
import { useLogs } from '@/modules/capture/useLogs';
import { OofLog } from '@/modules/capture/OofLog';
import { DayumPlaceholder } from '@/modules/insights/DayumPlaceholder';
import { BriefPlaceholder } from '@/modules/brief/BriefPlaceholder';
import { SettingsView } from './SettingsView';
import { LanguageToggle } from './components/LanguageToggle';
import { Toast } from './components/Toast';
import { OnboardingModal } from './OnboardingModal';
import { Calendar, PlusCircle, FileText, Settings, Heart } from 'lucide-react';

export type Tab = 'home' | 'ooflog' | 'brief' | 'settings';

export const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ooflog');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const {
    logs,
    todayLog,
    savePatch,
    seedPersona,
    exportJson,
    clearAllLogs
  } = useLogs();

  // Check onboarding status
  useEffect(() => {
    const done = localStorage.getItem('cyculus_onboarding_done');
    if (!done) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('cyculus_onboarding_done', 'true');
    setShowOnboarding(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col font-sans selection:bg-primary-soft selection:text-ink">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          language={language}
          onComplete={handleCompleteOnboarding}
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

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-surface-bg/90 backdrop-blur-md border-b border-surface-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-soft shadow-primary/25">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-ink leading-tight tracking-tight">
                Cyculus
              </h1>
              <p className="text-[10px] text-ink-muted leading-none">
                {language === 'hi' ? 'प्राइवेट चक्र डायरी' : 'Private Cycle Diary'}
              </p>
            </div>
          </div>

          <LanguageToggle
            language={language}
            onToggle={setLanguage}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-5">
        {activeTab === 'home' && (
          <DayumPlaceholder
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

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-surface-border px-3 py-1.5 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Dayum / Home */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl min-h-[48px] transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-primary font-bold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Dayum</span>
          </button>

          {/* OofLog (Center Action) */}
          <button
            type="button"
            onClick={() => setActiveTab('ooflog')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl min-h-[48px] transition-all cursor-pointer ${
              activeTab === 'ooflog'
                ? 'text-primary font-bold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <PlusCircle className={`w-5 h-5 ${activeTab === 'ooflog' ? 'stroke-[2.5] text-primary fill-primary-soft' : ''}`} />
            <span className="text-[10px] mt-0.5">OofLog</span>
          </button>

          {/* Doctor Brief */}
          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl min-h-[48px] transition-all cursor-pointer ${
              activeTab === 'brief'
                ? 'text-primary font-bold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <FileText className={`w-5 h-5 ${activeTab === 'brief' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">
              {language === 'hi' ? 'चिट्ठी' : 'Brief'}
            </span>
          </button>

          {/* Settings / Privacy */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl min-h-[48px] transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-primary font-bold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">
              {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
