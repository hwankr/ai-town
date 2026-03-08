import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_WORLD_ID,
  createWorldTime,
  type CharacterId,
  type CharacterProfile,
  type EventId,
  type EventTemplateId,
  type Facing,
  type IntentId,
  type LocationId,
  type LocationProfile,
  type RoutineTheme,
  type SimulationCommand,
  type Vec2,
  type WorldId,
  type WorldTime
} from '@ai-town/shared-types';
import { bootstrapCharacterProfiles, bootstrapLocationProfiles } from '@ai-town/content-data';
import { createRngState } from './DeterministicRng';

export type ActionType = 'idle' | 'move' | RoutineTheme;

export interface NeedState {
  energy: number;
  focus: number;
  fun: number;
  social: number;
  stress: number;
  comfort: number;
}

export interface EmotionState {
  valence: number;
  arousal: number;
  dominantEmotion: string;
  stability: number;
  lastEmotionSource: string | null;
}

export interface ActionState {
  actionId: string;
  actionType: ActionType;
  targetLocationId: LocationId | null;
  targetCharacterId: CharacterId | null;
  startedAtTick: number;
  expectedEndTick: number;
  status: 'queued' | 'running' | 'completed' | 'cancelled';
}

export interface IntentState {
  intentId: IntentId;
  intentType: string;
  score: number;
  reasonTags: string[];
  targetLocationId: LocationId | null;
  targetCharacterId: CharacterId | null;
  expiresAtTick: number;
}

export interface RoutineBlock {
  blockId: string;
  startMinute: number;
  endMinute: number;
  theme: RoutineTheme;
  preferredLocationIds: LocationId[];
  priority: number;
  locked: boolean;
}

export interface ScheduleState {
  planId: string;
  blocks: RoutineBlock[];
  activeBlockIndex: number;
  lastReplanTick: number;
  replanReason: string | null;
}

export interface CharacterSocialState {
  desiredCompanionship: number;
  avoidCharacterIds: CharacterId[];
  seekCharacterIds: CharacterId[];
  conversationEnergy: number;
  lastMeaningfulInteractionTick: number;
}

export interface CharacterCooldowns {
  sameLocationLoopCooldown: number;
  socialEventCooldown: number;
  specialAnimationCooldown: number;
}

export interface CharacterDailyStats {
  minutesStudied: number;
  minutesPlayed: number;
  minutesRested: number;
  minutesSocialized: number;
  locationsVisited: LocationId[];
  eventsJoined: EventId[];
}

export interface NavigationState {
  route: LocationId[];
  progressTicks: number;
  totalTicks: number;
  sourceLocationId: LocationId;
  targetLocationId: LocationId;
}

export interface CharacterState {
  characterId: CharacterId;
  displayName: string;
  unlocked: boolean;
  spawned: boolean;
  position: Vec2;
  subTileOffset: Vec2;
  facing: Facing;
  currentLocationId: LocationId;
  currentAction: ActionState;
  currentIntent: IntentState | null;
  needState: NeedState;
  emotionState: EmotionState;
  scheduleState: ScheduleState;
  socialState: CharacterSocialState;
  memoryRefs: string[];
  cooldowns: CharacterCooldowns;
  todayStats: CharacterDailyStats;
  lastUpdatedTick: number;
  locationAffinity: Partial<Record<LocationId, number>>;
  navigationState: NavigationState | null;
}

export interface RelationshipEdge {
  sourceCharacterId: CharacterId;
  targetCharacterId: CharacterId;
  familiarity: number;
  trust: number;
  affection: number;
  friction: number;
  lastInteractionTick: number;
  streakTag: string | null;
  flags: string[];
}

export interface MemoryRecord {
  memoryId: string;
  participants: CharacterId[];
  locationId: LocationId;
  eventType: string;
  valence: number;
  intensity: number;
  createdAtTick: number;
  decayPerDay: number;
  tags: string[];
  summarySeed: string;
}

export interface Modifier {
  modifierKey: string;
  value: number;
  source: string;
  expiresAtTick: number;
}

export interface LocationRuntimeState {
  locationId: LocationId;
  openNow: boolean;
  occupants: CharacterId[];
  heat: number;
  moodTag: string;
  lastBusyTick: number;
  temporaryModifiers: Modifier[];
}

