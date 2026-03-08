import type { CharacterProjection, EventPresentation, LocationProjection, WorldProjection } from '@ai-town/shared-types';
import type { CharacterState, WorldState } from '../core/WorldState';

function resolveEmoteTag(character: CharacterState): string | null {
  if (character.emotionState.dominantEmotion === 'tired') {
    return 'sleepy';
  }
  if (character.emotionState.dominantEmotion === 'tense') {
    return 'stress';
  }
  if (character.currentAction.actionType === 'move') {
    return 'move';
  }
  return null;
}

function mapCharacterProjection(world: WorldState, character: CharacterState): CharacterProjection {
  return {
    id: character.characterId,
    characterId: character.characterId,
    label: character.displayName,
    displayName: character.displayName,
    locationId: character.currentLocationId,
    activity: character.currentAction.actionType,
    actionTag: character.currentAction.actionType,
    worldX: character.position.x,
    worldY: character.position.y,
    facing: character.facing,
    animationKey: character.currentAction.actionType === 'move' ? 'walk' : character.currentAction.actionType,
    moodTag: character.emotionState.dominantEmotion,
    emoteTag: resolveEmoteTag(character),
    selected: character.characterId === world.focusCharacterId,
    reasonTags: character.currentIntent?.reasonTags ?? []
  };
}

function mapLocationProjection(world: WorldState, locationId: import('@ai-town/shared-types').LocationId): LocationProjection {
  const location = world.locations[locationId];
  const profile = world.locationProfiles[locationId];

  return {
    locationId: location.locationId,
    displayName: profile.displayName,
    occupancyCount: location.occupants.length,
    heat: location.heat,
    moodTag: location.moodTag,
    highlight: location.locationId === world.characters[world.focusCharacterId]?.currentLocationId
  };
}

function mapEventPresentation(event: WorldState['activeEvents'][number], world: WorldState): EventPresentation {
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    participants: event.participants,
    locationId: event.locationId,
    headline: event.presentationSeed,
    attentionScore: event.attentionScore,
    bubbleText: `${world.locationProfiles[event.locationId].displayName} · ${event.eventType}`,
    expiresAtTick: event.startedAtTick + 120
  };
}

export function buildWorldProjection(state: WorldState): WorldProjection {
  return {
    dayIndex: state.clock.dayIndex,
    minuteOfDay: state.clock.minuteOfDay,
    phase: state.clock.phase,
    time: state.clock,
    focusCharacterId: state.focusCharacterId,
    characters: Object.values(state.characters).map((character) => mapCharacterProjection(state, character)),
    locations: (Object.keys(state.locations) as import('@ai-town/shared-types').LocationId[]).map((locationId) => mapLocationProjection(state, locationId)),
    activeEvents: state.activeEvents.map((event) => mapEventPresentation(event, state)),
    focusHint: state.directorState.focusHintCharacterId
      ? {
          sourceType: 'character',
          sourceId: state.directorState.focusHintCharacterId,
          priority: 80,
          expiresAtTick: state.clock.tickIndex + 120,
          reasonTags: state.activeEvents.length > 0 ? ['event'] : ['intent']
        }
      : null,
    ambientTags: [state.clock.phase, state.globalMood.dominantTag]
  };
}
