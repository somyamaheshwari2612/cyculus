import React from 'react';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { CalendarDays, BarChart3, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  language: 'en' | 'hi';
  dataSufficiency: 'none' | 'minimal';
  onNavigateToLog: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ language, dataSufficiency, onNavigateToLog }) => {
  const isNone = dataSufficiency === 'none';

  return (
    <Card variant="lavender" padding="lg" className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        {isNone ? (
          <CalendarDays className="w-8 h-8 text-primary" />
        ) : (
          <BarChart3 className="w-8 h-8 text-primary" />
        )}
      </div>

      <h3 className="text-lg font-bold text-ink mb-2">
        {isNone
          ? language === 'hi'
            ? 'अभी तक कोई चक्र डेटा नहीं'
            : 'No cycle data yet'
          : language === 'hi'
            ? 'अभी सीमित डेटा उपलब्ध है'
            : 'Limited data available'
        }
      </h3>

      <p className="text-sm text-ink-muted mb-4 max-w-xs mx-auto leading-relaxed">
        {isNone
          ? language === 'hi'
            ? 'अपने चक्र का रिकॉर्ड रखना शुरू करें। कम से कम एक पूरे चक्र के बाद यहाँ आपका पैटर्न दिखेगा।'
            : 'Start logging your cycle. After at least one complete cycle, your patterns will appear here.'
          : language === 'hi'
            ? 'आपके पास 1-2 चक्रों का डेटा है। सटीक अनुमान के लिए 3+ चक्रों का डेटा आवश्यक है।'
            : 'You have 1-2 cycles of data. For more accurate predictions, log at least 3 complete cycles.'
        }
      </p>

      {isNone && (
        <div className="flex items-center justify-center gap-2 text-xs text-primary bg-primary-soft/50 rounded-xl px-3 py-2 mb-4 mx-auto max-w-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {language === 'hi'
              ? 'नीचे दिए गए अनुमान अधिक डेटा के साथ बेहतर होंगे'
              : 'Insights will improve as you log more data'}
          </span>
        </div>
      )}

      <Button variant="primary" size="md" onClick={onNavigateToLog}>
        {language === 'hi' ? '+ आज का चेक-इन करें' : '+ Log Today'}
      </Button>
    </Card>
  );
};
