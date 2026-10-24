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
        <h2 className="text-2xl font-bold text-ink tracking-tight">
          {language === 'hi' ? 'गोपनीयता एवं सेटिंग्स' : 'Privacy & Settings'}
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          {language === 'hi'
            ? 'आपका डेटा, आपका नियंत्रण — पूर्ण रूप से ऑन-डिवाइस सुरक्षित।'
            : 'Complete control over your personal data. 100% on-device.'}
        </p>
      </div>

      {/* 1. Privacy Architecture Card */}
      <Card variant="lavender" padding="lg" className="border-primary/25">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary text-white rounded-2xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">
              {language === 'hi' ? 'शून्य-क्लाउड गारंटी (Zero-Cloud)' : 'Zero-Cloud Architecture'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
              {language === 'hi'
                ? 'साइकुलस में कोई खाता या पासवर्ड नहीं है। आपकी सारी प्रविष्टियाँ आपके ब्राउज़र की एन्क्रिप्टेड IndexedDB मेमोरी में रहती हैं। कोई भी व्यक्तिगत स्वास्थ्य डेटा कभी भी किसी सर्वर पर नहीं भेजा जाता।'
                : 'Cyculus has no user accounts or cloud databases. All daily entries stay inside your device’s IndexedDB storage. No health details are ever uploaded.'}
            </p>
            <div className="mt-3 text-xs font-semibold text-primary">
              {language === 'hi' ? 'वर्तमान में सुरक्षित प्रविष्टियाँ:' : 'Currently stored entries:'}{' '}
              <span className="text-ink font-bold">{logsCount} days</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Quick Persona Seeder (Hackathon Demo Superpower) */}
      <Card variant="default" padding="lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
            {language === 'hi' ? 'डेमो डेटा लोड करें (Quick Personas)' : 'Demo Personas (One-Tap Load)'}
          </h3>
        </div>
        <p className="text-xs text-ink-muted mb-4">
          {language === 'hi'
            ? 'निर्णायकों और परीक्षण के लिए 6 महीने का यथार्थवादी डेटा एक क्लिक में लोड करें:'
            : 'Preload 6 months of realistic longitudinal logs for hackathon evaluation:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant="secondary"
            size="sm"
            isLoading={isSeeding}
            onClick={() => handleSeed('riya')}
            className="flex-col py-3 h-auto items-start text-left"
          >
            <span className="font-bold text-primary text-xs">✨ Riya (Demo Scenario)</span>
            <span className="text-[11px] text-ink-muted font-normal mt-0.5">
              Irregular · Latest 41 days · FIGO flag
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            isLoading={isSeeding}
            onClick={() => handleSeed('regular')}
            className="flex-col py-3 h-auto items-start text-left"
          >
            <span className="font-bold text-ink text-xs">Regular Persona</span>
            <span className="text-[11px] text-ink-muted font-normal mt-0.5">
              Consistent 28–29 days · Low variability
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            isLoading={isSeeding}
            onClick={() => handleSeed('heavy')}
            className="flex-col py-3 h-auto items-start text-left"
          >
            <span className="font-bold text-ink text-xs">Heavy Flow Persona</span>
            <span className="text-[11px] text-ink-muted font-normal mt-0.5">
              4+ heavy bleeding days · Pain 8/10
            </span>
          </Button>
        </div>
      </Card>

      {/* 3. Data Export and Deletion */}
      <Card variant="default" padding="lg" className="space-y-4">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
          {language === 'hi' ? 'डेटा प्रबंधन' : 'Data Management'}
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-xs font-semibold text-ink">
              {language === 'hi' ? 'सभी लॉग निर्यात करें (JSON)' : 'Export Full Health Data'}
            </p>
            <p className="text-[11px] text-ink-muted">
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
          >
            {language === 'hi' ? 'निर्यात करें' : 'Export JSON'}
          </Button>
        </div>

        <div className="border-t border-surface-border pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-red-600">
              {language === 'hi' ? 'सभी डेटा मिटाएं' : 'Delete All Data'}
            </p>
            <p className="text-[11px] text-ink-muted">
              {language === 'hi'
                ? 'डिवाइस से सभी प्रविष्टियाँ हमेशा के लिए हटा दें।'
                : 'Permanently wipe all logs from this browser.'}
            </p>
          </div>

          {!showConfirmDelete ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4 text-red-600" />}
              onClick={() => setShowConfirmDelete(true)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {language === 'hi' ? 'डेटा हटाएं' : 'Wipe Data'}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDelete(false)}
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                {language === 'hi' ? 'हाँ, सब हटाएं' : 'Yes, Wipe All'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Clinical Evidence & References */}
      <Card variant="outlined" padding="md" className="text-xs text-ink-muted space-y-2">
        <h4 className="font-semibold text-ink text-xs uppercase tracking-wider">
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
      </Card>
    </div>
  );
};
