import { formatMinuteOfDay } from '@ai-town/shared-types';
import type { WorldProjection } from '@ai-town/shared-types';

export function mapProjectionToRenderFrame(projection: WorldProjection) {
  return {
    clockLabel: `Day ${projection.dayIndex} · ${formatMinuteOfDay(projection.minuteOfDay)} · ${projection.phase}`,
    characterCount: projection.characters.length,
    locationCount: projection.locations.length,
    activeEventCount: projection.activeEvents.length
  };
}
