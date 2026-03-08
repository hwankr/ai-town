import { create } from 'zustand';

interface DebugState {
  showOverlay: boolean;
}

export const useDebugStore = create<DebugState>(() => ({
  showOverlay: false
}));
