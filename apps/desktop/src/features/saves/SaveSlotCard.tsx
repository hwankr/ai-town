export function SaveSlotCard({ slotId }: { slotId: string }) {
  return (
    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.56)' }}>
      <strong>{slotId}</strong>
      <p style={{ margin: '0.3rem 0 0', color: '#94a3b8' }}>Tauri save flow placeholder</p>
    </div>
  );
}
