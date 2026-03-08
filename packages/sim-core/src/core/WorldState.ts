import { DEFAULT_CHARACTER_ID, DEFAULT_HOME_LOCATION_ID, createWorldTime, type CharacterId, type LocationId, type WorldTime } from '@ai-town/shared-types';

export interface CharacterState {
  id: CharacterId;
  displayName: string;
  locationId: LocationId;
  activity: string;
}

export interface WorldState {
  time: WorldTime;
  focusCharacterId: CharacterId;
  characters: CharacterState[];
}

export function createBootstrapWorldState(): WorldState {
  return {
    time: createWorldTime(),
    focusCharacterId: DEFAULT_CHARACTER_ID,
    characters: [
      {
        id: DEFAULT_CHARACTER_ID,
        displayName: 'A',
        locationId: DEFAULT_HOME_LOCATION_ID,
        activity: 'idle'
      }
    ]
  };
}
