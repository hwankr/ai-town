import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
}

export const useUIStore = create<UIState>(() => ({
  isSidebarOpen: true
}));
