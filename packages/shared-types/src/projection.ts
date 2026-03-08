import type { Facing } from './content';
import type { CharacterId, EventId, LocationId } from './ids';
import type { DayPhase, WorldTime } from './time';

export interface FocusHint {
  sourceType: 'character' | 'event' | 'location';
  sourceId: string;
  priority: number;
  expiresAtTick: number;
  reasonTags: string[];
}

export interface EventPresentation {
  eventId: EventId;
  eventType: string;
  participants: CharacterId[];
  locationId: LocationId;
  headline: string;
  attentionScore: number;
  bubbleText: string | null;
  expiresAtTick: number;
}

export interface CharacterProjection {
  id: CharacterId;
  characterId: CharacterId;
  label: string;
  displayName: string;
  locationId: LocationId;
  activity: string;
  actionTag: string;
  worldX: number;
  worldY: number;
  facing: Facing;
  animationKey: string;
  moodTag: string;
  emoteTag: string | null;
  selected: boolean;
  reasonTags: string[];
}

export interface LocationProjection {
  locationId: LocationId;
  displayName: string;
  occupancyCount: number;
  heat: number;
  moodTag: string;
  highlight: boolean;
}

export interface WorldProjection {
  dayIndex: number;
  minuteOfDay: number;
  phase: DayPhase;
  time: WorldTime;
  focusCharacterId: CharacterId;
  characters: CharacterProjection[];
  locations: LocationProjection[];
  activeEvents: EventPresentation[];
  focusHint: FocusHint | null;
  ambientTags: string[];
}
