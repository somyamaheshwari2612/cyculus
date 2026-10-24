import React from 'react';
import { LogEntry, Insights, UserSetup } from '@/shared/types';
import { Button } from '@/app/components';
import { Printer, Info } from 'lucide-react';

export interface BriefPlaceholderProps {
  logs: LogEntry[];
  insights: Insights;
  userSetup?: UserSetup | null;
  language: 'en' | 'hi';
  onLanguageChange?: (lang: 'en' | 'hi') => void;
}

export const BriefPlaceholder: React.FC<BriefPlaceholderProps> = ({
  logs,
  insights,
  userSetup,
  language,
  onLanguageChange
}) => {
  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const sortedDates = [...logs.map(l => l.date)].sort();
  const fromDate = sortedDates[0] || userSetup?.lastPeriodStart || todayStr;
  const toDate = sortedDates[sortedDates.length - 1] || todayStr;

  const completedCycles = insights.cycles.filter(c => c.lengthDays !== null);
  const latestObserved = completedCycles.length > 0
    ? completedCycles[completedCycles.length - 1].lengthDays
    : null;

  // Most frequent symptoms from user's actual logs only
  const symptomCounts: Record<string, number> = {};
  let maxPainLogged: number = 0;
  for (const log of logs) {
    if (log.painLevel && log.painLevel > maxPainLogged) {
      maxPainLogged = log.painLevel;
    }
    for (const sym of log.symptoms) {
      symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
    }
  }

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const symptomLabels: Record<string, { en: string; hi: string }> = {
    cramps: { en: 'Cramps (Dysmenorrhea)', hi: 'माहवारी का दर्द (ऐंठन)' },
    lower_back_pain: { en: 'Lower back pain', hi: 'कमर दर्द' },
    pelvic_pain: { en: 'Pelvic pain', hi: 'पेल्विक दर्द' },
    headache: { en: 'Headache', hi: 'सिरदर्द' },
    bloating: { en: 'Bloating', hi: 'पेट फूलना' },
    fatigue: { en: 'Fatigue', hi: 'थकान' },
    breast_tenderness: { en: 'Breast tenderness', hi: 'स्तनों में भारीपन' },
    nausea: { en: 'Nausea', hi: 'जी मिचलाना' }
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
              Period Covered: {fromDate} to {toDate} ({insights.cycles.length} observed cycles, {logs.length} logged days)
            </p>
          </div>
          <div className="sm:text-right text-xs text-ink-muted shrink-0 bg-tint-lavender/30 p-2.5 rounded-2xl border border-[#E7DCF8]">
            <p className="font-semibold text-ink">Language: {language === 'hi' ? 'हिन्दी' : 'English'}</p>
            <p className="text-[10px] text-ink-muted mt-0.5">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. Cycle Pattern & Observed Intervals */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>1. {language === 'hi' ? 'दर्ज चक्र का पैटर्न एवं अवधि' : 'Logged Cycle Characteristics (Observed Facts)'}</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3.5 bg-tint-lavender/40 rounded-2xl border border-[#E7DCF8]">
              <span className="text-ink-muted block text-[11px]">Observed Average</span>
              <span className="text-lg font-serif font-bold text-ink">
                {insights.stats ? `${insights.stats.avgCycleLength} days` : '— (logging needed)'}
              </span>
            </div>
            <div className="p-3.5 bg-tint-rose/40 rounded-2xl border border-[#F8DDE5]">
              <span className="text-ink-muted block text-[11px]">Latest Cycle</span>
              <span className="text-lg font-serif font-bold text-primary">
                {latestObserved !== null ? `${latestObserved} days` : 'In progress'}
              </span>
            </div>
            <div className="p-3.5 bg-tint-peach/40 rounded-2xl border border-[#FADCD0]">
              <span className="text-ink-muted block text-[11px]">Range (Min–Max)</span>
              <span className="text-lg font-serif font-bold text-ink">
                {insights.stats ? `${insights.stats.shortest} – ${insights.stats.longest} days` : '—'}
              </span>
            </div>
            <div className="p-3.5 bg-tint-mint/40 rounded-2xl border border-[#D8F0E4]">
              <span className="text-ink-muted block text-[11px]">Bleeding Duration</span>
              <span className="text-lg font-serif font-bold text-ink">
                {insights.stats ? `~${insights.stats.avgBleedingDays} days` : '—'}
              </span>
            </div>
          </div>

          {/* Labeled Line for Self-Reported Prior (Kept separate from logged facts) */}
          {userSetup && (
            <div className="mt-3 p-3 rounded-2xl bg-tint-lavender/30 border border-[#E7DCF8] text-xs text-ink-muted flex items-start gap-2">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span>
                  {language === 'hi' ? 'स्व-सूचित चक्र अनुमान: ' : 'Self-reported typical cycle: '}
                  <strong className="text-ink font-semibold">
                    {userSetup.typicalCycleLength ? `${userSetup.typicalCycleLength} days` : 'Not specified'}
                  </strong>
                  <span className="text-[11px] text-ink-muted ml-1">
                    ({language === 'hi' ? 'उपयोगकर्ता का अनुमान; लॉग प्रविष्टियों से असत्यापित' : 'patient estimate; unverified prior'})
                  </span>
                </span>
                {userSetup.lastPeriodStart && (
                  <span className="block mt-0.5 text-[11px]">
                    {language === 'hi' ? 'स्व-सूचित पिछली माहवारी: ' : 'Self-reported last period start: '}
                    <strong>{userSetup.lastPeriodStart}</strong>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Responsive Grid for Sections 2 & 3 on Desktop (lg:) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* 2. Key Observations & Flags (Strictly from real entries) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>2. {language === 'hi' ? 'प्रमुख बिंदु (Observations)' : 'Identified Patterns (Evidence-Grounded)'}</span>
            </h4>
            <div className="p-4 sm:p-5 bg-tint-rose/30 rounded-2xl border border-[#F8DDE5] text-xs space-y-2.5">
              {insights.flags.length > 0 ? (
                <>
                  {insights.flags.some(f => f.ruleId === 'cycle_long') && (
                    <p className="font-semibold text-ink">
                      • {language === 'hi'
                        ? `चक्र की लंबाई सामान्य सीमा से अधिक (${insights.stats?.longest} दिन) — FIGO 2018 मानक (24-38 दिन)`
                        : `Cycle length extended beyond typical frequency (${insights.stats?.longest} days) — FIGO 2018 Criteria (24–38 days)`}
                    </p>
                  )}
                  {insights.flags.some(f => f.ruleId === 'cycle_short') && (
                    <p className="font-semibold text-ink">
                      • {language === 'hi'
                        ? `चक्र की लंबाई सामान्य सीमा से कम (${insights.stats?.shortest} दिन) — FIGO 2018 मानक (24-38 दिन)`
                        : `Cycle length shorter than standard interval (${insights.stats?.shortest} days) — FIGO 2018 Criteria (24–38 days)`}
                    </p>
                  )}
                  {insights.flags.some(f => f.ruleId === 'cycle_variability_high') && (
                    <p className="text-ink-muted leading-relaxed">
                      • {language === 'hi'
                        ? `चक्रों के बीच ${(insights.stats?.longest || 0) - (insights.stats?.shortest || 0)} दिनों का अंतर, जो उच्च परिवर्तनशीलता दर्शाता है।`
                        : `${(insights.stats?.longest || 0) - (insights.stats?.shortest || 0)}-day spread between shortest and longest observed cycles indicating notable variability.`}
                    </p>
                  )}
                  {maxPainLogged >= 7 && (
                    <p className="text-ink-muted leading-relaxed">
                      • {language === 'hi'
                        ? `तीव्र दर्द (दर्द स्तर ${maxPainLogged}/10) दर्ज किया गया।`
                        : `Severe pain level (${maxPainLogged}/10) logged during bleeding days.`}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-semibold text-ink">
                  {insights.stats
                    ? language === 'hi'
                      ? `दर्ज चक्रों की औसत अवधि (${insights.stats.avgCycleLength} दिन) FIGO सामान्य सीमा (24-38 दिन) के भीतर है।`
                      : `Observed cycle duration (${insights.stats.avgCycleLength} days) is within FIGO 2018 adult normal limits (24–38 days).`
                    : language === 'hi'
                      ? 'क्लिनिकल पैटर्न की पुष्टि के लिए कम से कम 1-2 पूरे चक्र का दैनिक डेटा दर्ज करें।'
                      : 'Log at least 1-2 completed cycles to evaluate clinical patterns.'}
                </p>
              )}

              {/* Top symptoms summarized */}
              {topSymptoms.length > 0 && (
                <p className="text-ink-muted leading-relaxed">
                  • {language === 'hi' ? 'सर्वाधिक दर्ज लक्षण: ' : 'Most frequent logged symptoms: '}
                  {topSymptoms.map(([sym, count]) => {
                    const label = symptomLabels[sym]
                      ? (language === 'hi' ? symptomLabels[sym].hi : symptomLabels[sym].en)
                      : sym;
                    return `${label} (${count}d)`;
                  }).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* 3. Questions to Ask Doctor */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>3. {language === 'hi' ? 'डॉक्टर से पूछने योग्य प्रश्न' : 'Suggested Questions for Clinician'}</span>
            </h4>
            <ul className="space-y-2 text-xs text-ink">
              {insights.flags.some(f => f.ruleId === 'cycle_long' || f.ruleId === 'cycle_variability_high') ? (
                <>
                  <li className="p-3 bg-white rounded-xl border border-surface-border leading-relaxed flex items-start gap-2">
                    <span className="text-primary font-bold">💬</span>
                    <span>
                      {language === 'hi'
                        ? `क्या मेरे ${insights.stats?.longest} दिन के चक्र और उतार-चढ़ाव के लिए हार्मोनल या थायरॉइड टेस्ट कराना चाहिए?`
                        : `Could my observed ${insights.stats?.longest}-day cycle and variability warrant evaluation for PCOS or thyroid function?`}
                    </span>
                  </li>
                  <li className="p-3 bg-white rounded-xl border border-surface-border leading-relaxed flex items-start gap-2">
                    <span className="text-primary font-bold">💬</span>
                    <span>
                      {language === 'hi'
                        ? 'अनियमितता के प्रबंधन के लिए कौन से जीवनशैली या चिकित्सकीय कदम उपयुक्त रहेंगे?'
                        : 'What lifestyle or clinical steps are recommended to support cycle regularity?'}
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="p-3 bg-white rounded-xl border border-surface-border leading-relaxed flex items-start gap-2">
                    <span className="text-primary font-bold">💬</span>
                    <span>
                      {language === 'hi'
                        ? 'माहवारी के दौरान ऊर्जा स्तर बनाए रखने के लिए क्या पोषण संबंधी सुझाव हैं?'
                        : 'What nutritional or hydration guidelines are recommended to sustain energy across cycle phases?'}
                    </span>
                  </li>
                  <li className="p-3 bg-white rounded-xl border border-surface-border leading-relaxed flex items-start gap-2">
                    <span className="text-primary font-bold">💬</span>
                    <span>
                      {language === 'hi'
                        ? 'क्या मेरी उम्र के लिए किसी नियमित स्क्रीनिंग की सिफारिश की जाती है?'
                        : 'Are there any routine health screenings recommended for my age group?'}
                    </span>
                  </li>
                </>
              )}
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
