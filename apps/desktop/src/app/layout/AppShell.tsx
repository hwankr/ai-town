import type { PropsWithChildren } from 'react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, color: '#38bdf8', fontWeight: 600 }}>AI Town</p>
        <h1 style={{ margin: '0.4rem 0 0.6rem', fontSize: '2rem' }}>Monorepo bootstrap</h1>
        <p style={{ margin: 0, color: '#94a3b8' }}>
          E0-01 기준의 실행 가능한 기본 셸. Phaser/Tauri 연동은 다음 단계에서 이어진다.
        </p>
      </header>
      {children}
    </main>
  );
}
