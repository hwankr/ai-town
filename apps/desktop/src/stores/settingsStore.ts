import { create } from 'zustand';

interface SettingsState {
  locale: string;
}

export const useSettingsStore = create<SettingsState>(() => ({
  locale: 'ko-KR'
}));
