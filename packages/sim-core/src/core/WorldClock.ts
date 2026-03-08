import {
  TICKS_PER_DAY,
  TICKS_PER_MINUTE,
  createWorldTime,
  getDayPhase,
  getMinuteOfDayFromTickIndex,
  withLegacyAliases,
  type TimeScale,
  type WorldTime
} from '@ai-town/shared-types';

export function createClockAt(minuteOfDay: number, dayIndex = 1): WorldTime {
  return createWorldTime({ dayIndex, minuteOfDay });
}

export function advanceWorldClock(time: WorldTime, ticks = 1): WorldTime {
  if (time.paused || ticks === 0) {
    return time;
  }

  const safeTicks = Math.max(0, Math.trunc(ticks));
  const tickIndex = time.tickIndex + safeTicks;
  const minuteOfDay = getMinuteOfDayFromTickIndex(tickIndex);
  const dayIndex = Math.floor(tickIndex / TICKS_PER_DAY) + 1;

  return withLegacyAliases({
    dayIndex,
    minuteOfDay,
    tickIndex,
    timeScale: time.timeScale,
    paused: time.paused,
    phase: getDayPhase(minuteOfDay)
  });
}

export function setWorldClockRate(time: WorldTime, timeScale: TimeScale): WorldTime {
  return withLegacyAliases({
    dayIndex: time.dayIndex,
    minuteOfDay: time.minuteOfDay,
    tickIndex: time.tickIndex,
    timeScale,
    paused: time.paused,
    phase: time.phase
  });
}

export function setWorldClockPaused(time: WorldTime, paused: boolean): WorldTime {
  return withLegacyAliases({
    dayIndex: time.dayIndex,
    minuteOfDay: time.minuteOfDay,
    tickIndex: time.tickIndex,
    timeScale: time.timeScale,
    paused,
    phase: time.phase
  });
}

export function isNewDay(previous: WorldTime, next: WorldTime): boolean {
  return previous.dayIndex !== next.dayIndex;
}

export function isMinuteBoundary(time: WorldTime): boolean {
  return time.tickIndex % TICKS_PER_MINUTE === 0;
}
