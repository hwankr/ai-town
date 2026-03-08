import { createActivityInputViewModel } from './activityInputViewModel';

export function ActivityInputPanel() {
  const viewModel = createActivityInputViewModel();

  return (
    <section style={panelStyle}>
      <h2 style={titleStyle}>Activity Input</h2>
      <p style={bodyStyle}>{viewModel.helperText}</p>
      <div style={chipRowStyle}>
        <span style={chipStyle}>{viewModel.draft.category}</span>
        <span style={chipStyle}>intensity {viewModel.draft.intensity}</span>
      </div>
      <button style={buttonStyle} type="button">
        연결 예정
      </button>
    </section>
  );
}

const panelStyle = {
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '16px',
  padding: '1rem'
} as const;
const titleStyle = { margin: '0 0 0.5rem' } as const;
const bodyStyle = { margin: '0 0 0.8rem', color: '#94a3b8', lineHeight: 1.5 } as const;
const chipRowStyle = { display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' } as const;
const chipStyle = {
  borderRadius: '999px',
  padding: '0.25rem 0.7rem',
  background: 'rgba(56, 189, 248, 0.12)',
  color: '#7dd3fc'
} as const;
const buttonStyle = {
  width: '100%',
  border: 'none',
  borderRadius: '12px',
  padding: '0.7rem 0.9rem',
  background: '#38bdf8',
  color: '#082f49',
  fontWeight: 700,
  cursor: 'pointer'
} as const;
