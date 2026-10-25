import { describe, it, expect } from 'vitest';
import type { LogEntry, Insights, KnowledgeBase } from '@/shared/types';
import { computeInsights } from './engine/computeInsights';
import knowledgeData from '@/shared/knowledge.json';

import regularLogs from '@/shared/mocks/entries.regular.json';
import irregularLogs from '@/shared/mocks/entries.irregular.json';
import heavyLogs from '@/shared/mocks/entries.heavy.json';

const knowledge = knowledgeData as KnowledgeBase;
const testDate = '2026-10-24';

describe('Persona Validation Suite', () => {
  it('validates regular persona (Ananya) shows normal range and 0 flags', () => {
    const insights: Insights = computeInsights(regularLogs as LogEntry[], knowledge, testDate);
    expect(insights.dataSufficiency).toBe('ok');
    expect(insights.stats).not.toBeNull();
    expect(insights.stats?.avgCycleLength).toBeGreaterThanOrEqual(27);
    expect(insights.stats?.avgCycleLength).toBeLessThanOrEqual(30);
    // Regular persona has no clinical flags
    expect(insights.flags.length).toBe(0);
    // Prediction is generated with high confidence
    expect(insights.prediction).not.toBeNull();
    expect(insights.prediction?.confidence).toBe('high');
  });

  it('validates irregular persona (Riya) triggers cycle_long and variability flags', () => {
    const insights: Insights = computeInsights(irregularLogs as LogEntry[], knowledge, testDate);
    expect(insights.dataSufficiency).toBe('ok');
    expect(insights.stats).not.toBeNull();
    
    // Check for FIGO cycle_long (>38 days) triggered by the 41-day cycle
    const flagLong = insights.flags.find(f => f.ruleId === 'cycle_long');
    expect(flagLong).toBeDefined();
    expect(flagLong?.severity).toBe('discuss');

    // Check for high variability flag (>9 days range)
    const flagVar = insights.flags.find(f => f.ruleId === 'cycle_variability_high');
    expect(flagVar).toBeDefined();

    // Check prediction window is wider due to variance
    expect(insights.prediction).not.toBeNull();
    if (insights.prediction) {
      const earliest = new Date(insights.prediction.earliest).getTime();
      const latest = new Date(insights.prediction.latest).getTime();
      const windowDays = (latest - earliest) / (1000 * 60 * 60 * 24);
      expect(windowDays).toBeGreaterThanOrEqual(6);
    }
  });

  it('validates heavy bleeder persona (Priya) triggers heavy bleeding flag', () => {
    const insights: Insights = computeInsights(heavyLogs as LogEntry[], knowledge, testDate);
    expect(insights.dataSufficiency).toBe('ok');

    const flagHeavy = insights.flags.find(f => f.ruleId === 'heavy_flow_persistent');
    expect(flagHeavy).toBeDefined();
    expect(flagHeavy?.severity).toBe('soon');
  });
});
