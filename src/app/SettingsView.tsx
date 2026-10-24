import React, { useState } from 'react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { ShieldCheck, Download, Trash2, Sparkles } from 'lucide-react';
import { LogEntry } from '@/shared/types';
import irregularData from '@/shared/mocks/entries.irregular.json';
import regularData from '@/shared/mocks/entries.regular.json';
import heavyData from '@/shared/mocks/entries.heavy.json';

export interface SettingsViewProps {
  language: 'en' | 'hi';
  logsCount: number;
  onSeedPersona: (entries: LogEntry[]) => Promise<void>;
  onExportJson: () => Promise<string>;
  onClearAll: () => Promise<void>;
  onToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  logsCount,
  onSeedPersona,
  onExportJson,
  onClearAll,
  onToast
}) => {
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  const handleSeed = async (type: 'riya' | 'regular' | 'heavy') => {
    setIsSeeding(true);
    try {
      let data: LogEntry[];
      let name: string;
      if (type === 'riya') {
        data = irregularData as LogEntry[];
        name = 'Riya (Irregular / 41-day cycle)';
      } else if (type === 'heavy') {
        data = heavyData as LogEntry[];
        name = 'Heavy Bleeding Persona';
      } else {
        data = regularData as LogEntry[];
        name = 'Regular Cycles Persona';
      }

      await onSeedPersona(data);
      onToast(
        language === 'hi'
          ? `${name} का डेटा सफलतापूर्वक लोड किया गया!`
          : `Loaded 6 months of data for ${name}!`
      );
    } finally {
      setIsSeeding(false);
    }
  };

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
    onToast(language === 'hi' ? 'सभी डेटा हटा दिया गया।' : 'All local logs cleared.');
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

      {/* 1. Privacy Architecture Card */}
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
              <span>🔒 {logsCount} days saved locally</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Persona Seeder (Hackathon Demo Superpower) */}
      <Card variant="default" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-tint-peach flex items-center justify-center text-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              {language === 'hi' ? 'डेमो डेटा लोड करें (Quick Personas)' : 'Demo Personas (One-Tap Load)'}
            </h3>
            <p className="text-xs text-ink-muted">
              {language === 'hi'
                ? 'निर्णायकों और परीक्षण के लिए 6 महीने का यथार्थवादी डेटा एक क्लिक में लोड करें:'
                : 'Preload 6 months of realistic longitudinal logs for hackathon evaluation:'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Persona A: Riya */}
          <button
            type="button"
            disabled={isSeeding}
            onClick={() => handleSeed('riya')}
            className="p-4 rounded-3xl bg-tint-lavender/40 border border-[#E7DCF8] hover:border-primary hover:shadow-soft text-left transition-all cursor-pointer flex flex-col justify-between group disabled:opacity-50"
          >
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-white/90 px-2 py-0.5 rounded-full border border-[#E7DCF8] mb-2">
                Scenario A · FIGO Flag
              </span>
              <h4 className="font-serif font-bold text-ink text-sm sm:text-base group-hover:text-primary transition-colors">
                ✨ Riya (Irregular)
              </h4>
              <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                Latest 41 days · High cycle variability (27–41d) · Clinician brief demo
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-primary">
              Load Persona →
            </div>
          </button>

          {/* Persona B: Regular */}
          <button
            type="button"
            disabled={isSeeding}
            onClick={() => handleSeed('regular')}
            className="p-4 rounded-3xl bg-tint-mint/40 border border-[#D8F0E4] hover:border-emerald-600 hover:shadow-soft text-left transition-all cursor-pointer flex flex-col justify-between group disabled:opacity-50"
          >
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-white/90 px-2 py-0.5 rounded-full border border-[#D8F0E4] mb-2">
                Scenario B · Baseline
              </span>
              <h4 className="font-serif font-bold text-ink text-sm sm:text-base group-hover:text-emerald-800 transition-colors">
                🌿 Regular Cycles
              </h4>
              <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                Consistent 28–29 days · Low variability · Healthy cycle baseline
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-emerald-800">
              Load Persona →
            </div>
          </button>

          {/* Persona C: Heavy Flow */}
          <button
            type="button"
            disabled={isSeeding}
            onClick={() => handleSeed('heavy')}
            className="p-4 rounded-3xl bg-tint-peach/40 border border-[#FADCD0] hover:border-amber-700 hover:shadow-soft text-left transition-all cursor-pointer flex flex-col justify-between group disabled:opacity-50"
          >
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-white/90 px-2 py-0.5 rounded-full border border-[#FADCD0] mb-2">
                Scenario C · High Pain
              </span>
              <h4 className="font-serif font-bold text-ink text-sm sm:text-base group-hover:text-amber-900 transition-colors">
                🩸 Heavy Bleeding
              </h4>
              <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                4+ heavy bleeding days · Severe dysmenorrhea (pain 8/10)
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-amber-900">
              Load Persona →
            </div>
          </button>
        </div>
      </Card>

      {/* Responsive Grid for Data Management & Clinical References on Desktop (lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 3. Data Export and Deletion */}
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
                  ? 'डिवाइस से सभी प्रविष्टियाँ हमेशा के लिए हटा दें।'
                  : 'Permanently wipe all logs from this browser.'}
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

        {/* 4. Clinical Evidence & References */}
        <div className="rounded-3xl bg-white/70 p-5 border border-surface-border text-xs text-ink-muted space-y-2">
          <h4 className="font-bold text-ink text-xs uppercase tracking-wider">
            {language === 'hi' ? 'क्लिनिकल स्रोत एवं संदर्भ' : 'Clinical Sources & Academic References'}
          </h4>
          <p className="leading-relaxed">
            • <strong>Utah Hive Menstrual Dataset (2023)</strong>: Stanford & Najmabadi, University of Utah Repository.
          </p>
          <p className="leading-relaxed">
            • <strong>Bull et al. (2019)</strong>: Real-world menstrual cycle characteristics of 600,000+ cycles, <em>npj Digital Medicine</em>.
          </p>
          <p className="leading-relaxed">
            • <strong>FIGO Menstrual Disorders Committee (2018)</strong>: Normal limits and abnormal uterine bleeding classifications.
          </p>
        </div>
      </div>
    </div>
  );
};
