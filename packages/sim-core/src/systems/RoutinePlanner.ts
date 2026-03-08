import { sampleCenteredRange, type RandomSample } from '../core/DeterministicRng';
import { type CharacterProfile, type WorldTime } from '@ai-town/shared-types';
import { type RoutineBlock, type ScheduleState } from '../core/WorldState';

export interface RoutinePlanResult {
  scheduleState: ScheduleState;
  rngState: number;
}

export function findActiveRoutineBlockIndex(blocks: RoutineBlock[], minuteOfDay: number): number {
  const index = blocks.findIndex((block) => minuteOfDay >= block.startMinute && minuteOfDay < block.endMinute);
  return index >= 0 ? index : Math.max(0, blocks.length - 1);
}

export function getActiveRoutineBlock(scheduleState: ScheduleState): RoutineBlock | null {
  return scheduleState.blocks[scheduleState.activeBlockIndex] ?? null;
}

export function createDailyRoutinePlan(
  profile: CharacterProfile,
  clock: WorldTime,
  rngState: number,
  reason: string
): RoutinePlanResult {
  let nextRngState = rngState;

  const blocks = profile.routineTemplate.map<RoutineBlock>((template, index) => {
    const jitter: RandomSample<number> = template.locked
      ? { state: nextRngState, value: 0 }
      : sampleCenteredRange(nextRngState, 10);
    nextRngState = jitter.state;

    return {
      blockId: `${profile.id}-day-${clock.dayIndex}-${index}`,
      startMinute: Math.max(0, template.startMinute + jitter.value),
      endMinute: Math.min(1440, template.endMinute + jitter.value),
      theme: template.theme,
      preferredLocationIds: [...template.preferredLocationIds],
      priority: template.locked ? 90 : 60 + Math.max(0, profile.traitVector.discipline - 50) / 5,
      locked: template.locked ?? false
    };
  }).sort((left, right) => left.startMinute - right.startMinute);

  const activeBlockIndex = findActiveRoutineBlockIndex(blocks, clock.minuteOfDay);

  return {
    rngState: nextRngState,
    scheduleState: {
      planId: `${profile.id}-day-${clock.dayIndex}`,
      blocks,
      activeBlockIndex,
      lastReplanTick: clock.tickIndex,
      replanReason: reason
    }
  };
}
