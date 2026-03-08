import type { WorldProjection } from '@ai-town/shared-types';
import type { WorldState } from '../core/WorldState';

export function buildWorldProjection(state: WorldState): WorldProjection {
  return {
    time: state.time,
    focusCharacterId: state.focusCharacterId,
    characters: state.characters.map((character) => ({
      id: character.id,
      label: character.displayName,
      locationId: character.locationId,
      activity: character.activity
    }))
  };
}
