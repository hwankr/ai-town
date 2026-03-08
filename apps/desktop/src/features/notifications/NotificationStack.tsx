import { useNotificationStore } from './notificationStore';

export function NotificationStack() {
  const messages = useNotificationStore((state) => state.messages);
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
      {messages.map((message) => (
        <span
          key={message}
          style={{
            borderRadius: '999px',
            padding: '0.35rem 0.7rem',
            background: 'rgba(16, 185, 129, 0.14)',
            color: '#6ee7b7'
          }}
        >
          {message}
        </span>
      ))}
    </div>
  );
}
