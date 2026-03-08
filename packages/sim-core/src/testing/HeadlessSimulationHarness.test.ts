import test from 'node:test';
import assert from 'node:assert/strict';
import { TICKS_PER_DAY } from '@ai-town/shared-types';
import { advanceWorldClock } from '../core/WorldClock';
import { createBootstrapWorldState } from '../core/WorldState';
import { findLocationRoute } from '../systems/NavigationSystem';
import { runHeadlessSimulation } from '../harness/HeadlessSimulationHarness';

test('advanceWorldClock aligns 4 ticks to one minute', () => {
  const initial = createBootstrapWorldState().clock;
  const advanced = advanceWorldClock(initial, 4);

  assert.equal(advanced.minuteOfDay, initial.minuteOfDay + 1);
  assert.equal(advanced.minutes, advanced.minuteOfDay);
  assert.equal(advanced.tick, advanced.tickIndex);
});

test('navigation route connects home block to arcade through graph edges', () => {
  const world = createBootstrapWorldState();
  const route = findLocationRoute(world, 'loc_home_block', 'loc_arcade');

  assert.deepEqual(route, ['loc_home_block', 'loc_cafe', 'loc_arcade']);
});

test('headless simulation is deterministic for a fixed seed', () => {
  const first = runHeadlessSimulation({ ticks: 480, seed: 42, snapshotEvery: 120 });
  const second = runHeadlessSimulation({ ticks: 480, seed: 42, snapshotEvery: 120 });

  assert.deepEqual(first.snapshots, second.snapshots);
});

test('headless simulation can run one full day and advance the calendar', () => {
  const result = runHeadlessSimulation({ ticks: TICKS_PER_DAY, seed: 7, snapshotEvery: 240 });

  assert.equal(result.finalState.clock.dayIndex, 2);
  assert.ok(result.snapshots.some((snapshot) => snapshot.projection.characters[0]?.locationId !== 'loc_home_block'));
});
