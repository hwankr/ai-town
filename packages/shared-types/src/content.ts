import type { PlayerActionCategory } from './commands';
import type { CharacterId, LocationId } from './ids';
import type { TimeRange } from './time';

export type RoutineTheme = PlayerActionCategory | 'sleep' | 'wander';

export interface Vec2 {
  x: number;
  y: number;
}

export type Facing = 'up' | 'down' | 'left' | 'right';

export interface TraitVector {
  discipline: number;
  playfulness: number;
  sociability: number;
  activity: number;
  sensitivity: number;
  curiosity: number;
}

export interface NeedRates {
  energyDrainPerHour: number;
  focusDrainPerHour: number;
  funDrainPerHour: number;
  socialDrainPerHour: number;
  stressRecoveryPerRestHour: number;
  comfortRecoveryPerRestHour: number;
}

export interface DailyRoutineTemplateBlock {
  startMinute: number;
  endMinute: number;
  theme: RoutineTheme;
  preferredLocationIds: LocationId[];
  locked?: boolean;
}

export interface CharacterProfile {
  id: CharacterId;
  displayName: string;
  homeLocationId: LocationId;
  defaultSpawnLocationId: LocationId;
  personaTags: string[];
  preferredLocationIds: LocationId[];
  dislikedLocationIds: LocationId[];
  baseNeedRates: NeedRates;
  traitVector: TraitVector;
  routineTemplate: DailyRoutineTemplateBlock[];
}

export interface LocationProfile {
  id: LocationId;
  displayName: string;
  locationType: 'home' | 'library' | 'cafe' | 'arcade' | 'park';
  supportedActivities: RoutineTheme[];
  capacity: number;
  position: Vec2;
  tags: string[];
  openMinutes: TimeRange[];
  adjacentLocationIds: LocationId[];
  defaultMoodTag: string;
}

export interface BootstrapContentManifest {
  characters: string[];
  locations: string[];
  events: string[];
}
