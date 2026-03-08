export interface WorldTime {
  day: number;
  tick: number;
  minutes: number;
}

export const TICKS_PER_DAY = 24 * 60;

export function createWorldTime(overrides: Partial<WorldTime> = {}): WorldTime {
  return {
    day: overrides.day ?? 1,
    tick: overrides.tick ?? 0,
    minutes: overrides.minutes ?? 8 * 60
  };
}
