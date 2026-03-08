import type { CharacterId, EventId, EventTemplateId, LocationId } from './ids';

export interface RelationshipDeltaRecord {
  sourceCharacterId: CharacterId;
  targetCharacterId: CharacterId;
  deltaTrust: number;
  deltaAffection: number;
  deltaFriction: number;
  reasonTags: string[];
}

export interface WorldEvent {
  type: string;
  actorIds: CharacterId[];
  locationId: LocationId;
  description: string;
  attentionScore?: number;
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
  relationshipDeltas: RelationshipDeltaRecord[];
  attentionScore: number;
  presentationSeed: string;
}
