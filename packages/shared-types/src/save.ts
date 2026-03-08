import type { SaveSlotId, SnapshotId } from './ids';
import type { WorldTime } from './time';

export interface SaveManifest {
  slotId: SaveSlotId;
  label: string;
  updatedAt: string;
  lastDayIndex: number;
  lastMinuteOfDay: number;
  snapshotId?: SnapshotId;
}

export interface SaveSnapshot {
  slotId: SaveSlotId;
  saveVersion: number;
  capturedAt: string;
  worldTime: WorldTime;
  snapshotId?: SnapshotId;
}
