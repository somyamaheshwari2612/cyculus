import React, { useState } from 'react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { ShieldCheck, Download, Trash2, Sparkles, SlidersHorizontal, RotateCcw, Smartphone } from 'lucide-react';
import { LogEntry, UserSetup } from '@/shared/types';
import irregularData from '@/shared/mocks/entries.irregular.json';
import regularData from '@/shared/mocks/entries.regular.json';
import heavyData from '@/shared/mocks/entries.heavy.json';

export interface SettingsViewProps {
  language: 'en' | 'hi';
  logsCount: number;
  userSetup?: UserSetup | null;
  demoPersona?: string | null;
  onClearSetup: () => Promise<void>;
  onRequestSeedPersona: (type: 'riya' | 'regular' | 'heavy') => void;
  onRemoveDemoData: () => Promise<void>;
  onExportJson: () => Promise<string>;
  onClearAll: () => Promise<void>;
  onToast: (msg: string) => void;
  onOpenSetup: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  logsCount,
  userSetup,
  demoPersona,
  onClearSetup,
  onRequestSeedPersona,
  onRemoveDemoData,
  onExportJson,
  onClearAll,
  onToast,
  onOpenSetup
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  const handleDownload = async () => {
    const jsonStr = await onExportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyculus-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(language === 'hi' ? 'डेटा JSON फ़ाइल के रूप में डाउनलोड हुआ!' : 'Logs exported to JSON file!');
  };

  const handleDelete = async () => {
    await onClearAll();
    setShowConfirmDelete(false);
    onToast(language === 'hi' ? 'सभी डेटा और सेटअप हटा दिया गया।' : 'All local logs and setup cleared.');
  };

