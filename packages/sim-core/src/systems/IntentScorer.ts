import {
  TICKS_PER_MINUTE,
  createIntentId,
  type CharacterProfile,
  type LocationId
} from '@ai-town/shared-types';
import { getActiveRoutineBlock } from './RoutinePlanner';
import { type CharacterState, type IntentState, type WorldState } from '../core/WorldState';

export interface IntentCandidate {
  intentType: string;
  targetLocationId: LocationId | null;
  score: number;
  reasonTags: string[];
}

export interface IntentSelectionResult {
  intent: IntentState;
  rankedCandidates: IntentCandidate[];
}

function scoreLocationPreference(character: CharacterState, locationId: LocationId): number {
  return character.locationAffinity[locationId] ?? 0;
}

function buildCandidate(
  intentType: string,
  targetLocationId: LocationId | null,
  score: number,
  reasonTags: string[]
): IntentCandidate {
  return {
    intentType,
    targetLocationId,
    score,
    reasonTags
  };
}

export function chooseIntentForCharacter(character: CharacterState, world: WorldState): IntentSelectionResult {
  const profile: CharacterProfile = world.characterProfiles[character.characterId];
  const activeBlock = getActiveRoutineBlock(character.scheduleState);
  const candidates: IntentCandidate[] = [];
  const currentLocation = world.locationProfiles[character.currentLocationId];

  if (activeBlock) {
    for (const locationId of activeBlock.preferredLocationIds) {
      const location = world.locationProfiles[locationId];
      const score =
        50 +
        activeBlock.priority +
        scoreLocationPreference(character, locationId) +
        (location.supportedActivities.includes(activeBlock.theme) ? 12 : -12) +
        (location.openMinutes.some((range) => world.clock.minuteOfDay >= range.startMinute && world.clock.minuteOfDay < range.endMinute) ? 8 : -30) +
        (character.currentLocationId === locationId ? 10 : 0);

      candidates.push(
        buildCandidate(`schedule:${activeBlock.theme}:${locationId}`, locationId, score, [
          `schedule:${activeBlock.theme}`,
          `location:${locationId}`,
          `phase:${world.clock.phase}`
        ])
      );
    }
  }

  if (character.needState.energy < 36 || character.needState.stress > 66) {
    candidates.push(
      buildCandidate('recover:home', profile.homeLocationId, 108, ['recover', 'low_energy_or_high_stress'])
    );
  }

  if (character.needState.fun > 62) {
    candidates.push(
      buildCandidate('play:arcade', 'loc_arcade', 92 + scoreLocationPreference(character, 'loc_arcade'), ['need:fun'])
    );
  }

  if (character.needState.social > 58) {
    candidates.push(
      buildCandidate('social:cafe', 'loc_cafe', 88 + scoreLocationPreference(character, 'loc_cafe'), ['need:social'])
    );
  }

  if (world.clock.phase === 'night' && character.currentLocationId !== profile.homeLocationId) {
    candidates.push(
      buildCandidate('return:home', profile.homeLocationId, 110, ['night_return'])
    );
  }

  if (!currentLocation.openMinutes.some((range) => world.clock.minuteOfDay >= range.startMinute && world.clock.minuteOfDay < range.endMinute)) {
    candidates.push(
      buildCandidate('evacuate:closed_location', profile.homeLocationId, 104, ['closed_location'])
    );
  }

  if (candidates.length === 0) {
    candidates.push(
      buildCandidate('idle:wander', character.currentLocationId, 40, ['fallback'])
    );
  }

  candidates.sort((left, right) => right.score - left.score || left.intentType.localeCompare(right.intentType));

  const chosen = candidates[0];
  return {
    rankedCandidates: candidates,
    intent: {
      intentId: createIntentId(character.characterId, world.clock.tickIndex),
      intentType: chosen.intentType,
      score: chosen.score,
      reasonTags: chosen.reasonTags,
      targetLocationId: chosen.targetLocationId,
      targetCharacterId: null,
      expiresAtTick: world.clock.tickIndex + TICKS_PER_MINUTE * 30
    }
  };
}
