import { SaveSlotCard } from './SaveSlotCard';
import { useSaveSlots } from './useSaveSlots';

export function SaveSlotList() {
  const slots = useSaveSlots();

  return (
    <section style={panelStyle}>
      <h2 style={{ margin: '0 0 0.75rem' }}>Save Slots</h2>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {slots.map((slotId) => (
          <SaveSlotCard key={slotId} slotId={slotId} />
        ))}
      </div>
    </section>
  );
}

const panelStyle = {
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '16px',
  padding: '1rem'
} as const;
