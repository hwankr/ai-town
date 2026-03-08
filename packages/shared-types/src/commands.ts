import type { CharacterId } from './ids';
import type { TimeScale } from './time';

export type PlayerActionCategory = 'study' | 'game' | 'exercise' | 'rest' | 'work' | 'social' | 'creative';

export interface PlayerActionEntry {
  entryId: string;
  category: PlayerActionCategory;
  durationMinutes: number;
  intensity: 1 | 2 | 3;
  timestamp: string;
  note: string | null;
  source: 'manual';
  privacyLevel: 'local_only';
  applied: boolean;
}

export interface PlayerActionCommand {
  type: 'player.activity.record';
  actorId: CharacterId;
  payload: PlayerActionEntry;
}

export interface FocusCharacterCommand {
  type: 'simulation.focus.character';
  actorId: CharacterId;
}

export interface SimulationRateCommand {
  type: 'simulation.clock.set-rate';
  timeScale: TimeScale;
}

export interface SimulationPauseCommand {
  type: 'simulation.clock.set-paused';
  paused: boolean;
}

export type SimulationCommand =
  | PlayerActionCommand
  | FocusCharacterCommand
  | SimulationRateCommand
  | SimulationPauseCommand;
