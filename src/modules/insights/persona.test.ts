import { describe, it, expect } from 'vitest';
import { computeInsights } from './index';
import knowledgeData from '@/shared/knowledge.json';
import irregularData from '@/shared/mocks/entries.irregular.json';
import regularData from '@/shared/mocks/entries.regular.json';
import heavyData from '@/shared/mocks/entries.heavy.json';
import { LogEntry } from '@/shared/types';

describe('Persona Snapshot & Flag Invariance Tests', () => {
  const knowledge = knowledgeData as any;
  const todayStr = '2026-10-24';

  describe('Persona A: Riya (Irregular / 41-day cycle)', () => {
    it('accurately identifies 41-day cycle and asserts FIGO cycle_long flag', () => {
      const insights = computeInsights(irregularData as LogEntry[], knowledge, todayStr);

      // Verify cycle metrics
      expect(insights.cycles.length).toBeGreaterThanOrEqual(3);
      expect(insights.stats).toBeDefined();
      expect(insights.stats?.longest).toBe(41);

      // Assert FIGO 2018 cycle_long flag (>38 days)
      const longFlag = insights.flags.find(f => f.ruleId === 'cycle_long');
      expect(longFlag).toBeDefined();
      expect(longFlag?.severity).toBe('discuss');
      expect(longFlag?.evidence).toHaveProperty('longestCycle', 41);

      // Assert high cycle variability flag (spread > 9 days)
      const variabilityFlag = insights.flags.find(f => f.ruleId === 'cycle_variability_high');
      expect(variabilityFlag).toBeDefined();
      expect((variabilityFlag?.evidence as any)?.longest).toBe(41);
    });
  });

  describe('Persona B: Regular Cycles', () => {
    it('asserts zero clinical flags for standard 28-day physiological rhythm', () => {
      const insights = computeInsights(regularData as LogEntry[], knowledge, todayStr);

      // Standard cycles within adult normal limits (24-38 days)
      expect(insights.cycles.length).toBeGreaterThanOrEqual(3);
      expect(insights.stats?.shortest).toBeGreaterThanOrEqual(24);
      expect(insights.stats?.longest).toBeLessThanOrEqual(38);

      // Must have zero clinical flags
      expect(insights.flags).toEqual([]);
      expect(insights.flags.length).toBe(0);
    });
  });

  describe('Persona C: Heavy Menstrual Bleeding', () => {
    it('asserts heavy_flow_persistent flag per NICE & ACOG criteria', () => {
      const insights = computeInsights(heavyData as LogEntry[], knowledge, todayStr);

      expect(insights.cycles.length).toBeGreaterThanOrEqual(3);

      // Assert heavy flow persistent flag (>= 3 consecutive heavy days per NICE/ACOG criteria)
      const heavyFlag = insights.flags.find(f => f.ruleId === 'heavy_flow_persistent');
      expect(heavyFlag).toBeDefined();
      expect(heavyFlag?.severity).toBe('soon');
      const consecHeavy = (heavyFlag?.evidence as any)?.maxConsecutiveHeavyDays ?? 0;
      const totalHeavy = (heavyFlag?.evidence as any)?.maxTotalHeavyDays ?? 0;
      expect(consecHeavy >= 3 || totalHeavy >= 4).toBe(true);
    });
  });
});
