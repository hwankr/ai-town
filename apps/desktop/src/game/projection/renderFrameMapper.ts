import type { WorldProjection } from '@ai-town/shared-types';

export function mapProjectionToRenderFrame(projection: WorldProjection) {
  return {
    clockLabel: `Day ${projection.time.day} · Tick ${projection.time.tick}`,
    characterCount: projection.characters.length
  };
}
