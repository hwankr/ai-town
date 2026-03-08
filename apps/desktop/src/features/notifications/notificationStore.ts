import { create } from 'zustand';

interface NotificationState {
  messages: string[];
}

export const useNotificationStore = create<NotificationState>(() => ({
  messages: ['Workspace bootstrap complete']
}));
