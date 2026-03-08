import type { WorldProjection } from '@ai-town/shared-types';

export function selectFocusedCharacter(projection: WorldProjection) {
  return projection.characters.find((character) => character.id === projection.focusCharacterId) ?? projection.characters[0];
}
