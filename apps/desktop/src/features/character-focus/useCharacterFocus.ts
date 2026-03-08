import { useSimulationHost } from '../../app/providers/SimulationProvider';

export function useCharacterFocus() {
  const projection = useSimulationHost().getProjection();
  return projection.characters.find((character) => character.id === projection.focusCharacterId) ?? projection.characters[0];
}
