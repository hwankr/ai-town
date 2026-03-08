import {
  TICKS_PER_MINUTE,
  withLegacyAliases,
  type CharacterId,
  type PlayerActionCommand,
  type SimulationCommand,
  type WorldTime
} from '@ai-town/shared-types';
import { advanceWorldClock, isMinuteBoundary, isNewDay, setWorldClockPaused, setWorldClockRate } from './WorldClock';
import {
  clampGauge,
  createBootstrapWorldState,
  createIdleAction,
  type ActionType,
  type CharacterState,
  type GlobalMoodState,
  type LocationRuntimeState,
  type WorldEventRecord,
  type WorldState
} from './WorldState';
import { updateCharacterNeeds } from '../systems/NeedSystem';
import { chooseIntentForCharacter } from '../systems/IntentScorer';
import { advanceCharacterNavigation } from '../systems/NavigationSystem';
import { createDailyRoutinePlan, findActiveRoutineBlockIndex, getActiveRoutineBlock } from '../systems/RoutinePlanner';

export interface AdvanceSimulationOptions {
  commands?: SimulationCommand[];
}

function actionTypeFromIntent(character: CharacterState): ActionType {
  const activeBlock = getActiveRoutineBlock(character.scheduleState);
  const intentType = character.currentIntent?.intentType ?? '';

  if (intentType.includes('schedule:study') || activeBlock?.theme === 'study') {
    return 'study';
  }
  if (intentType.includes('play') || activeBlock?.theme === 'game') {
    return 'game';
  }
  if (intentType.includes('social') || activeBlock?.theme === 'social') {
    return 'social';
  }
  if (intentType.includes('recover') || activeBlock?.theme === 'rest') {
    return 'rest';
  }
  if (activeBlock?.theme === 'exercise') {
    return 'exercise';
  }
  if (activeBlock?.theme === 'sleep') {
    return 'sleep';
  }

  return 'idle';
}

function applyCurrentIntentToAction(character: CharacterState, clock: WorldTime): CharacterState {
  if (character.navigationState) {
    return character;
  }

  const actionType = actionTypeFromIntent(character);
  return {
    ...character,
    currentAction: {
      actionId: `action_${character.characterId}_${clock.tickIndex}`,
      actionType,
      targetLocationId: character.currentLocationId,
      targetCharacterId: null,
      startedAtTick: clock.tickIndex,
      expectedEndTick: clock.tickIndex + TICKS_PER_MINUTE * 15,
      status: 'running'
    }
  };
}

function resetDailyStats(character: CharacterState): CharacterState {
  return {
    ...character,
    todayStats: {
      minutesStudied: 0,
      minutesPlayed: 0,
      minutesRested: 0,
      minutesSocialized: 0,
      locationsVisited: [character.currentLocationId],
      eventsJoined: []
    }
  };
}

function accumulateMinuteStats(character: CharacterState): CharacterState {
  switch (character.currentAction.actionType) {
    case 'study':
      return {
        ...character,
        todayStats: {
          ...character.todayStats,
          minutesStudied: character.todayStats.minutesStudied + 1
        }
      };
    case 'game':
      return {
        ...character,
        todayStats: {
          ...character.todayStats,
          minutesPlayed: character.todayStats.minutesPlayed + 1
        }
      };
    case 'rest':
    case 'sleep':
      return {
        ...character,
        todayStats: {
          ...character.todayStats,
          minutesRested: character.todayStats.minutesRested + 1
        }
      };
    case 'social':
      return {
        ...character,
        todayStats: {
          ...character.todayStats,
          minutesSocialized: character.todayStats.minutesSocialized + 1
        }
      };
    default:
      return character;
  }
}

function syncLocationState(world: WorldState): Record<import('@ai-town/shared-types').LocationId, LocationRuntimeState> {
  return Object.fromEntries(
    Object.entries(world.locationProfiles).map(([locationId, profile]) => {
      const typedLocationId = locationId as import('@ai-town/shared-types').LocationId;
      const occupants = Object.values(world.characters)
        .filter((character) => character.currentLocationId === typedLocationId)
        .map((character) => character.characterId);
      const previous = world.locations[typedLocationId];
      const openNow = profile.openMinutes.some(
        (range) => world.clock.minuteOfDay >= range.startMinute && world.clock.minuteOfDay < range.endMinute
      );
      const heat = Math.max(0, Math.round(previous.heat * 0.9 + occupants.length * 14));
      const moodTag =
        occupants.length > 2 ? 'busy' : occupants.length > 0 ? profile.defaultMoodTag : `quiet_${profile.defaultMoodTag}`;

      return [
        typedLocationId,
        {
          ...previous,
          openNow,
          occupants,
          heat,
          moodTag,
          lastBusyTick: occupants.length > 1 ? world.clock.tickIndex : previous.lastBusyTick
        }
      ];
    })
  );
}

