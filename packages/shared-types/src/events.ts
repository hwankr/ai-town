import type { CharacterId, LocationId } from './ids';

export interface WorldEvent {
  type: 'simulation.bootstrap';
  actorIds: CharacterId[];
  locationId: LocationId;
  description: string;
}
