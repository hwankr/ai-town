import type { WorldProjection } from '@ai-town/shared-types';

export interface SimulationHost {
  getProjection(): WorldProjection;
}
