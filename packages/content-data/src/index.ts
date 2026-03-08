export interface BootstrapContentManifest {
  characters: string[];
  locations: string[];
  events: string[];
}

export const bootstrapContentManifest: BootstrapContentManifest = {
  characters: ['char_a.profile.json'],
  locations: ['home_block.location.json', 'library.location.json'],
  events: ['social/first_greeting.event.json']
};
