import React, { useState, useMemo } from 'react';
import type { LogEntry, Prediction } from '@/shared/types';
import { FLOW_LABELS, SYMPTOM_LABELS } from '@/shared/translations';
import { Card } from '@/app/components/Card';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Droplet } from 'lucide-react';

interface CycleTimelineProps {
  logs: LogEntry[];
  prediction: Prediction | null;
  language: 'en' | 'hi';
}

export const CycleTimeline: React.FC<CycleTimelineProps> = ({
  logs,
  prediction,
  language,
}) => {
  // Map date -> LogEntry for quick lookup
  const logMap = useMemo(() => {
    const map = new Map<string, LogEntry>();
    for (const log of logs) {
      map.set(log.date, log);
    }
    return map;
  }, [logs]);

  // Current month being viewed
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    // Default to the month of the latest log or current date
    if (logs.length > 0) {
      const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
      const latest = new Date(sorted[0].date);
      return new Date(latest.getFullYear(), latest.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Month days generation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday

  const days = useMemo(() => {
    const arr: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    // Padding from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      arr.push({ dateStr: '', dayNum: 0, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;
      arr.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }
    return arr;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  // Helper to check if a date is inside prediction window
  const getPredictionStatus = (dateStr: string) => {
    if (!prediction) return null;
    if (dateStr === prediction.expected) return 'expected';
    if (dateStr >= prediction.earliest && dateStr <= prediction.latest) return 'window';
    return null;
  };

  const selectedEntry = selectedDate ? logMap.get(selectedDate) : null;
  const isSelectedDatePredicted = selectedDate ? getPredictionStatus(selectedDate) : null;

  const weekDayHeaders = language === 'hi'
    ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentMonthYearPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLogs = logs.filter(l => l.date.startsWith(currentMonthYearPrefix));
  const bleedDays = monthLogs.filter(l => l.flow && l.flow !== 'none').length;

  let headline = '';
  if (monthLogs.length === 0) {
    headline = language === 'hi'
      ? `${monthName} में अभी कोई एंट्री लॉग नहीं है।`
      : `No daily entries recorded for ${monthName}.`;
  } else if (bleedDays > 0) {
    headline = language === 'hi'
      ? `${monthName} में पीरियड के ${bleedDays} दिन और कुल ${monthLogs.length} दिन लॉग हुए हैं।`
      : `${bleedDays} bleeding days and ${monthLogs.length} daily entries recorded in ${monthName}.`;
  } else {
    headline = language === 'hi'
      ? `${monthName} में ${monthLogs.length} दिन लक्षण लॉग किए गए हैं।`
      : `${monthLogs.length} daily symptom entries recorded in ${monthName}.`;
  }

  return (
    <Card variant="default" padding="lg">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{language === 'hi' ? 'चक्र कैलेंडर और टाइमलाइन' : 'Cycle Calendar & Timeline'}</span>
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-xl hover:bg-surface-subtle text-ink-muted hover:text-ink cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-ink min-w-[110px] text-center">
              {monthName}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-xl hover:bg-surface-subtle text-ink-muted hover:text-ink cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic takeaway headline */}
        <h4 className="text-lg sm:text-xl font-serif font-bold text-ink tracking-tight">
          {headline}
        </h4>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDayHeaders.map((wd, i) => (
          <span key={i} className="text-[10px] font-semibold text-ink-muted">
            {wd}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="h-10 sm:h-12 rounded-xl" />;
          }

          const entry = logMap.get(day.dateStr);
          const hasFlow = entry?.flow && entry.flow !== 'none';
          const flow = entry?.flow;
          const pred = getPredictionStatus(day.dateStr);
          const isSelected = selectedDate === day.dateStr;

          // Styling according to flow or prediction
          let bgClass = 'bg-surface-subtle/50 hover:bg-surface-subtle';
          let borderClass = 'border-transparent';
          let textClass = 'text-ink';

          if (hasFlow) {
            if (flow === 'heavy') {
              bgClass = 'bg-rose-600 text-white font-bold';
              textClass = 'text-white';
            } else if (flow === 'medium') {
              bgClass = 'bg-rose-400 text-white font-semibold';
              textClass = 'text-white';
            } else if (flow === 'light') {
              bgClass = 'bg-rose-200 text-rose-900 font-medium';
              textClass = 'text-rose-900';
            } else if (flow === 'spotting') {
              bgClass = 'bg-pink-100 text-pink-800 font-medium';
              textClass = 'text-pink-800';
            }
          } else if (pred === 'expected') {
            bgClass = 'bg-primary/20 text-primary font-bold';
            borderClass = 'border-primary border-2 border-dashed';
            textClass = 'text-primary';
          } else if (pred === 'window') {
            bgClass = 'bg-primary/10 text-primary';
            borderClass = 'border-primary/40 border border-dashed';
            textClass = 'text-primary';
          }

          if (isSelected) {
            borderClass = 'ring-2 ring-primary ring-offset-1';
          }

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => setSelectedDate(day.dateStr)}
              className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-between p-1 transition-all cursor-pointer relative ${bgClass} ${borderClass}`}
            >
              <span className={`text-xs ${textClass}`}>
                {day.dayNum}
              </span>

              {/* Indicators */}
              <div className="flex items-center gap-0.5 justify-center w-full">
                {pred === 'expected' && (
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                )}
                {entry?.symptoms && entry.symptoms.length > 0 && !hasFlow && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                {entry?.painLevel !== null && entry?.painLevel !== undefined && entry.painLevel > 4 && !hasFlow && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-surface-border flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-muted">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            {language === 'hi' ? 'पीरियड फ्लो' : 'Period Flow'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary border-dashed" />
            {language === 'hi' ? 'अनुमानित विंडो' : 'Predicted Window'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {language === 'hi' ? 'लक्षण' : 'Symptoms'}
          </span>
        </div>
        {prediction && (
          <span className="text-primary font-medium">
            {language === 'hi' ? '±3 दिन का सटीक दायरा' : 'Calibrated Window'}
          </span>
        )}
      </div>

      {/* Selected day details drawer/card */}
      {selectedDate && (
        <div className="mt-3 p-3 bg-surface-subtle rounded-2xl border border-surface-border animate-in slide-in-from-top-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-[11px] text-ink-muted hover:text-ink cursor-pointer"
            >
              ✕ {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>

          {selectedEntry ? (
            <div className="space-y-1.5 text-xs">
              {selectedEntry.flow && selectedEntry.flow !== 'none' && (
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted">{language === 'hi' ? 'फ्लो:' : 'Flow:'}</span>
                  <span className="font-semibold text-rose-700 flex items-center gap-1">
                    <Droplet className="w-3 h-3 fill-rose-600 text-rose-600" />
                    {FLOW_LABELS[selectedEntry.flow]?.[language] || selectedEntry.flow}
                  </span>
                </div>
              )}
              {selectedEntry.painLevel !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted">{language === 'hi' ? 'दर्द (0–10):' : 'Pain Level:'}</span>
                  <span className="font-semibold text-ink">{selectedEntry.painLevel}/10</span>
                </div>
              )}
              {selectedEntry.symptoms.length > 0 && (
                <div>
                  <span className="text-ink-muted block mb-1">{language === 'hi' ? 'लक्षण:' : 'Symptoms:'}</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntry.symptoms.map(s => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-lg bg-white border border-surface-border text-[11px] text-ink font-medium"
                      >
                        {SYMPTOM_LABELS[s]?.emoji} {SYMPTOM_LABELS[s]?.[language] || s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedEntry.notes && (
                <p className="text-ink-muted italic pt-1 border-t border-surface-border">
                  "{selectedEntry.notes}"
                </p>
              )}
            </div>
          ) : isSelectedDatePredicted ? (
            <p className="text-xs text-primary font-medium">
              {isSelectedDatePredicted === 'expected'
                ? language === 'hi'
                  ? 'पीरियड की अंदाज़ित तारीख'
                  : 'Expected period center date based on cycle history'
                : language === 'hi'
                ? 'पीरियड के अंदाज़ित दायरे में'
                : 'Within your predicted period window'}
            </p>
          ) : (
            <p className="text-xs text-ink-muted italic">
              {language === 'hi' ? 'इस दिन कोई एंट्री लॉग नहीं है।' : 'No entries logged on this day.'}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
