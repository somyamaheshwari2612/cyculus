import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LogEntry, DayPatch, UserSetup } from '@/shared/types';
import { db, logStore } from './storage';

export function useLogs() {
  const logs = useLiveQuery(() => db.logs.orderBy('date').toArray(), []) ?? [];
  const storedSetup = useLiveQuery(() => db.userSetup.get('current'), []);

  const userSetup: UserSetup | null = storedSetup ? {
    lastPeriodStart: storedSetup.lastPeriodStart,
    typicalCycleLength: storedSetup.typicalCycleLength,
    previousStarts: storedSetup.previousStarts,
    updatedAt: storedSetup.updatedAt
  } : null;

  const savePatch = useCallback(async (
    patch: DayPatch,
    source: 'tap' | 'text' | 'voice',
    rawText?: string
  ): Promise<LogEntry> => {
    return logStore.upsertPatch(patch, source, rawText);
  }, []);

  const saveSetup = useCallback(async (setup: UserSetup): Promise<void> => {
    await logStore.saveUserSetup(setup);
  }, []);

  const clearSetup = useCallback(async (): Promise<void> => {
    await logStore.clearUserSetup();
  }, []);

  const clearAllLogs = useCallback(async (): Promise<void> => {
    await logStore.deleteAll();
  }, []);

  const clearLogsOnly = useCallback(async (): Promise<void> => {
    await logStore.clearLogs();
  }, []);

  const seedPersona = useCallback(async (entries: LogEntry[]): Promise<void> => {
    await logStore.bulkImport(entries);
  }, []);

  const exportJson = useCallback(async (): Promise<string> => {
    return logStore.exportAll();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);

  return {
    logs,
    userSetup,
    todayLog,
    savePatch,
    saveSetup,
    clearSetup,
    clearAllLogs,
    clearLogsOnly,
    seedPersona,
    exportJson
  };
}