  const handleClearSetupOnly = async () => {
    await onClearSetup();
    onToast(
      language === 'hi'
        ? 'आरंभिक चक्र अनुमान हटा दिया गया। अब केवल वास्तविक लॉग प्रविष्टियों का उपयोग होगा।'
        : 'Initial estimate removed. Cyculus will rely purely on your logged entries.'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
          {language === 'hi' ? 'गोपनीयता एवं सेटिंग्स' : 'Privacy & Settings'}
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
          {language === 'hi'
            ? 'आपका डेटा, आपका नियंत्रण — पूर्ण रूप से ऑन-डिवाइस सुरक्षित।'
            : 'Complete ownership of your personal health data. 100% on-device.'}
        </p>
      </div>

      {/* 1. Cycle Setup Baseline Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-[2.25rem] p-6 sm:p-7 border border-[#F3E8EE] shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3E8EE] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint-lavender px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                {language === 'hi' ? 'आरंभिक अनुमान' : 'Initial Estimate'}
              </span>
            </div>
            <h3 className="font-serif font-bold text-ink text-lg sm:text-xl mt-1">
              {language === 'hi' ? 'आरंभिक चक्र अनुमान' : 'Initial Cycle Estimate'}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {language === 'hi'
                ? 'यह केवल आरंभिक अनुमान प्रदान करता है और वास्तविक चक्र दर्ज होने पर स्वतः अपडेट हो जाता है।'
                : 'Calibrates initial predictions until you log real cycles. Never creates synthetic entries or triggers false flags.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={onOpenSetup}
              className="rounded-full shadow-pill text-xs"
            >
              {userSetup ? (language === 'hi' ? 'अनुमान बदलें' : 'Edit Baseline') : (language === 'hi' ? 'अनुमान जोड़ें' : 'Set Up Baseline')}
            </Button>

            {userSetup && (
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={handleClearSetupOnly}
                className="rounded-full text-xs text-ink-muted hover:text-ink"
              >
                {language === 'hi' ? 'अनुमान हटाएं' : 'Clear Baseline'}
              </Button>
            )}
          </div>
        </div>

        {/* Prior Values Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3.5 bg-tint-lavender/40 rounded-2xl border border-[#E7DCF8]">
            <span className="text-ink-muted block text-[11px] font-medium">Last Period Start</span>
            <span className="text-base font-serif font-bold text-ink mt-0.5 block">
              {userSetup?.lastPeriodStart || (language === 'hi' ? 'दर्ज नहीं' : 'Not recorded')}
            </span>
          </div>

          <div className="p-3.5 bg-tint-peach/40 rounded-2xl border border-[#FADCD0]">
            <span className="text-ink-muted block text-[11px] font-medium">Cycle Prior</span>
            <span className="text-base font-serif font-bold text-ink mt-0.5 block">
              {userSetup?.typicalCycleLength
                ? `${userSetup.typicalCycleLength} days (Self-reported)`
                : '29.3d (Bull et al. 2019)'}
            </span>
          </div>

          <div className="p-3.5 bg-tint-mint/40 rounded-2xl border border-[#D8F0E4]">
            <span className="text-ink-muted block text-[11px] font-medium">Earlier Period Dates</span>
            <span className="text-base font-serif font-bold text-ink mt-0.5 block">
              {userSetup?.previousStarts?.length
                ? `${userSetup.previousStarts.length} dates recorded`
                : (language === 'hi' ? 'कोई नहीं' : 'None')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Privacy Architecture Card */}
      <div className="bg-tint-lavender/50 backdrop-blur-sm rounded-[2rem] p-5 sm:p-6 border border-[#E7DCF8] shadow-card relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-primary text-white rounded-2xl shadow-soft shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-ink">
              {language === 'hi' ? 'शून्य-क्लाउड गारंटी (Zero-Cloud)' : 'Zero-Cloud Architecture'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
              {language === 'hi'
                ? 'साइकुलस में कोई खाता या पासवर्ड नहीं है। आपकी सारी प्रविष्टियाँ आपके ब्राउज़र की एन्क्रिप्टेड IndexedDB मेमोरी में रहती हैं। कोई भी व्यक्तिगत स्वास्थ्य डेटा कभी भी किसी सर्वर पर नहीं भेजा जाता।'
                : 'Cyculus has no user accounts or cloud databases. All daily entries stay inside your device’s IndexedDB storage. No health details are ever uploaded.'}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E7DCF8] text-xs font-semibold text-primary">
              <span>🔒 {logsCount} real logged days in this browser</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2b. PWA Installation & Offline Guide */}
      <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] p-5 sm:p-6 border border-[#F3E8EE] shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-tint-mint text-emerald-800 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-ink text-base">
                {language === 'hi' ? 'PWA इंस्टॉलेशन एवं ऑफ़लाइन गाइड' : 'PWA Installation & Offline Usage Guide'}
              </h3>
              <p className="text-xs text-ink-muted">
                {language === 'hi' ? 'बिना इंटरनेट के होम स्क्रीन पर चलाएं' : 'Run full-screen from home screen without internet'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Offline Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
          <div className="p-3 bg-tint-rose/30 rounded-2xl border border-[#F8DDE5]">
            <span className="font-bold text-ink block mb-1">🍏 iPhone / Safari</span>
            <p className="text-ink-muted leading-relaxed text-[11px]">
              {language === 'hi'
                ? 'Safari शेयर (⎋) दबाएं → "Add to Home Screen" चुनें।'
                : 'Tap Safari Share (⎋) → tap "Add to Home Screen".'}
            </p>
          </div>
          <div className="p-3 bg-tint-lavender/30 rounded-2xl border border-[#E7DCF8]">
            <span className="font-bold text-ink block mb-1">🤖 Android Chrome</span>
            <p className="text-ink-muted leading-relaxed text-[11px]">
              {language === 'hi'
                ? 'मेनू (⋮) दबाएं → "Install app" चुनें।'
                : 'Tap Chrome menu (⋮) → tap "Install app".'}
            </p>
          </div>
          <div className="p-3 bg-tint-mint/30 rounded-2xl border border-[#D8F0E4]">
            <span className="font-bold text-ink block mb-1">💻 Desktop PC / Mac</span>
            <p className="text-ink-muted leading-relaxed text-[11px]">
              {language === 'hi'
                ? 'एड्रेस बार में इंस्टॉल आइकन (⊕) पर क्लिक करें।'
                : 'Click the install icon (⊕) in address bar.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Demo Personas (Developer & Evaluator Tools) - Collapsible, pushed out of main path */}
      <details className="group bg-surface-subtle/80 rounded-[2.25rem] border border-surface-border p-6 transition-all">
        <summary className="flex items-center justify-between cursor-pointer list-none select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-tint-peach flex items-center justify-center text-primary text-sm shadow-soft">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                  {language === 'hi' ? 'डेवलपर व मूल्यांकन टूल (डेमो डेटा)' : 'Developer & Evaluator Tools (Demo Personas)'}
                </h3>
                {demoPersona && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Active Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted">
                {language === 'hi'
                  ? 'निर्णायकों हेतु 6 महीने का सिंथेटिक डेटा (सामान्य उपयोग के लिए आवश्यक नहीं)'
                  : 'Preload synthetic longitudinal logs for evaluation (not needed for private diary use)'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary px-3 py-1.5 rounded-full bg-white border border-surface-border shadow-pill group-open:bg-primary group-open:text-white transition-all shrink-0">
            {language === 'hi' ? 'टूल खोलें ▾' : 'Demo Tools ▾'}
          </span>
        </summary>

        <div className="pt-5 space-y-4 border-t border-surface-border/60 mt-4">
          {demoPersona && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  Active Demo
                </span>
                <span className="font-semibold">{demoPersona}</span>
              </div>
              <button
                type="button"
                onClick={onRemoveDemoData}
                className="text-xs text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'डेमो डेटा हटाएं' : 'Remove Demo Data'}</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Persona A: Riya */}
            <button
              type="button"
              onClick={() => onRequestSeedPersona('riya')}
              className="p-4 rounded-3xl bg-tint-lavender/40 border border-[#E7DCF8] hover:border-primary hover:shadow-soft text-left transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-white/90 px-2 py-0.5 rounded-full border border-[#E7DCF8] mb-2">
                  Scenario A · FIGO Flag
                </span>
                <h4 className="font-serif font-bold text-ink text-sm sm:text-base group-hover:text-primary transition-colors">
                  ✨ Riya (Irregular)
                </h4>
                <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                  Latest 41 days · High cycle variability (27–41d) · {(irregularData as LogEntry[]).length} days logged
                </p>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-primary">
                Load Persona →
              </div>
            </button>

            {/* Persona B: Regular */}
            <button
              type="button"
              onClick={() => onRequestSeedPersona('regular')}
              className="p-4 rounded-3xl bg-tint-mint/40 border border-[#D8F0E4] hover:border-emerald-600 hover:shadow-soft text-left transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-white/90 px-2 py-0.5 rounded-full border border-[#D8F0E4] mb-2">
                  Scenario B · Baseline
                </span>
                <h4 className="font-serif font-bold text-ink text-sm sm:text-base group-hover:text-emerald-800 transition-colors">
                  🌿 Regular Cycles
                </h4>
                <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                  Consistent 28–29 days · Low variability · {(regularData as LogEntry[]).length} days logged
                </p>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-emerald-800">
                Load Persona →
              </div>
            </button>

            {/* Persona C: Heavy Flow */}
            <button
              type="button"
              onClick={() => onRequestSeedPersona('heavy')}
              className="p-4 rounded-3xl bg-tint-peach/40 border border-[#FADCD0] hover:border-amber-700 hover:shadow-soft text-left transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-white/90 px-2 py-0.5 rounded-full border border-[#FADCD0] mb-2">
                  Scenario C · High Pain
                </span>
                <h4 className="font-serif font-bold text-ink text-sm sm:text-base group-hover:text-amber-900 transition-colors">
                  🩸 Heavy Bleeding
                </h4>
                <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                  4+ heavy bleeding days · Severe dysmenorrhea (pain 8/10) · {(heavyData as LogEntry[]).length} days logged
                </p>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-amber-900">
                Load Persona →
              </div>
            </button>
          </div>
        </div>
      </details>

      {/* Responsive Grid for Data Management & Clinical References on Desktop (lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 4. Data Export and Deletion */}
        <Card variant="default" padding="lg" className="space-y-4">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            {language === 'hi' ? 'डेटा प्रबंधन' : 'Data Management & Export'}
          </h3>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-xs font-semibold text-ink">
                {language === 'hi' ? 'सभी लॉग निर्यात करें (JSON)' : 'Export Full Health Data'}
              </p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {language === 'hi'
                  ? 'अपने पूरे डेटा की एक JSON प्रति अपने पास सुरक्षित रखें।'
                  : 'Download a complete JSON backup of all daily entries.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
              className="rounded-full shadow-pill"
            >
              {language === 'hi' ? 'निर्यात करें' : 'Export JSON'}
            </Button>
          </div>

          <div className="border-t border-surface-border pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-rose-700">
                {language === 'hi' ? 'सभी डेटा मिटाएं' : 'Delete All Data'}
              </p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {language === 'hi'
                  ? 'डिवाइस से सभी प्रविष्टियाँ और सेटअप हमेशा के लिए हटा दें।'
                  : 'Permanently wipe all logs and setup from this browser.'}
              </p>
            </div>

            {!showConfirmDelete ? (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-4 h-4 text-rose-600" />}
                onClick={() => setShowConfirmDelete(true)}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-full"
              >
                {language === 'hi' ? 'डेटा हटाएं' : 'Wipe Data'}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmDelete(false)}
                  className="rounded-full"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  className="rounded-full"
                >
                  {language === 'hi' ? 'हाँ, सब हटाएं' : 'Yes, Wipe All'}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* 5. Clinical Evidence & References */}
        <div className="rounded-3xl bg-white/70 p-5 border border-surface-border text-xs text-ink-muted space-y-2">
          <h4 className="font-bold text-ink text-xs uppercase tracking-wider">
            {language === 'hi' ? 'क्लिनिकल स्रोत एवं संदर्भ' : 'Clinical Sources & Academic References'}
          </h4>
          <p className="leading-relaxed">
            • <strong>Utah Hive Menstrual Dataset (2023)</strong>: Stanford & Najmabadi, University of Utah Repository.
          </p>
          <p className="leading-relaxed">
            • <strong>Bull et al. (2019)</strong>: Real-world menstrual cycle characteristics of 600,000+ cycles, <em>npj Digital Medicine</em>. Population mean 29.3 days.
          </p>
          <p className="leading-relaxed">
            • <strong>FIGO Menstrual Disorders Committee (2018)</strong>: Normal limits and abnormal uterine bleeding classifications.
          </p>
        </div>
      </div>
    </div>
  );
};
