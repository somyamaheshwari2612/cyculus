import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LogEntry, DayPatch, UserSetup, DoctorQuestion } from '@/shared/types';
import { db, logStore } from './storage';
export function useLogs() {
  const logs = useLiveQuery(() => db.logs.orderBy('date').toArray(), []) ?? [];
  const storedSetup = useLiveQuery(() => db.userSetup.get('current'), []);
  const doctorQuestions = (useLiveQuery(() => db.doctorQuestions.orderBy('createdAt').toArray(), []) ?? []) as DoctorQuestion[];

  const userSetup: UserSetup | null = storedSetup ? {
    name: storedSetup.name,
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

  const deleteLog = useCallback(async (date: string): Promise<void> => {
    await logStore.deleteLog(date);
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

  const saveQuestions = useCallback(async (qs: DoctorQuestion[]): Promise<DoctorQuestion[]> => {
    return logStore.saveDoctorQuestions(qs);
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
    doctorQuestions,
    savePatch,
    deleteLog,
    saveSetup,
    clearSetup,
    clearAllLogs,
    clearLogsOnly,
    seedPersona,
    saveQuestions,
    exportJson
  };
}
