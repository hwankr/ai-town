import type { WorldProjection } from '@ai-town/shared-types';
import type { SimulationHost } from './SimulationHost';

export class WorkerSimulationHost implements SimulationHost {
  getProjection(): WorldProjection {
    throw new Error('WorkerSimulationHost is reserved for a later milestone.');
  }
}
