import { useState, useMemo } from "react";
import { useLogs } from "@/modules/capture/useLogs";
import { computeInsights, calculateCurrentCycleDay } from "@/modules/insights";
import knowledgeData from "@/shared/knowledge.json";
import { AppShell, NavTab } from "./components/cyculus/AppShell";
import { OverviewView } from "./components/views/OverviewView";
import { CycleView } from "./components/views/CycleView";
import { LogView } from "./components/views/LogView";
import { InsightsView } from "./components/views/InsightsView";
import { SummaryView } from "./components/views/SummaryView";
import { SettingsView } from "./components/views/SettingsView";
import { WelcomeView } from "./components/views/WelcomeView";
import { CycleSetupModal } from "./components/cyculus/CycleSetupModal";
import { today } from "@/shared/dateUtils";

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [selectedLogDate, setSelectedLogDate] = useState<string>(today());
  const [language, setLanguage] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("cyculus_language") as "en" | "hi") || "en";
  });
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    return localStorage.getItem("cyculus_has_started") === "true";
  });
  const [isCycleSetupOpen, setIsCycleSetupOpen] = useState(false);

  const {
    logs,
    userSetup,
    doctorQuestions,
    savePatch,
    deleteLog,
    saveSetup,
    clearAllLogs,
    seedPersona,
    saveQuestions,
    exportJson,
  } = useLogs();

  const todayStr = today();

  // Pure statistical & clinical insight evaluation
  const insights = useMemo(() => {
    return computeInsights(logs, knowledgeData as any, todayStr);
  }, [logs, todayStr]);

  // Current cycle day relative to latest bleeding start
  const latestStart =
    insights.cycles.length > 0
      ? insights.cycles[insights.cycles.length - 1].startDate
      : userSetup?.lastPeriodStart;
  const currentCycleDay = latestStart
    ? calculateCurrentCycleDay(latestStart, todayStr)
    : null;

  const handleLanguageChange = (lang: "en" | "hi") => {
    setLanguage(lang);
    localStorage.setItem("cyculus_language", lang);
  };

  const handleSaveProfile = async (profileData: {
    name: string;
    lastPeriodStart?: string;
    typicalCycleLength: number | null;
    previousStarts?: string[];
  }) => {
    await saveSetup({
      ...userSetup,
      name: profileData.name,
      lastPeriodStart: profileData.lastPeriodStart ?? userSetup?.lastPeriodStart,
      typicalCycleLength: profileData.typicalCycleLength,
      previousStarts: profileData.previousStarts ?? userSetup?.previousStarts,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem("cyculus_has_started", "true");
    setHasStarted(true);
  };

  const handleSaveEntry = async (entryData: {
    date: string;
    flow: any;
    painLevel: number | null;
    symptoms: any;
    symptomSeverities: any;
    moods: any;
    sleepHours: number | null;
    notes: string;
  }) => {
    await savePatch(
      {
        date: entryData.date,
        flow: entryData.flow,
        painLevel: entryData.painLevel,
        symptoms: entryData.symptoms,
        symptomSeverities: entryData.symptomSeverities,
        moods: entryData.moods,
        sleepHours: entryData.sleepHours,
        notes: entryData.notes,
      },
      "tap"
    );
  };

  const handleSeedPersona = async (entries: any[], personaName: string) => {
    await seedPersona(entries);
    await saveSetup({
      name: personaName,
      typicalCycleLength: 28,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem("cyculus_has_started", "true");
    setHasStarted(true);
    setActiveTab("overview");
  };

  const existingEntryForSelectedDate = logs.find((l) => l.date === selectedLogDate);

  // If user hasn't set up or started, show the serene watercolor welcome screen
  if (!hasStarted && !userSetup?.name && logs.length === 0) {
    return (
      <WelcomeView
        userSetup={userSetup}
        onSaveProfile={handleSaveProfile}
        onComplete={() => {
          localStorage.setItem("cyculus_has_started", "true");
          setHasStarted(true);
          setActiveTab("overview");
        }}
        language={language}
      />
    );
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        onLanguageChange={handleLanguageChange}
      >
        {activeTab === "overview" && (
          <OverviewView
            logs={logs}
            userSetup={userSetup}
            insights={insights}
            currentCycleDay={currentCycleDay}
            onNavigateTab={setActiveTab}
            onSelectDateToLog={(d) => {
              setSelectedLogDate(d);
              setActiveTab("log");
            }}
            onOpenCycleSetup={() => setIsCycleSetupOpen(true)}
            language={language}
          />
        )}

      {activeTab === "cycle" && (
        <CycleView
          logs={logs}
          insights={insights}
          onSelectDateToLog={(d) => {
            setSelectedLogDate(d);
            setActiveTab("log");
          }}
          onNavigateTab={setActiveTab}
          language={language}
        />
      )}

      {activeTab === "log" && (
        <LogView
          selectedDate={selectedLogDate}
          existingEntry={existingEntryForSelectedDate}
          cycleDay={currentCycleDay}
          onSave={handleSaveEntry}
          onDelete={async (dateToDelete) => {
            await deleteLog(dateToDelete);
          }}
          onDateChange={setSelectedLogDate}
          language={language}
        />
      )}

      {activeTab === "insights" && (
        <InsightsView
          logs={logs}
          insights={insights}
          onNavigateTab={setActiveTab}
          language={language}
        />
      )}

      {activeTab === "summary" && (
        <SummaryView
          logs={logs}
          userSetup={userSetup}
          insights={insights}
          savedQuestions={doctorQuestions}
          onSaveQuestions={saveQuestions}
          language={language}
        />
      )}

      {activeTab === "settings" && (
        <SettingsView
          userSetup={userSetup}
          onSaveProfile={handleSaveProfile}
          onOpenCycleSetup={() => setIsCycleSetupOpen(true)}
          onExport={exportJson}
          onDeleteAll={async () => {
            await clearAllLogs();
            localStorage.removeItem("cyculus_has_started");
            setHasStarted(false);
          }}
          onSeedPersona={handleSeedPersona}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </AppShell>

    <CycleSetupModal
      isOpen={isCycleSetupOpen}
      onClose={() => setIsCycleSetupOpen(false)}
      userSetup={userSetup}
      onSave={handleSaveProfile}
      language={language}
    />
  </>
  );
}

export default App;
