import { describe, it, expect } from 'vitest';
import knowledgeData from './knowledge.json';
import { KnowledgeRule, AlgorithmConfig } from './types';

describe('Knowledge Base (knowledge.json) Clinical Governance Audit', () => {
  const rules = knowledgeData.rules as KnowledgeRule[];
  const algorithm = knowledgeData.algorithm as AlgorithmConfig;

  it('contains all required rules with verified status', () => {
    expect(rules.length).toBeGreaterThanOrEqual(10);
    rules.forEach(rule => {
      expect(rule.id).toBeDefined();
      expect(rule.id.trim()).not.toBe('');
      // Hackathon requirement: only 'verified' rules may ship in the final demo
      expect(rule.status).toBe('verified');
    });
  });

  it('has valid clinical severities per types.ts contract', () => {
    const validSeverities = ['info', 'discuss', 'soon', 'urgent'];
    rules.forEach(rule => {
      expect(validSeverities).toContain(rule.severity);
    });
  });

  it('has complete bilingual English and Hindi copy for all patient-facing fields', () => {
    rules.forEach(rule => {
      expect(rule.title.en).toBeTruthy();
      expect(rule.title.hi).toBeTruthy();
      expect(rule.explanation.en).toBeTruthy();
      expect(rule.explanation.hi).toBeTruthy();
      expect(rule.discussWithDoctor.en).toBeTruthy();
      expect(rule.discussWithDoctor.hi).toBeTruthy();
      expect(rule.questionsForDoctor.en.length).toBeGreaterThan(0);
      expect(rule.questionsForDoctor.hi.length).toBeGreaterThan(0);
    });
  });

  it('traces every rule to an authentic, cited clinical source with URL', () => {
    rules.forEach(rule => {
      expect(rule.sources.length).toBeGreaterThan(0);
      rule.sources.forEach(source => {
        expect(source.name).toBeTruthy();
        expect(source.url).toMatch(/^https?:\/\//);
      });
    });
  });

  it('strictly adheres to non-diagnostic safety rules (no medical verdicts)', () => {
    const forbiddenPhrases = [
      'you have pcos',
      'you are pregnant',
      'diagnosed with',
      'abnormal condition',
      'take this medication',
      'prescribe'
    ];

    rules.forEach(rule => {
      const enText = `${rule.title.en} ${rule.explanation.en} ${rule.discussWithDoctor.en}`.toLowerCase();
      forbiddenPhrases.forEach(forbidden => {
        expect(enText).not.toContain(forbidden);
      });
    });
  });

  it('provides verified defaults in the algorithm configuration', () => {
    expect(algorithm.minBleedingGapDays).toBe(2);
    expect(algorithm.minCycleLengthDays).toBe(15);
    expect(algorithm.bleedingFlowLevels).toEqual(['light', 'medium', 'heavy']);
    expect(algorithm.predictionWindowBaselineCycles).toBe(3);
    expect(algorithm.coverageFactorSD).toBeGreaterThan(0);
  });
});
