import { TICKS_PER_DAY, type SimulationCommand, type WorldProjection } from '@ai-town/shared-types';
import { advanceSimulation } from '../core/SimRunner';
import { createBootstrapWorldState, type WorldState } from '../core/WorldState';
import { buildWorldProjection } from '../projection/ProjectionBuilder';

export interface HeadlessRunOptions {
  ticks?: number;
  seed?: number;
  snapshotEvery?: number;
  commandsByTick?: Record<number, SimulationCommand[]>;
  onTick?: (tick: number, state: WorldState, projection: WorldProjection) => void;
}

export interface HeadlessSnapshot {
  tick: number;
  projection: WorldProjection;
}

export interface HeadlessRunResult {
  finalState: WorldState;
  finalProjection: WorldProjection;
  snapshots: HeadlessSnapshot[];
}

export function runHeadlessSimulation(options: HeadlessRunOptions = {}): HeadlessRunResult {
  const totalTicks = options.ticks ?? TICKS_PER_DAY;
  const snapshotEvery = Math.max(0, options.snapshotEvery ?? 0);

  let state = createBootstrapWorldState({ seed: options.seed });
  const snapshots: HeadlessSnapshot[] = [];
  const initialProjection = buildWorldProjection(state);

  snapshots.push({ tick: 0, projection: initialProjection });
  options.onTick?.(0, state, initialProjection);

  for (let tick = 1; tick <= totalTicks; tick += 1) {
    state = advanceSimulation(state, 1, {
      commands: options.commandsByTick?.[tick] ?? []
    });
    const projection = buildWorldProjection(state);

    if (snapshotEvery === 0 || tick % snapshotEvery === 0) {
      snapshots.push({ tick, projection });
    }

    options.onTick?.(tick, state, projection);
  }

  return {
    finalState: state,
    finalProjection: buildWorldProjection(state),
    snapshots
  };
}

export function runSingleDaySimulation(options: Omit<HeadlessRunOptions, 'ticks'> = {}): HeadlessRunResult {
  return runHeadlessSimulation({
    ...options,
    ticks: TICKS_PER_DAY,
    snapshotEvery: options.snapshotEvery ?? 240
  });
}