export interface FacilityRuntimeState {
  facilityId: string;
  unlocked: boolean;
  built: boolean;
  active: boolean;
  buildDayIndex: number | null;
  usageCount: number;
}

export interface WorldEventRecord {
  eventId: EventId;
  templateId: EventTemplateId;
  eventType: string;
  participants: CharacterId[];
  locationId: LocationId;
  startedAtTick: number;
  endedAtTick: number | null;
  status: 'queued' | 'active' | 'resolved';
  outcomeTags: string[];
  relationshipDeltas: [];
  attentionScore: number;
  presentationSeed: string;
}

export interface EventDirectorState {
  lastMajorEventTick: number;
  recentTemplateIds: string[];
  boringCounter: number;
  attentionBudget: number;
  focusHintCharacterId: CharacterId | null;
}

export interface GlobalMoodState {
  calm: number;
  energy: number;
  sociability: number;
  focus: number;
  dominantTag: string;
}

export interface WorldState {
  worldId: WorldId;
  clock: WorldTime;
  focusCharacterId: CharacterId;
  characters: Record<CharacterId, CharacterState>;
  characterProfiles: Record<CharacterId, CharacterProfile>;
  relationships: RelationshipEdge[];
  memories: MemoryRecord[];
  locations: Record<LocationId, LocationRuntimeState>;
  locationProfiles: Record<LocationId, LocationProfile>;
  facilities: Record<string, FacilityRuntimeState>;
  activeEvents: WorldEventRecord[];
  recentEvents: WorldEventRecord[];
  directorState: EventDirectorState;
  globalMood: GlobalMoodState;
  rngState: number;
  flags: Record<string, boolean>;
  recentCommands: SimulationCommand[];
}

export interface BootstrapWorldOptions {
  seed?: number;
  dayIndex?: number;
  minuteOfDay?: number;
  focusCharacterId?: CharacterId;
}

