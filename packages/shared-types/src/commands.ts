import type { CharacterId } from './ids';

export interface PlayerActionCommand {
  type: 'player.activity.record';
  actorId: CharacterId;
  payload: {
    category: 'study' | 'rest' | 'social' | 'play';
    intensity: 1 | 2 | 3;
  };
}
