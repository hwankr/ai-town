import { useCharacterFocus } from './useCharacterFocus';

export function CharacterFocusCard() {
  const focus = useCharacterFocus();

  return (
    <section style={panelStyle}>
      <h2 style={{ margin: '0 0 0.5rem' }}>Character Focus</h2>
      <p style={strongStyle}>{focus.label}</p>
      <p style={metaStyle}>location: {focus.locationId}</p>
      <p style={metaStyle}>activity: {focus.activity}</p>
    </section>
  );
}

const panelStyle = {
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '16px',
  padding: '1rem'
} as const;
const strongStyle = { margin: '0 0 0.4rem', fontSize: '1.2rem', fontWeight: 700 } as const;
const metaStyle = { margin: '0.15rem 0', color: '#94a3b8' } as const;
