export function UnlockTimeline() {
  return (
    <section style={panelStyle}>
      <h2 style={{ margin: '0 0 0.5rem' }}>Unlock Timeline</h2>
      <p style={{ margin: 0, color: '#94a3b8' }}>char_b, 시설 해금 타임라인은 후속 단계에서 채워진다.</p>
    </section>
  );
}

const panelStyle = {
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '16px',
  padding: '1rem'
} as const;
