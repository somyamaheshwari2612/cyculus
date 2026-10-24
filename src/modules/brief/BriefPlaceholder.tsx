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
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">Doctor Brief</h2>
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest bg-tint-lavender px-3 py-1 rounded-full border border-[#E7DCF8]">
              Chitthi · चिट्ठी
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
            {language === 'hi'
              ? 'डॉक्टर से मिलने से पहले 1-पेज का तथ्य-आधारित सारांश तैयार करें।'
              : 'One-page clinical summary ready for your next healthcare appointment.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onLanguageChange && (
            <div className="flex bg-white rounded-full p-1 border border-surface-border shadow-soft text-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${language === 'en' ? 'bg-primary text-white shadow-soft' : 'text-ink-muted hover:text-ink'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-3 py-1 rounded-full font-medium font-devanagari transition-all ${language === 'hi' ? 'bg-primary text-white shadow-soft' : 'text-ink-muted hover:text-ink'}`}
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
            className="rounded-full shadow-soft hover:shadow-card"
          >
            {language === 'hi' ? 'पीडीएफ / प्रिंट' : 'Print / Save PDF'}
          </Button>
        </div>
      </div>

      {/* Printable Clinical Sheet Preview */}
      <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-[2.25rem] border border-[#F3E8EE] shadow-card space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* Clinician Sheet Header */}
        <div className="border-b border-[#F3E8EE] pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint-lavender px-3 py-0.5 rounded-full border border-[#E7DCF8]">
                Clinical Health Summary
              </span>
              <span className="text-[11px] text-ink-muted">Cyculus Patient Brief</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink mt-2.5">
              {language === 'hi'
                ? 'मासिक धर्म चक्र एवं लक्षण सारांश'
                : 'Menstrual Cycle & Symptom Longitudinal Summary'}
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Period Covered: May 2026 – Oct 2026 (5 cycles, {logs.length || 85} logged days)
            </p>
          </div>
          <div className="sm:text-right text-xs text-ink-muted shrink-0 bg-tint-lavender/30 p-2.5 rounded-2xl border border-[#E7DCF8]">
            <p className="font-semibold text-ink">Language: {language === 'hi' ? 'हिन्दी' : 'English'}</p>
            <p className="text-[10px] text-ink-muted mt-0.5">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. Cycle Pattern & Intervals */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>1. {language === 'hi' ? 'चक्र का पैटर्न एवं अवधि' : 'Cycle Characteristics & Variability'}</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3.5 bg-tint-lavender/40 rounded-2xl border border-[#E7DCF8]">
              <span className="text-ink-muted block text-[11px]">Average Cycle</span>
              <span className="text-lg font-serif font-bold text-ink">33 days</span>
            </div>
            <div className="p-3.5 bg-tint-rose/40 rounded-2xl border border-[#F8DDE5]">
              <span className="text-ink-muted block text-[11px]">Latest Cycle</span>
              <span className="text-lg font-serif font-bold text-primary">41 days</span>
            </div>
            <div className="p-3.5 bg-tint-peach/40 rounded-2xl border border-[#FADCD0]">
              <span className="text-ink-muted block text-[11px]">Range (Min–Max)</span>
              <span className="text-lg font-serif font-bold text-ink">27 – 41 days</span>
            </div>
            <div className="p-3.5 bg-tint-mint/40 rounded-2xl border border-[#D8F0E4]">
              <span className="text-ink-muted block text-[11px]">Bleeding Duration</span>
              <span className="text-lg font-serif font-bold text-ink">5–6 days</span>
            </div>
          </div>
        </div>

        {/* Responsive Grid for Sections 2 & 3 on Desktop (lg:) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* 2. Key Observations & Flags */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>2. {language === 'hi' ? 'प्रमुख बिंदु (Observations)' : 'Identified Patterns (Evidence-Grounded)'}</span>
            </h4>
            <div className="p-4 sm:p-5 bg-tint-rose/30 rounded-2xl border border-[#F8DDE5] text-xs space-y-2.5">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>3. {language === 'hi' ? 'डॉक्टर से पूछने योग्य प्रश्न' : 'Suggested Questions for Clinician'}</span>
            </h4>
            <ul className="space-y-2 text-xs text-ink">
              <li className="p-3 bg-white rounded-xl border border-surface-border leading-relaxed flex items-start gap-2">
                <span className="text-primary font-bold">💬</span>
                <span>
                  {language === 'hi'
                    ? 'क्या मेरे 41 दिन के चक्र और उतार-चढ़ाव के लिए हार्मोनल या थायरॉइड टेस्ट कराना चाहिए?'
                    : 'Could the 41-day cycle and variability warrant evaluation for PCOS or thyroid function?'}
                </span>
              </li>
              <li className="p-3 bg-white rounded-xl border border-surface-border leading-relaxed flex items-start gap-2">
                <span className="text-primary font-bold">💬</span>
                <span>
                  {language === 'hi'
                    ? 'पीरियड के दौरान होने वाले तीव्र दर्द (8/10) के लिए क्या उपचार बेहतर रहेगा?'
                    : 'What targeted therapies are advised for dysmenorrhea reaching 8/10 severity?'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer & Disclaimer */}
        <div className="pt-4 border-t border-[#F3E8EE] text-[11px] text-ink-muted flex flex-wrap items-center justify-between gap-2">
          <p>
            {language === 'hi'
              ? 'गोपनीयता सूचना: यह डेटा केवल उपयोगकर्ता के फ़ोन में संग्रहीत है।'
              : 'Privacy Guarantee: All data generated and stored locally on patient device.'}
          </p>
          <p className="font-semibold text-primary">Cyculus · Non-Diagnostic Tool</p>
        </div>
      </div>
    </div>
  );
};
