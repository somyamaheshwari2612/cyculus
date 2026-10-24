import Dexie, { type Table } from 'dexie';
import { DayPatch, LogEntry, LogStore, UserSetup } from '@/shared/types';
import { mergeDayPatch } from './mergePatch';

export interface StoredUserSetup extends UserSetup {
  id: string; // 'current'
}

export class CyculusDatabase extends Dexie {
  logs!: Table<LogEntry, string>;
  userSetup!: Table<StoredUserSetup, string>;

  constructor() {
    super('CyculusDatabase');
    this.version(1).stores({
      logs: 'date, updatedAt, flow, painLevel'
    });
    this.version(2).stores({
      logs: 'date, updatedAt, flow, painLevel',
      userSetup: 'id, updatedAt'
    });
  }
}

export const db = new CyculusDatabase();

export class DexieLogStore implements LogStore {
  private database: CyculusDatabase;

  constructor(database: CyculusDatabase = db) {
    this.database = database;
  }

  async getAll(): Promise<LogEntry[]> {
    return this.database.logs.orderBy('date').toArray();
  }

  async getRange(from: string, to: string): Promise<LogEntry[]> {
    return this.database.logs
      .where('date')
      .between(from, to, true, true)
      .sortBy('date');
  }

  async upsertPatch(patch: DayPatch, source: 'tap' | 'text' | 'voice', rawText?: string): Promise<LogEntry> {
    return this.database.transaction('rw', this.database.logs, async () => {
      const existing = await this.database.logs.get(patch.date);
      const merged = mergeDayPatch(existing, patch, source, rawText);
      await this.database.logs.put(merged);
      return merged;
    });
  }

  async exportAll(): Promise<string> {
    const all = await this.getAll();
    return JSON.stringify(all, null, 2);
  }

  async deleteAll(): Promise<void> {
    await this.database.transaction('rw', [this.database.logs, this.database.userSetup], async () => {
      await this.database.logs.clear();
      await this.database.userSetup.clear();
    });
  }

  /**
   * Clear only the logs table without wiping userSetup.
   * Used when clearing mock demo data upon entering real user logs.
   */
  async clearLogs(): Promise<void> {
    await this.database.logs.clear();
  }

  /**
   * User setup prior stored in a separate table (tagged as self-reported, never seeds logs)
   */
  async getUserSetup(): Promise<UserSetup | null> {
    const stored = await this.database.userSetup.get('current');
    if (!stored) return null;
    return {
      lastPeriodStart: stored.lastPeriodStart,
      typicalCycleLength: stored.typicalCycleLength,
      previousStarts: stored.previousStarts,
      updatedAt: stored.updatedAt
    };
  }

  async saveUserSetup(setup: UserSetup): Promise<void> {
    await this.database.userSetup.put({
      ...setup,
      id: 'current'
    });
  }

  async clearUserSetup(): Promise<void> {
    await this.database.userSetup.delete('current');
  }

  /**
   * Bulk import for seeding personas (Riya, regular, heavy).
   * Clears existing logs and setup so demo personas bypass setup completely.
   */
  async bulkImport(entries: LogEntry[]): Promise<void> {
    await this.database.transaction('rw', [this.database.logs, this.database.userSetup], async () => {
      await this.database.logs.clear();
      await this.database.userSetup.clear();
      await this.database.logs.bulkPut(entries);
    });
  }
}

export const logStore = new DexieLogStore();
