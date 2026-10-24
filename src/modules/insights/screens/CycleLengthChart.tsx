import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea, CartesianGrid } from 'recharts';
import type { CycleSummary, KnowledgeRule } from '@/shared/types';
import { Card } from '@/app/components/Card';
import { TrendingUp } from 'lucide-react';

interface CycleLengthChartProps {
  cycles: CycleSummary[];
  rules: KnowledgeRule[];
  language: 'en' | 'hi';
}

export const CycleLengthChart: React.FC<CycleLengthChartProps> = ({ cycles, rules, language }) => {
  const completed = cycles.filter(c => c.lengthDays !== null);
  if (completed.length === 0) return null;

  // Get thresholds from rules
  const shortRule = rules.find(r => r.id === 'cycle_short');
  const longRule = rules.find(r => r.id === 'cycle_long');
  const minNormal = shortRule?.params.minCycleLength ?? 24;
  const maxNormal = longRule?.params.maxCycleLength ?? 38;

  const data = completed.map((c, i) => ({
    name: `${language === 'hi' ? 'चक्र' : 'Cycle'} ${i + 1}`,
    length: c.lengthDays!,
    bleedingDays: c.bleedingDays,
    startDate: c.startDate,
  }));

  // Calculate domain
  const allLengths = data.map(d => d.length);
  const minY = Math.min(Math.min(...allLengths) - 3, minNormal - 2);
  const maxY = Math.max(Math.max(...allLengths) + 3, maxNormal + 2);

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          {language === 'hi' ? 'चक्र अवधि ट्रेंड' : 'Cycle Length Trend'}
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300" />
            {language === 'hi' ? 'सामान्य सीमा' : `Normal (${minNormal}-${maxNormal}d)`}
          </span>
        </div>
      </div>

      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFE7F0" />

            {/* Normal range shading */}
            <ReferenceArea
              y1={minNormal}
              y2={maxNormal}
              fill="#86efac"
              fillOpacity={0.15}
              strokeOpacity={0}
            />

            {/* Threshold lines */}
            <ReferenceLine
              y={minNormal}
              stroke="#86efac"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <ReferenceLine
              y={maxNormal}
              stroke="#86efac"
              strokeDasharray="4 4"
              strokeWidth={1}
            />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6E6280' }}
              tickLine={false}
              axisLine={{ stroke: '#EFE7F0' }}
            />
            <YAxis
              domain={[minY, maxY]}
              tick={{ fontSize: 10, fill: '#6E6280' }}
              tickLine={false}
              axisLine={{ stroke: '#EFE7F0' }}
              label={{
                value: language === 'hi' ? 'दिन' : 'Days',
                angle: -90,
                position: 'insideLeft',
                offset: 30,
                style: { fontSize: 10, fill: '#6E6280' },
              }}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #EFE7F0',
                borderRadius: '12px',
                fontSize: '12px',
                padding: '8px 12px',
                boxShadow: '0 4px 20px rgba(123, 94, 167, 0.08)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'length') {
                  return [
                    `${value} ${language === 'hi' ? 'दिन' : 'days'}`,
                    language === 'hi' ? 'चक्र अवधि' : 'Cycle length',
                  ];
                }
                return [value, name];
              }}
            />
            <Line
              type="monotone"
              dataKey="length"
              stroke="#7B5EA7"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const isOutside = payload.length < minNormal || payload.length > maxNormal;
                return (
                  <circle
                    key={`dot-${payload.name}`}
                    cx={cx}
                    cy={cy}
                    r={isOutside ? 6 : 4}
                    fill={isOutside ? '#7B5EA7' : 'white'}
                    stroke="#7B5EA7"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{
                r: 7,
                fill: '#7B5EA7',
                stroke: 'white',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats row */}
      <div className="mt-3 pt-3 border-t border-surface-border flex flex-wrap justify-between gap-2 text-xs text-ink-muted">
        <span>
          {language === 'hi' ? 'कुल चक्र:' : 'Cycles tracked:'}{' '}
          <strong className="text-ink">{completed.length}</strong>
        </span>
        <span>
          {language === 'hi' ? 'रेंज:' : 'Range:'}{' '}
          <strong className="text-ink">
            {Math.min(...allLengths)}–{Math.max(...allLengths)} {language === 'hi' ? 'दिन' : 'days'}
          </strong>
        </span>
      </div>
    </Card>
  );
};
