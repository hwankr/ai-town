import type { CharacterId, LocationId } from './ids';

export interface CharacterProfile {
  id: CharacterId;
  displayName: string;
  homeLocationId: LocationId;
}

export interface LocationProfile {
  id: LocationId;
  displayName: string;
  supportedActivities: string[];
}
