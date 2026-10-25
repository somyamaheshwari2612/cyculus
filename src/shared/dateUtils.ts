/**
 * Self-contained, robust date utility library matching date-fns signatures.
 * Provides timezone-safe date math, interval enumeration, and formatting without external dependencies.
 */

export const fmt = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const today = (): string => fmt(new Date());

export const parseISO = (s: string | Date): Date => {
  if (s instanceof Date) return new Date(s.getTime());
  if (typeof s !== "string") return new Date();
  const parts = s.split("T")[0].split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d, 12, 0, 0); // Noon prevents any midnight DST shifting
  }
  return new Date(s);
};

export const addDays = (d: Date, n: number): Date => {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + n);
  return copy;
};

export const subDays = (d: Date, n: number): Date => addDays(d, -n);

export const addMonths = (d: Date, n: number): Date => {
  const copy = new Date(d.getTime());
  copy.setMonth(copy.getMonth() + n);
  return copy;
};

export const subMonths = (d: Date, n: number): Date => addMonths(d, -n);

export const startOfMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0);
};

export const endOfMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 12, 0, 0);
};

export const startOfWeek = (d: Date, options?: { weekStartsOn?: number }): Date => {
  const weekStartsOn = options?.weekStartsOn ?? 1; // 1 = Monday
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  return subDays(d, diff);
};

export const endOfWeek = (d: Date, options?: { weekStartsOn?: number }): Date => {
  const start = startOfWeek(d, options);
  return addDays(start, 6);
};

export const eachDayOfInterval = (interval: { start: Date; end: Date }): Date[] => {
  const result: Date[] = [];
  let curr = parseISO(fmt(interval.start));
  const endStr = fmt(interval.end);
  while (fmt(curr) <= endStr) {
    result.push(new Date(curr.getTime()));
    curr = addDays(curr, 1);
  }
  return result;
};

export const isSameMonth = (a: Date, b: Date): boolean => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
};

export const differenceInCalendarDays = (a: Date | string, b: Date | string): number => {
  const da = parseISO(typeof a === "string" ? a : fmt(a));
  const db = parseISO(typeof b === "string" ? b : fmt(b));
  const utc1 = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const utc2 = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
};

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const DAYS_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_NARROW = ["S", "M", "T", "W", "T", "F", "S"];

export const format = (d: Date, pattern: string): string => {
  const date = parseISO(fmt(d));
  const yyyy = String(date.getFullYear());
  const monthIdx = date.getMonth();
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay();

  switch (pattern) {
    case "yyyy-MM-dd":
      return fmt(date);
    case "EEEE, d MMMM yyyy":
      return `${DAYS_FULL[dayOfWeek]}, ${dayOfMonth} ${MONTHS_FULL[monthIdx]} ${yyyy}`;
    case "EEEE, d MMMM":
      return `${DAYS_FULL[dayOfWeek]}, ${dayOfMonth} ${MONTHS_FULL[monthIdx]}`;
    case "d MMMM yyyy":
      return `${dayOfMonth} ${MONTHS_FULL[monthIdx]} ${yyyy}`;
    case "d MMM yyyy":
      return `${dayOfMonth} ${MONTHS_SHORT[monthIdx]} ${yyyy}`;
    case "d MMMM":
      return `${dayOfMonth} ${MONTHS_FULL[monthIdx]}`;
    case "d MMM":
      return `${dayOfMonth} ${MONTHS_SHORT[monthIdx]}`;
    case "MMMM yyyy":
      return `${MONTHS_FULL[monthIdx]} ${yyyy}`;
    case "MMM":
      return MONTHS_SHORT[monthIdx];
    case "d":
      return String(dayOfMonth);
    case "EEEEE":
      return DAYS_NARROW[dayOfWeek];
    case "EEE":
      return DAYS_SHORT[dayOfWeek];
    case "EEEE":
      return DAYS_FULL[dayOfWeek];
    default:
      return `${dayOfMonth} ${MONTHS_SHORT[monthIdx]} ${yyyy}`;
  }
};
