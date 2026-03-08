import type { WorldProjection } from '@ai-town/shared-types';

export interface RendererBridge {
  mount(container: HTMLElement): void;
  applyProjection(projection: WorldProjection): void;
  destroy(): void;
}

export function describeRendererBoundary(): string {
  return 'Phaser integration will live behind the game-renderer package boundary.';
}

export function createRendererBridge(): RendererBridge {
  let mounted = false;

  return {
    mount(container) {
      mounted = true;
      container.dataset.renderer = 'game-renderer-placeholder';
    },
    applyProjection(_projection) {
      if (!mounted) return;
    },
    destroy() {
      mounted = false;
    }
  };
}
