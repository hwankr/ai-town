export type TimeScale = 1 | 2 | 4;
export type DayPhase = 'morning' | 'day' | 'evening' | 'night' | 'late_night';

export interface TimeRange {
  startMinute: number;
  endMinute: number;
}

export interface WorldTime {
  dayIndex: number;
  minuteOfDay: number;
  tickIndex: number;
  timeScale: TimeScale;
  paused: boolean;
  phase: DayPhase;
  /** Legacy aliases kept for bootstrap/UI compatibility. */
  day: number;
  minutes: number;
  tick: number;
}

export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;
export const SECONDS_PER_TICK = 15;
export const TICKS_PER_MINUTE = 4;
export const TICKS_PER_HOUR = TICKS_PER_MINUTE * MINUTES_PER_HOUR;
export const TICKS_PER_DAY = MINUTES_PER_DAY * TICKS_PER_MINUTE;
export const DEFAULT_START_MINUTE = 6 * MINUTES_PER_HOUR;

export function clampMinuteOfDay(minuteOfDay: number): number {
  const minute = Math.trunc(minuteOfDay);
  return ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function getDayPhase(minuteOfDay: number): DayPhase {
  const minute = clampMinuteOfDay(minuteOfDay);

  if (minute >= 6 * MINUTES_PER_HOUR && minute < 10 * MINUTES_PER_HOUR) {
    return 'morning';
  }

  if (minute >= 10 * MINUTES_PER_HOUR && minute < 16 * MINUTES_PER_HOUR) {
    return 'day';
  }

  if (minute >= 16 * MINUTES_PER_HOUR && minute < 21 * MINUTES_PER_HOUR) {
    return 'evening';
  }

  if (minute >= 21 * MINUTES_PER_HOUR || minute < 2 * MINUTES_PER_HOUR) {
    return 'night';
  }

  return 'late_night';
}

export function getMinuteOfDayFromTickIndex(tickIndex: number): number {
  const tickOfDay = ((Math.trunc(tickIndex) % TICKS_PER_DAY) + TICKS_PER_DAY) % TICKS_PER_DAY;
  return Math.floor(tickOfDay / TICKS_PER_MINUTE);
}

export function withLegacyAliases(time: Omit<WorldTime, 'day' | 'minutes' | 'tick'>): WorldTime {
  return {
    ...time,
    day: time.dayIndex,
    minutes: time.minuteOfDay,
    tick: time.tickIndex
  };
}

export function createWorldTime(overrides: Partial<WorldTime> = {}): WorldTime {
  const dayIndex = overrides.dayIndex ?? overrides.day ?? 1;
  const minuteOfDay = clampMinuteOfDay(overrides.minuteOfDay ?? overrides.minutes ?? DEFAULT_START_MINUTE);
  const tickIndex = overrides.tickIndex ?? overrides.tick ?? ((dayIndex - 1) * TICKS_PER_DAY + minuteOfDay * TICKS_PER_MINUTE);
  const timeScale = overrides.timeScale ?? 1;
  const paused = overrides.paused ?? false;
  const phase = overrides.phase ?? getDayPhase(minuteOfDay);

  return withLegacyAliases({
    dayIndex,
    minuteOfDay,
    tickIndex,
    timeScale,
    paused,
    phase
  });
}

export function formatMinuteOfDay(minuteOfDay: number): string {
  const safeMinute = clampMinuteOfDay(minuteOfDay);
  const hours = Math.floor(safeMinute / MINUTES_PER_HOUR);
  const minutes = safeMinute % MINUTES_PER_HOUR;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
