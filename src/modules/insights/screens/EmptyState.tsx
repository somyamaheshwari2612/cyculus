import React from 'react';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { CalendarDays, PlusCircle, Sparkles, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  language: 'en' | 'hi';
  dataSufficiency?: 'none' | 'minimal';
  onNavigateToLog: () => void;
  onOpenSettings?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  language,
  onNavigateToLog,
  onOpenSettings,
}) => {
  return (
    <Card variant="lavender" padding="lg" className="border-primary/20 shadow-soft">
      <div className="max-w-xl mx-auto text-center py-4">
        {/* Soft Lavender Icon badge */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-soft">
          <CalendarDays className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink mb-2">
          {language === 'hi' ? 'अभी कोई प्रविष्टि नहीं है' : 'No entries yet'}
        </h3>

        {/* Core Prompt Subtitle */}
        <p className="text-sm sm:text-base text-ink-muted mb-6 max-w-md mx-auto leading-relaxed">
          {language === 'hi'
            ? 'आज के बारे में बताएं, और कुछ चक्रों के बाद आपका पैटर्न यहाँ दिखाई देगा।'
            : 'Tell us about today, and your pattern will appear here after a few cycles.'}
        </p>

        {/* Obvious Primary Action Button */}
        <div className="flex justify-center mb-8">
          <Button
            variant="primary"
            size="lg"
            icon={<PlusCircle className="w-5 h-5" />}
            onClick={onNavigateToLog}
            className="shadow-soft px-8 font-bold"
          >
            {language === 'hi' ? 'आज के बारे में बताएं' : 'Tell us about today'}
          </Button>
        </div>

        {/* What to do next & What unlocks (Explaining empty charts) */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#E7DCF8] text-left space-y-3 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'hi'
                ? 'खाली चार्ट कुछ नहीं बताता — लॉग करने पर क्या दिखेगा:'
                : 'An empty chart tells you nothing. Here is what appears as you log:'}
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-tint-lavender/40 rounded-xl border border-[#E7DCF8]">
              <span className="font-bold text-ink block mb-0.5">1. {language === 'hi' ? 'दैनिक चेक-इन' : 'Daily Check-in'}</span>
              <p className="text-[11px] text-ink-muted leading-snug">
                {language === 'hi'
                  ? 'रक्तस्राव, दर्द, और लक्षण 1-टैप में दर्ज करें।'
                  : 'Log flow, pain, and mood in 1-tap or your own voice.'}
              </p>
            </div>

            <div className="p-3 bg-tint-rose/30 rounded-xl border border-[#F8DDE5]">
              <span className="font-bold text-ink block mb-0.5">2. {language === 'hi' ? 'टाइमलाइन कैलेंडर' : 'Cycle Timeline'}</span>
              <p className="text-[11px] text-ink-muted leading-snug">
                {language === 'hi'
                  ? 'पहले चक्र से ही आपके रक्तस्राव का इतिहास दिखेगा।'
                  : 'Visual timeline of your cycle days and flow rhythm.'}
              </p>
            </div>

            <div className="p-3 bg-tint-mint/40 rounded-xl border border-[#D8F0E4]">
              <span className="font-bold text-ink block mb-0.5">3. {language === 'hi' ? 'अंशांकित विंडो' : 'Calibrated Window'}</span>
              <p className="text-[11px] text-ink-muted leading-snug">
                {language === 'hi'
                  ? '3+ चक्रों के बाद यूटा हाइव मॉडल का ±3 दिन का सटीक अनुमान।'
                  : 'After a few cycles, empirical Utah Hive prediction (~80% coverage).'}
              </p>
            </div>
          </div>
        </div>

        {/* Optional Explore Demo Persona hint */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-primary transition-colors cursor-pointer pt-1"
          >
            <span>
              {language === 'hi'
                ? 'पहले देखना चाहती हैं कि यह कैसा दिखता है? सेटिंग्स में डेमो डेटा लोड करें'
                : 'Prefer to preview with sample clinical data first? Load demo in Settings'}
            </span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </Card>
  );
};
