import { formatMinuteOfDay } from '@ai-town/shared-types';
import { runHeadlessSimulation } from '../harness/HeadlessSimulationHarness';

const result = runHeadlessSimulation({
  ticks: 2400,
  snapshotEvery: 480,
  seed: 7
});

const focusCharacter = result.finalProjection.characters.find(
  (character) => character.characterId === result.finalProjection.focusCharacterId
);

console.log(
  JSON.stringify(
    {
      finalClock: {
        dayIndex: result.finalProjection.dayIndex,
        minuteOfDay: result.finalProjection.minuteOfDay,
        label: formatMinuteOfDay(result.finalProjection.minuteOfDay),
        phase: result.finalProjection.phase
      },
      focusCharacterId: result.finalProjection.focusCharacterId,
      focusCharacter,
      visitedLocations: Array.from(
        new Set(
          result.snapshots.flatMap((snapshot) => snapshot.projection.characters.map((character) => character.locationId))
        )
      )
    },
    null,
    2
  )
);
