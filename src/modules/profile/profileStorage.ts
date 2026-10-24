import { UserProfile, LogEntry, FlowLevel } from '@/shared/types';
import { addDays } from '@/modules/insights/cycleEngine';

const PROFILE_KEY = 'cyculus_user_profile';

export function getDefaultProfile(): UserProfile {
  // Default to 14 days ago so day 14 is highlighted by default on cold-start
  const defaultDate = addDays(new Date().toISOString().split('T')[0], -13);

  return {
    name: 'Somya',
    lastPeriodStartDate: defaultDate,
    typicalCycleLength: 28,
    typicalPeriodDuration: 5,
    previousCycleLengths: [28, 29, 28],
    createdAt: new Date().toISOString(),
    isCustomProfile: false
  };
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name && parsed.lastPeriodStartDate) {
        return parsed as UserProfile;
      }
    }
  } catch (err) {
    console.error('Failed to load user profile from localStorage:', err);
  }
  return getDefaultProfile();
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile to localStorage:', err);
  }
}

/**
 * Generate synthetic baseline LogEntry objects for a user profile
 * so their personal diary has their real period history immediately.
 */
export function generateBaselineLogs(profile: UserProfile): LogEntry[] {
  const entries: LogEntry[] = [];
  const duration = Math.min(10, Math.max(2, profile.typicalPeriodDuration || 5));
  const cycleLengths = profile.previousCycleLengths && profile.previousCycleLengths.length > 0
    ? profile.previousCycleLengths
    : [profile.typicalCycleLength || 28, profile.typicalCycleLength || 28];

  // Helper to create bleeding days for a given start date
  function createEpisode(startDate: string, isPast: boolean = false) {
    const flows: FlowLevel[] = ['heavy', 'heavy', 'medium', 'medium', 'light', 'light', 'spotting'];
    for (let day = 0; day < duration; day++) {
      const date = addDays(startDate, day);
      const flow = flows[Math.min(day, flows.length - 1)];
      const painLevel = day === 0 || day === 1 ? (isPast ? 5 : 4) : day === 2 ? 3 : 1;

      entries.push({
        date,
        flow,
        painLevel,
        symptoms: day < 2 ? ['cramps', 'bloating'] : day < 4 ? ['bloating'] : [],
        moods: day < 2 ? ['low'] : ['calm'],
        notes: day === 0 ? 'Period started' : '',
        sources: ['tap'],
        rawTexts: [],
        updatedAt: new Date().toISOString()
      });
    }
  }

  // 1. Current / Most recent cycle period episode
  createEpisode(profile.lastPeriodStartDate, false);

  // 2. Previous cycles calculated backwards
  let currentStart = profile.lastPeriodStartDate;
  for (let i = 0; i < cycleLengths.length; i++) {
    const len = cycleLengths[i];
    const prevStart = addDays(currentStart, -len);
    createEpisode(prevStart, true);
    currentStart = prevStart;
  }

  // Deduplicate and sort by date ascending
  const uniqueMap = new Map<string, LogEntry>();
  for (const entry of entries) {
    uniqueMap.set(entry.date, entry);
  }

  return Array.from(uniqueMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}
