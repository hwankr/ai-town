import type { CharacterId, LocationId } from './ids';
import type { WorldTime } from './time';

export interface CharacterProjection {
  id: CharacterId;
  label: string;
  locationId: LocationId;
  activity: string;
}

export interface WorldProjection {
  time: WorldTime;
  focusCharacterId: CharacterId;
  characters: CharacterProjection[];
}
