import { TICKS_PER_MINUTE, createEventId, type LocationId } from '@ai-town/shared-types';
import { createIdleAction, type CharacterState, type NavigationState, type WorldEventRecord, type WorldState } from '../core/WorldState';

const TRAVEL_TICKS_PER_EDGE = TICKS_PER_MINUTE * 5;

export interface NavigationAdvanceResult {
  character: CharacterState;
  event: WorldEventRecord | null;
}

export function findLocationRoute(world: WorldState, fromLocationId: LocationId, toLocationId: LocationId): LocationId[] {
  if (fromLocationId === toLocationId) {
    return [fromLocationId];
  }

  const queue: Array<{ locationId: LocationId; route: LocationId[] }> = [
    { locationId: fromLocationId, route: [fromLocationId] }
  ];
  const visited = new Set<LocationId>([fromLocationId]);

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) {
      break;
    }

    for (const candidate of world.locationProfiles[next.locationId].adjacentLocationIds) {
      if (visited.has(candidate)) {
        continue;
      }

      const route = [...next.route, candidate];
      if (candidate === toLocationId) {
        return route;
      }

      visited.add(candidate);
      queue.push({ locationId: candidate, route });
    }
  }

  return [fromLocationId, toLocationId];
}

function createNavigationState(world: WorldState, character: CharacterState, targetLocationId: LocationId): NavigationState {
  const route = findLocationRoute(world, character.currentLocationId, targetLocationId);
  return {
    route,
    progressTicks: 0,
    totalTicks: Math.max(1, route.length - 1) * TRAVEL_TICKS_PER_EDGE,
    sourceLocationId: character.currentLocationId,
    targetLocationId
  };
}

function resolveFacing(character: CharacterState, world: WorldState, targetLocationId: LocationId): CharacterState['facing'] {
  const source = world.locationProfiles[character.currentLocationId].position;
  const target = world.locationProfiles[targetLocationId].position;
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX >= 0 ? 'right' : 'left';
  }

  return deltaY >= 0 ? 'down' : 'up';
}

function interpolatePosition(world: WorldState, navigationState: NavigationState): { x: number; y: number } {
  const source = world.locationProfiles[navigationState.sourceLocationId].position;
  const target = world.locationProfiles[navigationState.targetLocationId].position;
  const progress = Math.min(1, navigationState.progressTicks / navigationState.totalTicks);

  return {
    x: Number((source.x + (target.x - source.x) * progress).toFixed(2)),
    y: Number((source.y + (target.y - source.y) * progress).toFixed(2))
  };
}

function createArrivalEvent(character: CharacterState, world: WorldState, targetLocationId: LocationId): WorldEventRecord {
  return {
    eventId: createEventId('arrival', world.clock.tickIndex),
    templateId: 'evt_arrival',
    eventType: 'arrival',
    participants: [character.characterId],
    locationId: targetLocationId,
    startedAtTick: world.clock.tickIndex,
    endedAtTick: null,
    status: 'active',
    outcomeTags: ['arrival', targetLocationId],
    relationshipDeltas: [],
    attentionScore: 44,
    presentationSeed: `${character.displayName} reached ${world.locationProfiles[targetLocationId].displayName}`
  };
}

export function advanceCharacterNavigation(character: CharacterState, world: WorldState): NavigationAdvanceResult {
  const targetLocationId = character.currentIntent?.targetLocationId ?? character.currentLocationId;

  if (targetLocationId === character.currentLocationId) {
    const location = world.locationProfiles[character.currentLocationId];
    return {
      character: {
        ...character,
        position: { ...location.position },
        subTileOffset: { x: 0, y: 0 },
        navigationState: null,
        currentAction: {
          ...character.currentAction,
          actionType: character.currentIntent?.intentType.includes('schedule:study') ? 'study' : character.currentAction.actionType,
          targetLocationId,
          status: 'running'
        }
      },
      event: null
    };
  }

  const navigationState =
    character.navigationState && character.navigationState.targetLocationId === targetLocationId
      ? character.navigationState
      : createNavigationState(world, character, targetLocationId);

  const progressedNavigation: NavigationState = {
    ...navigationState,
    progressTicks: navigationState.progressTicks + 1
  };

  if (progressedNavigation.progressTicks >= progressedNavigation.totalTicks) {
    const targetProfile = world.locationProfiles[targetLocationId];
    const nextCharacter: CharacterState = {
      ...character,
      currentLocationId: targetLocationId,
      position: { ...targetProfile.position },
      subTileOffset: { x: 0, y: 0 },
      facing: resolveFacing(character, world, targetLocationId),
      navigationState: null,
      currentAction: {
        actionId: `action_${character.characterId}_${world.clock.tickIndex}`,
        actionType: 'idle',
        targetLocationId,
        targetCharacterId: null,
        startedAtTick: world.clock.tickIndex,
        expectedEndTick: world.clock.tickIndex + TICKS_PER_MINUTE * 15,
        status: 'running'
      },
      todayStats: character.todayStats.locationsVisited.includes(targetLocationId)
        ? character.todayStats
        : {
            ...character.todayStats,
            locationsVisited: [...character.todayStats.locationsVisited, targetLocationId]
          }
    };

    return {
      character: nextCharacter,
      event: createArrivalEvent(nextCharacter, world, targetLocationId)
    };
  }

  const position = interpolatePosition(world, progressedNavigation);
  return {
    character: {
      ...character,
      navigationState: progressedNavigation,
      position,
      subTileOffset: { x: 0, y: 0 },
      facing: resolveFacing(character, world, targetLocationId),
      currentAction: {
        actionId: `action_move_${character.characterId}_${world.clock.tickIndex}`,
        actionType: 'move',
        targetLocationId,
        targetCharacterId: null,
        startedAtTick: world.clock.tickIndex,
        expectedEndTick: world.clock.tickIndex + (progressedNavigation.totalTicks - progressedNavigation.progressTicks),
        status: 'running'
      }
    },
    event: null
  };
}

export function resetCharacterToIdle(character: CharacterState, tickIndex: number): CharacterState {
  return {
    ...character,
    navigationState: null,
    currentAction: createIdleAction(tickIndex, character.currentLocationId)
  };
}
