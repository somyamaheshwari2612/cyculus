import { describe, it, expect } from 'vitest';
import { mergeDayPatch } from './mergePatch';
import { LogEntry, DayPatch } from '@/shared/types';

describe('mergeDayPatch', () => {
  it('creates a fresh entry when no existing entry exists for the day', () => {
    const patch: DayPatch = {
      date: '2026-10-24',
      flow: 'medium',
      painLevel: 5,
      symptoms: ['cramps', 'headache'],
      moods: ['low'],
      notes: 'felt tired'
    };

    const result = mergeDayPatch(undefined, patch, 'text', 'kal se pet dard hai');

    expect(result.date).toBe('2026-10-24');
    expect(result.flow).toBe('medium');
    expect(result.painLevel).toBe(5);
    expect(result.symptoms).toEqual(['cramps', 'headache']);
    expect(result.moods).toEqual(['low']);
    expect(result.notes).toBe('felt tired');
    expect(result.sources).toEqual(['text']);
    expect(result.rawTexts).toEqual(['kal se pet dard hai']);
    expect(result.updatedAt).toBeDefined();
  });

  it('unions symptoms and moods without duplicates', () => {
    const existing: LogEntry = {
      date: '2026-10-24',
      flow: 'light',
      painLevel: 3,
      symptoms: ['cramps', 'bloating'],
      moods: ['irritable'],
      notes: 'initial note',
      sources: ['tap'],
      rawTexts: [],
      updatedAt: '2026-10-24T10:00:00.000Z'
    };

    const patch: DayPatch = {
      date: '2026-10-24',
      symptoms: ['bloating', 'fatigue'],
      moods: ['anxious', 'irritable']
    };

    const result = mergeDayPatch(existing, patch, 'voice', 'bohot thakaan ho rahi hai');

    expect(result.symptoms).toEqual(['cramps', 'bloating', 'fatigue']);
    expect(result.moods).toEqual(['irritable', 'anxious']);
    expect(result.sources).toEqual(['tap', 'voice']);
    expect(result.rawTexts).toEqual(['bohot thakaan ho rahi hai']);
  });

  it('overwrites flow and painLevel when non-null in patch, keeps existing when null/undefined', () => {
    const existing: LogEntry = {
      date: '2026-10-24',
      flow: 'light',
      painLevel: 3,
      symptoms: [],
      moods: [],
      notes: '',
      sources: ['tap'],
      rawTexts: [],
      updatedAt: '2026-10-24T10:00:00.000Z'
    };

    // Case 1: patch has new flow and pain
    const patch1: DayPatch = {
      date: '2026-10-24',
      flow: 'heavy',
      painLevel: 8
    };
    const result1 = mergeDayPatch(existing, patch1, 'text');
    expect(result1.flow).toBe('heavy');
    expect(result1.painLevel).toBe(8);

    // Case 2: patch has null or undefined flow, existing remains
    const patch2: DayPatch = {
      date: '2026-10-24',
      flow: null,
      notes: 'just updating notes'
    };
    const result2 = mergeDayPatch(result1, patch2, 'tap');
    expect(result2.flow).toBe('heavy'); // kept
    expect(result2.painLevel).toBe(8); // kept
  });

  it('appends notes neatly with newline separator', () => {
    const existing: LogEntry = {
      date: '2026-10-24',
      flow: null,
      painLevel: null,
      symptoms: [],
      moods: [],
      notes: 'Morning: feeling okay.',
      sources: ['tap'],
      rawTexts: [],
      updatedAt: '2026-10-24T08:00:00.000Z'
    };

    const patch: DayPatch = {
      date: '2026-10-24',
      notes: 'Evening: cramps got worse.'
    };

    const result = mergeDayPatch(existing, patch, 'tap');
    expect(result.notes).toBe('Morning: feeling okay.\nEvening: cramps got worse.');
  });
});