function deriveGlobalMood(world: WorldState): GlobalMoodState {
  const characters = Object.values(world.characters);
  const divisor = Math.max(1, characters.length);
  const averageEnergy = characters.reduce((sum, character) => sum + character.needState.energy, 0) / divisor;
  const averageFocus = characters.reduce((sum, character) => sum + character.needState.focus, 0) / divisor;
  const averageSocialNeed = characters.reduce((sum, character) => sum + character.needState.social, 0) / divisor;
  const averageStress = characters.reduce((sum, character) => sum + character.needState.stress, 0) / divisor;
  const calm = clampGauge(100 - averageStress);
  const energy = clampGauge(averageEnergy);
  const sociability = clampGauge(100 - averageSocialNeed / 2);
  const focus = clampGauge(averageFocus);

  let dominantTag = 'steady';
  if (averageStress > 65) {
    dominantTag = 'tense';
  } else if (averageEnergy < 35) {
    dominantTag = 'sleepy';
  } else if (world.clock.phase === 'evening') {
    dominantTag = 'lively';
  } else if (world.clock.phase === 'night') {
    dominantTag = 'quiet';
  }

  return {
    calm,
    energy,
    sociability,
    focus,
    dominantTag
  };
}

function applyCommands(world: WorldState, commands: SimulationCommand[]): WorldState {
  let nextWorld = world;

  for (const command of commands) {
    switch (command.type) {
      case 'simulation.focus.character': {
        nextWorld = {
          ...nextWorld,
          focusCharacterId: command.actorId,
          directorState: {
            ...nextWorld.directorState,
            focusHintCharacterId: command.actorId
          }
        };
        break;
      }
      case 'simulation.clock.set-rate': {
        nextWorld = {
          ...nextWorld,
          clock: setWorldClockRate(nextWorld.clock, command.timeScale)
        };
        break;
      }
      case 'simulation.clock.set-paused': {
        nextWorld = {
          ...nextWorld,
          clock: setWorldClockPaused(nextWorld.clock, command.paused)
        };
        break;
      }
      case 'player.activity.record': {
        nextWorld = applyPlayerActivityCommand(nextWorld, command);
        break;
      }
    }
  }

  return nextWorld;
}

function applyPlayerActivityCommand(world: WorldState, command: PlayerActionCommand): WorldState {
  const character = world.characters[command.actorId];
  if (!character) {
    return world;
  }

  const intensity = command.payload.intensity;
  const updatedCharacter: CharacterState = {
    ...character,
    needState: {
      ...character.needState,
      focus: clampGauge(character.needState.focus + (command.payload.category === 'study' ? 6 * intensity : 0)),
      fun: clampGauge(character.needState.fun - (command.payload.category === 'game' ? 8 * intensity : 0)),
      social: clampGauge(character.needState.social - (command.payload.category === 'social' ? 10 * intensity : 0)),
      energy: clampGauge(character.needState.energy + (command.payload.category === 'rest' ? 10 * intensity : 0)),
      stress: clampGauge(character.needState.stress - (command.payload.category === 'rest' ? 8 * intensity : 0))
    },
    locationAffinity: {
      ...character.locationAffinity,
      loc_library:
        (character.locationAffinity.loc_library ?? 0) + (command.payload.category === 'study' ? 4 * intensity : 0),
      loc_arcade:
        (character.locationAffinity.loc_arcade ?? 0) + (command.payload.category === 'game' ? 5 * intensity : 0),
      loc_park:
        (character.locationAffinity.loc_park ?? 0) + (command.payload.category === 'exercise' ? 5 * intensity : 0),
      loc_cafe:
        (character.locationAffinity.loc_cafe ?? 0) + (command.payload.category === 'social' ? 4 * intensity : 0)
    }
  };

  return {
    ...world,
    characters: {
      ...world.characters,
      [command.actorId]: updatedCharacter
    },
    recentCommands: [...world.recentCommands, command].slice(-20)
  };
}

