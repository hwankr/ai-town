import { TICKS_PER_DAY, type WorldTime } from '@ai-town/shared-types';

export function advanceWorldClock(time: WorldTime, ticks = 1): WorldTime {
  const nextTick = time.tick + ticks;
  return {
    day: time.day + Math.floor(nextTick / TICKS_PER_DAY),
    tick: nextTick % TICKS_PER_DAY,
    minutes: (time.minutes + ticks) % TICKS_PER_DAY
  };
}
