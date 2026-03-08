import type { WorldState } from './WorldState';
import { advanceWorldClock } from './WorldClock';

export function advanceSimulation(state: WorldState, ticks = 1): WorldState {
  return {
    ...state,
    time: advanceWorldClock(state.time, ticks),
    characters: state.characters.map((character) => ({
      ...character,
      activity: ticks > 0 ? 'thinking' : character.activity
    }))
  };
}
