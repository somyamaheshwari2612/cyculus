import { type ReactNode } from "react";
import { BarChart3, CalendarDays, FileText, Home, PenLine, Settings, Globe } from "lucide-react";
import { Logo } from "./Logo";
import sprig from "@/assets/sprig.png";

export type NavTab = "overview" | "cycle" | "log" | "insights" | "summary" | "settings";

const NAV = [
  { id: "overview", label: { en: "Overview", hi: "Overview" }, icon: Home },
  { id: "cycle", label: { en: "Cycle", hi: "Cycle" }, icon: CalendarDays },
  { id: "log", label: { en: "Log symptoms", hi: "Log Symptoms" }, short: { en: "Log", hi: "Log" }, icon: PenLine },
  { id: "insights", label: { en: "Insights", hi: "Insights" }, icon: BarChart3 },
  { id: "summary", label: { en: "Summary for Doctor", hi: "Summary for Doctor" }, short: { en: "Summary", hi: "Summary" }, icon: FileText },
  { id: "settings", label: { en: "Settings & privacy", hi: "Settings & Privacy" }, short: { en: "Settings", hi: "Settings" }, icon: Settings },
] as const;

export function AppShell({
  activeTab,
  onTabChange,
  language = "en",
  onLanguageChange,
  children,
}: {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language?: "en" | "hi";
  onLanguageChange?: (lang: "en" | "hi") => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-wash text-foreground">
      {/* Desktop Sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/85 px-4 py-6 backdrop-blur lg:flex z-30">
        <button
          onClick={() => onTabChange("overview")}
          className="px-3 text-left outline-none cursor-pointer"
        >
          <Logo />
        </button>

        <nav className="mt-8 flex flex-col gap-1" aria-label="Main navigation">
          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id as NavTab)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors text-left cursor-pointer ${
                  isActive
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label[language]}</span>
              </button>
            );
          })}
        </nav>

        {/* Language switch button in sidebar */}
        {onLanguageChange && (
          <div className="mt-4 px-2">
            <div className="flex items-center justify-between rounded-xl bg-card/60 p-1.5 border border-border/60 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground pl-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>Language</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onLanguageChange("en")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    language === "en"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange("hi")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    language === "hi"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botanical Serene Card at bottom */}
        <div className="relative mt-auto overflow-hidden rounded-2xl bg-lavender p-4 border border-border/50">
          <img
            src={sprig}
            alt=""
            aria-hidden
            width={768}
            height={1024}
            loading="lazy"
            className="pointer-events-none absolute -right-6 -bottom-4 h-28 w-auto opacity-70"
          />
          <p className="relative max-w-[9.5rem] font-display text-lg leading-snug text-foreground">
            {language === "hi"
              ? "Aapke records. Aapke patterns. Aapki pace."
              : "Your records. Your patterns. Your pace."}
          </p>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-5 py-3 backdrop-blur lg:hidden">
        <button onClick={() => onTabChange("overview")} className="cursor-pointer text-left">
          <Logo />
        </button>
        <div className="flex items-center gap-2">
          {onLanguageChange && (
            <button
              onClick={() => onLanguageChange(language === "en" ? "hi" : "en")}
              className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              {language === "en" ? "हिंदी" : "EN"}
            </button>
          )}
          <button
            onClick={() => onTabChange("settings")}
            aria-label="Settings"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 pt-6 pb-28 md:px-10 lg:ml-64 lg:pt-8 lg:pb-12 xl:px-14">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Main"
        className="no-print fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden safe-area-bottom"
      >
        {NAV.slice(0, 5).map(({ id, label, icon: Icon, ...rest }) => {
          const isActive = activeTab === id;
          const shortLabel = "short" in rest ? rest.short[language] : label[language];
          return (
            <button
              key={id}
              onClick={() => onTabChange(id as NavTab)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors cursor-pointer ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
