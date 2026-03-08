import { create } from 'zustand';

interface SessionState {
  selectedCharacterId: string;
}

export const useSessionStore = create<SessionState>(() => ({
  selectedCharacterId: 'char_a'
}));
