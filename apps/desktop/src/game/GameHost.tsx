import { useEffect, useMemo, useRef, useState } from 'react';
import { describeRendererBoundary } from '@ai-town/game-renderer';
import { bootstrapContentManifest } from '@ai-town/content-data';
import { DEFAULT_SLOT_ID } from '@ai-town/shared-types';
import { createMockAIProvider } from '@ai-town/ai-bridge';
import { useSimulationHost } from '../app/providers/SimulationProvider';
import { mapProjectionToRenderFrame } from './projection/renderFrameMapper';
import { bootstrapPhaser } from './PhaserBootstrap';

export function GameHost() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const projection = useSimulationHost().getProjection();
  const frame = mapProjectionToRenderFrame(projection);
  const aiProvider = useMemo(() => createMockAIProvider(), []);
  const [aiBridgeStatus, setAIBridgeStatus] = useState('warming');

  useEffect(() => {
    let active = true;
    void aiProvider.complete({ prompt: 'bootstrap', tone: 'observational' }).then((response) => {
      if (active) {
        setAIBridgeStatus(response.source);
      }
    });
    return () => {
      active = false;
    };
  }, [aiProvider]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    return bootstrapPhaser(containerRef.current);
  }, []);

  return (
    <section style={panelStyle}>
      <div
        ref={containerRef}
        style={{
          minHeight: '420px',
          borderRadius: '18px',
          border: '1px solid rgba(56, 189, 248, 0.28)',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.72))',
          padding: '1.5rem',
          display: 'grid',
          alignContent: 'space-between'
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#38bdf8', fontWeight: 600 }}>World Viewport</p>
          <h2 style={{ margin: '0.4rem 0 0.75rem', fontSize: '1.75rem' }}>{frame.clockLabel}</h2>
          <p style={{ margin: 0, color: '#94a3b8', maxWidth: '42rem', lineHeight: 1.6 }}>
            {describeRendererBoundary()}
          </p>
        </div>
        <dl style={metaGridStyle}>
          <Meta label="focus" value={projection.focusCharacterId} />
          <Meta label="characters" value={String(frame.characterCount)} />
          <Meta label="locations" value={String(frame.locationCount)} />
          <Meta label="events" value={String(frame.activeEventCount)} />
          <Meta label="default slot" value={DEFAULT_SLOT_ID} />
          <Meta label="content" value={`${bootstrapContentManifest.characters.length} chars / ${bootstrapContentManifest.locations.length} locs`} />
          <Meta label="ai bridge" value={aiBridgeStatus} />
          <Meta label="phase" value={projection.phase} />
          <Meta label="ambient" value={projection.ambientTags.join(', ')} />
        </dl>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ color: '#7dd3fc', fontSize: '0.82rem', textTransform: 'uppercase' }}>{label}</dt>
      <dd style={{ margin: '0.2rem 0 0', color: '#e2e8f0' }}>{value}</dd>
    </div>
  );
}

const panelStyle = {
  background: 'rgba(15, 23, 42, 0.4)',
  borderRadius: '20px'
} as const;
const metaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '1rem',
  margin: '1.5rem 0 0'
} as const;
