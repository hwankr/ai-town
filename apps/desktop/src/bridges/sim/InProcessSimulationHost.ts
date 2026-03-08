import { buildWorldProjection, createBootstrapWorldState } from '@ai-town/sim-core';
import type { WorldProjection } from '@ai-town/shared-types';
import type { SimulationHost } from './SimulationHost';

export class InProcessSimulationHost implements SimulationHost {
  private readonly projection: WorldProjection;

  constructor() {
    const world = createBootstrapWorldState();
    this.projection = buildWorldProjection(world);
  }

  getProjection(): WorldProjection {
    return this.projection;
  }
}

export type { SimulationHost } from './SimulationHost';
