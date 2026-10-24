import Dexie, { type Table } from 'dexie';
import { DayPatch, LogEntry, LogStore } from '@/shared/types';
import { mergeDayPatch } from './mergePatch';

export class CyculusDatabase extends Dexie {
  logs!: Table<LogEntry, string>;

  constructor() {
    super('CyculusDatabase');
    this.version(1).stores({
      logs: 'date, updatedAt, flow, painLevel'
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
    await this.database.logs.clear();
  }

  /**
   * Bulk import for seeding personas (Riya, regular, heavy)
   */
  async bulkImport(entries: LogEntry[]): Promise<void> {
    await this.database.transaction('rw', this.database.logs, async () => {
      await this.database.logs.clear();
      await this.database.logs.bulkPut(entries);
    });
  }
}

export const logStore = new DexieLogStore();
