import { runHeadlessSimulation } from '@ai-town/sim-core';
import type { WorldProjection } from '@ai-town/shared-types';
import type { SimulationHost } from './SimulationHost';

export class InProcessSimulationHost implements SimulationHost {
  private readonly projection: WorldProjection;

  constructor() {
    const result = runHeadlessSimulation({
      ticks: 360,
      snapshotEvery: 120,
      seed: 11
    });
    this.projection = result.finalProjection;
  }

  getProjection(): WorldProjection {
    return this.projection;
  }
}

export type { SimulationHost } from './SimulationHost';
