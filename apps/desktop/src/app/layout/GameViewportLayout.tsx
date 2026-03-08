import type { PropsWithChildren } from 'react';

export function GameViewportLayout({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: '1rem',
        alignItems: 'start'
      }}
    >
      {children}
    </div>
  );
}
