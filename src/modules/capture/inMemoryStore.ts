import { DayPatch, LogEntry, LogStore } from '@/shared/types';
import { mergeDayPatch } from './mergePatch';

/**
 * In-memory LogStore fake for testing and for Modules B & C to code against.
 */
export class InMemoryLogStore implements LogStore {
  private entries: Map<string, LogEntry> = new Map();

  constructor(initialEntries?: LogEntry[]) {
    if (initialEntries) {
      initialEntries.forEach(entry => this.entries.set(entry.date, { ...entry }));
    }
  }

  async getAll(): Promise<LogEntry[]> {
    return Array.from(this.entries.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getRange(from: string, to: string): Promise<LogEntry[]> {
    const all = await this.getAll();
    return all.filter(entry => entry.date >= from && entry.date <= to);
  }

  async upsertPatch(patch: DayPatch, source: 'tap' | 'text' | 'voice', rawText?: string): Promise<LogEntry> {
    const existing = this.entries.get(patch.date);
    const merged = mergeDayPatch(existing, patch, source, rawText);
    this.entries.set(patch.date, merged);
    return merged;
  }

  async exportAll(): Promise<string> {
    const all = await this.getAll();
    return JSON.stringify(all, null, 2);
  }

  async deleteAll(): Promise<void> {
    this.entries.clear();
  }
}
