import type { SaveSlotId } from './ids';
import type { WorldTime } from './time';

export interface SaveManifest {
  slotId: SaveSlotId;
  label: string;
  updatedAt: string;
}

export interface SaveSnapshot {
  slotId: SaveSlotId;
  saveVersion: number;
  capturedAt: string;
  worldTime: WorldTime;
}
