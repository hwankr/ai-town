export type CharacterId = `char_${string}`;
export type LocationId = `loc_${string}`;
export type FacilityId = `fac_${string}`;
export type EventId = `evt_${string}`;
export type EventTemplateId = `evt_${string}`;
export type MemoryId = `mem_${string}`;
export type IntentId = `intent_${string}`;
export type SnapshotId = `snap_${string}`;
export type WorldId = `world_${string}`;
export type SaveSlotId = `slot_${string}`;

export const DEFAULT_CHARACTER_ID: CharacterId = 'char_a';
export const DEFAULT_HOME_LOCATION_ID: LocationId = 'loc_home_block';
export const DEFAULT_SLOT_ID: SaveSlotId = 'slot_001';
export const DEFAULT_WORLD_ID: WorldId = 'world_main';

export function isCharacterId(value: string): value is CharacterId {
  return value.startsWith('char_');
}

export function isLocationId(value: string): value is LocationId {
  return value.startsWith('loc_');
}

export function isFacilityId(value: string): value is FacilityId {
  return value.startsWith('fac_');
}

export function isEventId(value: string): value is EventId {
  return value.startsWith('evt_');
}

export function isMemoryId(value: string): value is MemoryId {
  return value.startsWith('mem_');
}

export function isSaveSlotId(value: string): value is SaveSlotId {
  return value.startsWith('slot_');
}

export function createMemoryId(sequence: number): MemoryId {
  return `mem_${String(Math.max(0, Math.trunc(sequence))).padStart(8, '0')}`;
}

export function createEventId(namespace: string, sequence: number): EventId {
  return `evt_${namespace}_${Math.max(0, Math.trunc(sequence))}`;
}

export function createSnapshotId(sequence: number): SnapshotId {
  return `snap_${String(Math.max(0, Math.trunc(sequence))).padStart(6, '0')}`;
}

export function createIntentId(characterId: CharacterId, tickIndex: number): IntentId {
  return `intent_${characterId}_${Math.max(0, Math.trunc(tickIndex))}`;
}