export function clampGauge(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function createDefaultNeedState(): NeedState {
  return {
    energy: 82,
    focus: 74,
    fun: 26,
    social: 28,
    stress: 22,
    comfort: 76
  };
}

export function createDefaultEmotionState(): EmotionState {
  return {
    valence: 18,
    arousal: 32,
    dominantEmotion: 'calm',
    stability: 68,
    lastEmotionSource: null
  };
}

export function createIdleAction(tickIndex: number, locationId: LocationId): ActionState {
  return {
    actionId: `action_idle_${tickIndex}`,
    actionType: 'idle',
    targetLocationId: locationId,
    targetCharacterId: null,
    startedAtTick: tickIndex,
    expectedEndTick: tickIndex,
    status: 'running'
  };
}

function createInitialScheduleState(profile: CharacterProfile): ScheduleState {
  return {
    planId: `${profile.id}-bootstrap`,
    blocks: profile.routineTemplate.map((block, index) => ({
      blockId: `${profile.id}-bootstrap-${index}`,
      startMinute: block.startMinute,
      endMinute: block.endMinute,
      theme: block.theme,
      preferredLocationIds: [...block.preferredLocationIds],
      priority: block.locked ? 90 : 60,
      locked: block.locked ?? false
    })),
    activeBlockIndex: 0,
    lastReplanTick: 0,
    replanReason: 'bootstrap'
  };
}

function createLocationAffinity(profile: CharacterProfile): Partial<Record<LocationId, number>> {
  const affinity: Partial<Record<LocationId, number>> = {};

  for (const locationId of profile.preferredLocationIds) {
    affinity[locationId] = (affinity[locationId] ?? 0) + 16;
  }

  for (const locationId of profile.dislikedLocationIds) {
    affinity[locationId] = (affinity[locationId] ?? 0) - 12;
  }

  return affinity;
}

function createCharacterState(profile: CharacterProfile, clock: WorldTime): CharacterState {
  return {
    characterId: profile.id,
    displayName: profile.displayName,
    unlocked: true,
    spawned: true,
    position: { x: 0, y: 0 },
    subTileOffset: { x: 0, y: 0 },
    facing: 'down',
    currentLocationId: profile.defaultSpawnLocationId,
    currentAction: createIdleAction(clock.tickIndex, profile.defaultSpawnLocationId),
    currentIntent: null,
    needState: createDefaultNeedState(),
    emotionState: createDefaultEmotionState(),
    scheduleState: createInitialScheduleState(profile),
    socialState: {
      desiredCompanionship: 40,
      avoidCharacterIds: [],
      seekCharacterIds: [],
      conversationEnergy: 62,
      lastMeaningfulInteractionTick: 0
    },
    memoryRefs: [],
    cooldowns: {
      sameLocationLoopCooldown: 0,
      socialEventCooldown: 0,
      specialAnimationCooldown: 0
    },
    todayStats: {
      minutesStudied: 0,
      minutesPlayed: 0,
      minutesRested: 0,
      minutesSocialized: 0,
      locationsVisited: [profile.defaultSpawnLocationId],
      eventsJoined: []
    },
    lastUpdatedTick: clock.tickIndex,
    locationAffinity: createLocationAffinity(profile),
    navigationState: null
  };
}

function createLocationState(profile: LocationProfile, minuteOfDay: number): LocationRuntimeState {
  const openNow = profile.openMinutes.some(
    (range) => minuteOfDay >= range.startMinute && minuteOfDay < range.endMinute
  );

  return {
    locationId: profile.id,
    openNow,
    occupants: [],
    heat: 0,
    moodTag: profile.defaultMoodTag,
    lastBusyTick: 0,
    temporaryModifiers: []
  };
}

function syncInitialPositions(world: WorldState): WorldState {
  const characters = Object.fromEntries(
    Object.entries(world.characters).map(([characterId, character]) => {
      const profile = world.locationProfiles[character.currentLocationId];
      const nextCharacter: CharacterState = {
        ...character,
        position: { ...profile.position },
        currentAction: createIdleAction(world.clock.tickIndex, character.currentLocationId)
      };
      return [characterId, nextCharacter];
    })
  ) as Record<CharacterId, CharacterState>;

  const locations = Object.fromEntries(
    Object.entries(world.locations).map(([locationId, location]) => {
      const occupants = Object.values(characters)
        .filter((character) => character.currentLocationId === locationId)
        .map((character) => character.characterId);
      return [locationId, { ...location, occupants }];
    })
  ) as Record<LocationId, LocationRuntimeState>;

  return {
    ...world,
    characters,
    locations
  };
}

export function createBootstrapWorldState(options: BootstrapWorldOptions = {}): WorldState {
  const clock = createWorldTime({
    dayIndex: options.dayIndex ?? 1,
    minuteOfDay: options.minuteOfDay ?? 6 * 60
  });
  const characterProfiles = Object.fromEntries(
    bootstrapCharacterProfiles.map((profile) => [profile.id, profile])
  ) as Record<CharacterId, CharacterProfile>;
  const locationProfiles = Object.fromEntries(
    bootstrapLocationProfiles.map((profile) => [profile.id, profile])
  ) as Record<LocationId, LocationProfile>;
  const characters = Object.fromEntries(
    bootstrapCharacterProfiles.map((profile) => [profile.id, createCharacterState(profile, clock)])
  ) as Record<CharacterId, CharacterState>;
  const locations = Object.fromEntries(
    bootstrapLocationProfiles.map((profile) => [profile.id, createLocationState(profile, clock.minuteOfDay)])
  ) as Record<LocationId, LocationRuntimeState>;

  const world: WorldState = {
    worldId: DEFAULT_WORLD_ID,
    clock,
    focusCharacterId: options.focusCharacterId ?? DEFAULT_CHARACTER_ID,
    characters,
    characterProfiles,
    relationships: [],
    memories: [],
    locations,
    locationProfiles,
    facilities: {},
    activeEvents: [],
    recentEvents: [],
    directorState: {
      lastMajorEventTick: 0,
      recentTemplateIds: [],
      boringCounter: 0,
      attentionBudget: 100,
      focusHintCharacterId: options.focusCharacterId ?? DEFAULT_CHARACTER_ID
    },
    globalMood: {
      calm: 68,
      energy: 74,
      sociability: 44,
      focus: 70,
      dominantTag: 'quiet'
    },
    rngState: createRngState(options.seed),
    flags: {},
    recentCommands: []
  };

  return syncInitialPositions(world);
}
