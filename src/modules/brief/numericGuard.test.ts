import { describe, it, expect } from 'vitest';
import { passesNumericGuard, normalizeDigits } from './numericGuard';

describe('numeric guard', () => {
  it('accepts a number that is in the facts', () => {
    expect(
      passesNumericGuard('Your average is 29 days.', 'Average cycle length: 29 days')
    ).toBe(true);
  });

  it('rejects an invented number', () => {
    expect(
      passesNumericGuard('Your average is 31 days.', 'Average cycle length: 29 days')
    ).toBe(false);
  });

  it('rejects an invented year', () => {
    expect(
      passesNumericGuard('Since 2019 your cycles...', 'Period covered 2026-01-05 to 2026-06-30')
    ).toBe(false);
  });

  it('accepts text that has no numbers at all', () => {
    expect(passesNumericGuard('Worth discussing with a doctor.', 'any facts')).toBe(true);
  });

  it('treats Hindi digits as real numbers', () => {
    expect(passesNumericGuard('औसत २९ दिन', 'Average 29 days')).toBe(true);
    expect(passesNumericGuard('औसत ३१ दिन', 'Average 29 days')).toBe(false);
  });

  it('converts Devanagari digits to normal digits', () => {
    expect(normalizeDigits('२९')).toBe('29');
  });
});