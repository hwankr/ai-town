export interface ActivityDraft {
  category: 'study' | 'rest' | 'social' | 'play';
  intensity: 1 | 2 | 3;
}

export function createDefaultActivityDraft(): ActivityDraft {
  return {
    category: 'study',
    intensity: 2
  };
}
