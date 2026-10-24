import { useState, useEffect, useCallback } from 'react';
import { LogEntry, DayPatch } from '@/shared/types';
import { logStore } from './storage';

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      const all = await logStore.getAll();
      setLogs(all);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const savePatch = useCallback(async (
    patch: DayPatch,
    source: 'tap' | 'text' | 'voice',
    rawText?: string
  ): Promise<LogEntry> => {
    const updated = await logStore.upsertPatch(patch, source, rawText);
    await refresh();
    return updated;
  }, [refresh]);

  const getLogForDate = useCallback((date: string): LogEntry | undefined => {
    return logs.find(l => l.date === date);
  }, [logs]);

  const clearAllLogs = useCallback(async () => {
    await logStore.deleteAll();
    await refresh();
  }, [refresh]);

  const seedPersona = useCallback(async (entries: LogEntry[]) => {
    await logStore.bulkImport(entries);
    await refresh();
  }, [refresh]);

  const exportJson = useCallback(async (): Promise<string> => {
    return logStore.exportAll();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = getLogForDate(todayStr);

  return {
    logs,
    loading,
    refresh,
    todayLog,
    getLogForDate,
    savePatch,
    clearAllLogs,
    seedPersona,
    exportJson
  };
}
