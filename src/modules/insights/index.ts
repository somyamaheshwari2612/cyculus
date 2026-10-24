export { computeInsights } from './engine/computeInsights';
export { deriveCycles } from './engine/deriveCycles';
export { computeStats } from './engine/computeStats';
export { computePrediction } from './engine/computePrediction';
export { computePatterns } from './engine/computePatterns';
export { evaluateFlags } from './engine/evaluateFlags';
export { assignBand, daysBetween, addDays, formatDate } from './engine/bandUtils';
export { useInsights } from './hooks/useInsights';
export { DayumScreen } from './screens/DayumScreen';
export { DayumPlaceholder } from './DayumPlaceholder';

export function calculateCurrentCycleDay(lastBleedDate: string, today: string): number {
  const d1 = new Date(lastBleedDate + 'T00:00:00Z');
  const d2 = new Date(today + 'T00:00:00Z');
  const msDiff = d2.getTime() - d1.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24)) + 1;
}
