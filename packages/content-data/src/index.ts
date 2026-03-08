import type { BootstrapContentManifest, CharacterProfile, LocationProfile } from '@ai-town/shared-types';

export const bootstrapContentManifest: BootstrapContentManifest = {
  characters: ['char_a.profile.json'],
  locations: [
    'home_block.location.json',
    'library.location.json',
    'cafe.location.json',
    'park.location.json',
    'arcade.location.json'
  ],
  events: ['social/first_greeting.event.json']
};

export const bootstrapCharacterProfiles: CharacterProfile[] = [
  {
    id: 'char_a',
    displayName: 'A',
    homeLocationId: 'loc_home_block',
    defaultSpawnLocationId: 'loc_home_block',
    personaTags: ['quiet', 'disciplined', 'observational'],
    preferredLocationIds: ['loc_home_block', 'loc_library', 'loc_park'],
    dislikedLocationIds: ['loc_arcade'],
    baseNeedRates: {
      energyDrainPerHour: 7,
      focusDrainPerHour: 6,
      funDrainPerHour: 5,
      socialDrainPerHour: 4,
      stressRecoveryPerRestHour: 18,
      comfortRecoveryPerRestHour: 14
    },
    traitVector: {
      discipline: 78,
      playfulness: 30,
      sociability: 42,
      activity: 48,
      sensitivity: 62,
      curiosity: 54
    },
    routineTemplate: [
      { startMinute: 0, endMinute: 360, theme: 'sleep', preferredLocationIds: ['loc_home_block'], locked: true },
      { startMinute: 360, endMinute: 540, theme: 'rest', preferredLocationIds: ['loc_home_block'], locked: false },
      { startMinute: 540, endMinute: 720, theme: 'study', preferredLocationIds: ['loc_home_block', 'loc_library'], locked: false },
      { startMinute: 720, endMinute: 960, theme: 'study', preferredLocationIds: ['loc_library', 'loc_cafe'], locked: false },
      { startMinute: 960, endMinute: 1140, theme: 'exercise', preferredLocationIds: ['loc_park', 'loc_cafe'], locked: false },
      { startMinute: 1140, endMinute: 1260, theme: 'social', preferredLocationIds: ['loc_cafe', 'loc_park'], locked: false },
      { startMinute: 1260, endMinute: 1440, theme: 'sleep', preferredLocationIds: ['loc_home_block'], locked: true }
    ]
  }
];

export const bootstrapLocationProfiles: LocationProfile[] = [
  {
    id: 'loc_home_block',
    displayName: 'Home Block',
    locationType: 'home',
    supportedActivities: ['sleep', 'rest', 'study'],
    capacity: 4,
    position: { x: 8, y: 14 },
    tags: ['safe', 'private', 'recovery'],
    openMinutes: [{ startMinute: 0, endMinute: 1440 }],
    adjacentLocationIds: ['loc_library', 'loc_cafe', 'loc_park'],
    defaultMoodTag: 'quiet'
  },
  {
    id: 'loc_library',
    displayName: 'Library',
    locationType: 'library',
    supportedActivities: ['study', 'social'],
    capacity: 8,
    position: { x: 20, y: 8 },
    tags: ['focus', 'quiet', 'indoors'],
    openMinutes: [{ startMinute: 8 * 60, endMinute: 22 * 60 }],
    adjacentLocationIds: ['loc_home_block', 'loc_cafe'],
    defaultMoodTag: 'focused'
  },
  {
    id: 'loc_cafe',
    displayName: 'Cafe',
    locationType: 'cafe',
    supportedActivities: ['rest', 'social', 'study'],
    capacity: 10,
    position: { x: 26, y: 14 },
    tags: ['social', 'rest', 'indoors'],
    openMinutes: [{ startMinute: 9 * 60, endMinute: 23 * 60 + 30 }],
    adjacentLocationIds: ['loc_home_block', 'loc_library', 'loc_park', 'loc_arcade'],
    defaultMoodTag: 'warm'
  },
  {
    id: 'loc_park',
    displayName: 'Park',
    locationType: 'park',
    supportedActivities: ['exercise', 'rest', 'social'],
    capacity: 16,
    position: { x: 16, y: 24 },
    tags: ['outdoors', 'recovery', 'open'],
    openMinutes: [{ startMinute: 0, endMinute: 1440 }],
    adjacentLocationIds: ['loc_home_block', 'loc_cafe', 'loc_arcade'],
    defaultMoodTag: 'breezy'
  },
  {
    id: 'loc_arcade',
    displayName: 'Arcade',
    locationType: 'arcade',
    supportedActivities: ['game', 'social'],
    capacity: 12,
    position: { x: 32, y: 24 },
    tags: ['play', 'noise', 'neon'],
    openMinutes: [{ startMinute: 11 * 60, endMinute: 24 * 60 }],
    adjacentLocationIds: ['loc_cafe', 'loc_park'],
    defaultMoodTag: 'loud'
  }
];

export const bootstrapCharacterProfilesById = Object.fromEntries(
  bootstrapCharacterProfiles.map((profile) => [profile.id, profile])
) as Record<string, CharacterProfile>;

export const bootstrapLocationProfilesById = Object.fromEntries(
  bootstrapLocationProfiles.map((profile) => [profile.id, profile])
) as Record<string, LocationProfile>;

export function getCharacterProfile(characterId: string): CharacterProfile {
  const profile = bootstrapCharacterProfilesById[characterId];

  if (!profile) {
    throw new Error(`Unknown character profile: ${characterId}`);
  }

  return profile;
}

export function getLocationProfile(locationId: string): LocationProfile {
  const profile = bootstrapLocationProfilesById[locationId];

  if (!profile) {
    throw new Error(`Unknown location profile: ${locationId}`);
  }

  return profile;
}
