import { LogEntry } from '@/shared/types';
import { Button } from '@/app/components/Button';
import { Printer } from 'lucide-react';

export interface BriefPlaceholderProps {
  logs: LogEntry[];
  language: 'en' | 'hi';
  onLanguageChange?: (lang: 'en' | 'hi') => void;
}

export const BriefPlaceholder: React.FC<BriefPlaceholderProps> = ({
  logs,
  language,
  onLanguageChange
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-ink tracking-tight">Doctor Brief</h2>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary-soft/60 px-2.5 py-0.5 rounded-full">
              Chitthi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            {language === 'hi'
              ? 'डॉक्टर से मिलने से पहले 1-पेज का तथ्य-आधारित सारांश तैयार करें।'
              : 'One-page clinical summary ready for your next healthcare appointment.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onLanguageChange && (
            <div className="flex bg-white rounded-full p-0.5 border border-surface-border text-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-full font-medium ${language === 'en' ? 'bg-primary text-white' : 'text-ink-muted'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-full font-medium font-devanagari ${language === 'hi' ? 'bg-primary text-white' : 'text-ink-muted'}`}
              >
                हिन्दी
              </button>
            </div>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            {language === 'hi' ? 'पीडीएफ / प्रिंट' : 'Print / Save PDF'}
          </Button>
        </div>
      </div>

      {/* Printable Clinical Sheet Preview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-card space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* Clinician Sheet Header */}
        <div className="border-b border-surface-border pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                Clinical Health Summary
              </span>
              <span className="text-xs text-ink-muted">Cyculus Patient Brief</span>
            </div>
            <h3 className="text-xl font-bold text-ink mt-2">
              {language === 'hi'
                ? 'मासिक धर्म चक्र एवं लक्षण सारांश'
                : 'Menstrual Cycle & Symptom Longitudinal Summary'}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Period Covered: May 2026 – Oct 2026 (5 cycles, {logs.length || 85} logged days)
            </p>
          </div>
          <div className="text-right text-xs text-ink-muted shrink-0">
            <p className="font-semibold text-ink">Language: {language === 'hi' ? 'हिन्दी' : 'English'}</p>
            <p className="text-[10px]">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. Cycle Pattern & Intervals */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
            1. {language === 'hi' ? 'चक्र का पैटर्न एवं अवधि' : 'Cycle Characteristics & Variability'}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 bg-surface-subtle rounded-2xl border border-surface-border">
              <span className="text-ink-muted block text-[11px]">Average Cycle</span>
              <span className="text-base font-bold text-ink">33 days</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-2xl border border-surface-border">
              <span className="text-ink-muted block text-[11px]">Latest Cycle</span>
              <span className="text-base font-bold text-primary">41 days</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-2xl border border-surface-border">
              <span className="text-ink-muted block text-[11px]">Range (Min–Max)</span>
              <span className="text-base font-bold text-ink">27 – 41 days</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-2xl border border-surface-border">
              <span className="text-ink-muted block text-[11px]">Bleeding Duration</span>
              <span className="text-base font-bold text-ink">5–6 days</span>
            </div>
          </div>
        </div>

        {/* 2. Key Observations & Flags */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
            2. {language === 'hi' ? 'प्रमुख बिंदु (Observations)' : 'Identified Patterns (Evidence-Grounded)'}
          </h4>
          <div className="p-4 bg-purple-50 rounded-2xl border border-primary-soft text-xs space-y-2">
            <p className="font-semibold text-ink">
              • {language === 'hi'
                ? 'चक्र की लंबाई सामान्य सीमा से अधिक (41 दिन) — FIGO 2018 मानक (24-38 दिन)'
                : 'Cycle length extended beyond typical frequency (41 days) — FIGO 2018 Criteria (24–38 days)'}
            </p>
            <p className="text-ink-muted leading-relaxed">
              • {language === 'hi'
                ? 'चक्रों के बीच 14 दिनों का अंतर (27 से 41 दिन), जो उच्च परिवर्तनशीलता (High Variability) दर्शाता है।'
                : '14-day spread between shortest (27d) and longest (41d) cycles indicating notable variability.'}
            </p>
            <p className="text-ink-muted leading-relaxed">
              • {language === 'hi'
                ? 'माहवारी के पहले 2 दिनों में तीव्र ऐंठन (दर्द 8/10) और भारी रक्तस्राव दर्ज किया गया।'
                : 'Severe dysmenorrhea (pain 8/10) and heavy flow logged during days 1–2 of episodes.'}
            </p>
          </div>
        </div>

        {/* 3. Questions to Ask Doctor */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
            3. {language === 'hi' ? 'डॉक्टर से पूछने योग्य प्रश्न' : 'Suggested Questions for Clinician'}
          </h4>
          <ul className="list-disc list-inside text-xs text-ink space-y-1.5 pl-1 leading-relaxed">
            <li>
              {language === 'hi'
                ? 'क्या मेरे 41 दिन के चक्र और उतार-चढ़ाव के लिए हार्मोनल या थायरॉइड टेस्ट कराना चाहिए?'
                : 'Could the 41-day cycle and variability warrant evaluation for PCOS or thyroid function?'}
            </li>
            <li>
              {language === 'hi'
                ? 'पीरियड के दौरान होने वाले तीव्र दर्द (8/10) के लिए क्या उपचार बेहतर रहेगा?'
                : 'What targeted therapies are advised for dysmenorrhea reaching 8/10 severity?'}
            </li>
          </ul>
        </div>

        {/* Footer & Disclaimer */}
        <div className="pt-4 border-t border-surface-border text-[11px] text-ink-muted flex items-center justify-between">
          <p>
            {language === 'hi'
              ? 'गोपनीयता सूचना: यह डेटा केवल उपयोगकर्ता के फ़ोन में संग्रहीत है।'
              : 'Privacy Guarantee: All data generated and stored locally on patient device.'}
          </p>
          <p className="font-medium text-ink">Cyculus · Non-Diagnostic Tool</p>
        </div>
      </div>
    </div>
  );
};