function pruneEvents(events: WorldEventRecord[], clock: WorldTime): WorldEventRecord[] {
  return events
    .map((event) =>
      clock.tickIndex - event.startedAtTick > TICKS_PER_MINUTE * 45
        ? { ...event, status: 'resolved' as const, endedAtTick: clock.tickIndex }
        : event
    )
    .filter((event) => event.status === 'active');
}

function advanceSingleTick(world: WorldState, commands: SimulationCommand[]): WorldState {
  const clock = advanceWorldClock(world.clock, 1);
  const newDay = isNewDay(world.clock, clock);
  let nextWorld = {
    ...world,
    clock,
    activeEvents: pruneEvents(world.activeEvents, clock)
  };

  if (commands.length > 0) {
    nextWorld = applyCommands(nextWorld, commands);
  }

  let rngState = nextWorld.rngState;
  const newEvents: WorldEventRecord[] = [];
  const characters = Object.fromEntries(
    Object.entries(nextWorld.characters).map(([characterId, existingCharacter]) => {
      const profile = nextWorld.characterProfiles[characterId as CharacterId];
      let character = existingCharacter;

      if (newDay) {
        character = resetDailyStats(character);
      }

      if (newDay || character.scheduleState.blocks.length === 0) {
        const planned = createDailyRoutinePlan(profile, clock, rngState, newDay ? 'new_day' : 'bootstrap');
        rngState = planned.rngState;
        character = {
          ...character,
          scheduleState: planned.scheduleState
        };
      }

      character = {
        ...character,
        scheduleState: {
          ...character.scheduleState,
          activeBlockIndex: findActiveRoutineBlockIndex(character.scheduleState.blocks, clock.minuteOfDay)
        }
      };

      character = updateCharacterNeeds(character, clock);
      const selection = chooseIntentForCharacter(character, { ...nextWorld, clock });
      character = {
        ...character,
        currentIntent: selection.intent
      };

      const navigation = advanceCharacterNavigation(character, { ...nextWorld, clock });
      character = navigation.character;
      if (navigation.event) {
        newEvents.push(navigation.event);
      }

      character = applyCurrentIntentToAction(character, clock);

      if (isMinuteBoundary(clock)) {
        character = accumulateMinuteStats(character);
      }

      return [
        characterId,
        {
          ...character,
          lastUpdatedTick: clock.tickIndex,
          currentAction:
            character.currentAction.actionType === 'idle' && character.navigationState === null
              ? createIdleAction(clock.tickIndex, character.currentLocationId)
              : character.currentAction
        }
      ];
    })
  ) as Record<CharacterId, CharacterState>;

  nextWorld = {
    ...nextWorld,
    rngState,
    characters,
    activeEvents: [...nextWorld.activeEvents, ...newEvents],
    recentEvents: [...nextWorld.recentEvents, ...newEvents].slice(-25)
  };

  const locations = syncLocationState(nextWorld) as Record<string, LocationRuntimeState>;
  const globalMood = deriveGlobalMood(nextWorld);
  const focusHintCharacterId =
    newEvents[0]?.participants[0] ??
    Object.values(characters).sort(
      (left, right) => (right.currentIntent?.score ?? 0) - (left.currentIntent?.score ?? 0)
    )[0]?.characterId ??
    nextWorld.focusCharacterId;

  return {
    ...nextWorld,
    locations: locations as WorldState['locations'],
    globalMood,
    directorState: {
      ...nextWorld.directorState,
      lastMajorEventTick: newEvents.length > 0 ? clock.tickIndex : nextWorld.directorState.lastMajorEventTick,
      boringCounter: newEvents.length > 0 ? 0 : nextWorld.directorState.boringCounter + 1,
      focusHintCharacterId
    },
    focusCharacterId: focusHintCharacterId,
    clock: withLegacyAliases({
      dayIndex: nextWorld.clock.dayIndex,
      minuteOfDay: nextWorld.clock.minuteOfDay,
      tickIndex: nextWorld.clock.tickIndex,
      timeScale: nextWorld.clock.timeScale,
      paused: nextWorld.clock.paused,
      phase: nextWorld.clock.phase
    })
  };
}

export function advanceSimulation(state: WorldState, ticks = 1, options: AdvanceSimulationOptions = {}): WorldState {
  let nextState = state;
  const safeTicks = Math.max(0, Math.trunc(ticks));

  for (let tick = 0; tick < safeTicks; tick += 1) {
    nextState = advanceSingleTick(nextState, tick === 0 ? options.commands ?? [] : []);
  }

  return nextState;
}

export function createSimRunnerBootstrap(): WorldState {
  return createBootstrapWorldState();
}
