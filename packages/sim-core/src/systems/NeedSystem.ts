import { TICKS_PER_HOUR, type WorldTime } from '@ai-town/shared-types';
import { clampGauge, type CharacterState, type EmotionState, type NeedState } from '../core/WorldState';

function perTick(ratePerHour: number): number {
  return ratePerHour / TICKS_PER_HOUR;
}

export function deriveEmotionState(needState: NeedState): EmotionState {
  const valenceSeed = clampGauge(needState.comfort + needState.energy - needState.stress, -100, 100);
  const arousal = clampGauge(needState.stress + (100 - needState.energy) / 2);

  let dominantEmotion = 'calm';
  let lastEmotionSource: string | null = null;

  if (needState.energy < 32) {
    dominantEmotion = 'tired';
    lastEmotionSource = 'low_energy';
  } else if (needState.stress > 68) {
    dominantEmotion = 'tense';
    lastEmotionSource = 'stress';
  } else if (needState.fun > 60) {
    dominantEmotion = 'bored';
    lastEmotionSource = 'fun_need';
  } else if (needState.social > 58) {
    dominantEmotion = 'lonely';
    lastEmotionSource = 'social_need';
  } else if (needState.focus > 72 && needState.stress < 40) {
    dominantEmotion = 'focused';
    lastEmotionSource = 'focus';
  }

  return {
    valence: valenceSeed - 50,
    arousal,
    dominantEmotion,
    stability: clampGauge(70 - Math.abs((valenceSeed - 50) / 2)),
    lastEmotionSource
  };
}

export function updateCharacterNeeds(character: CharacterState, clock: WorldTime): CharacterState {
  const actionType = character.currentAction.actionType;
  const isResting = actionType === 'rest' || actionType === 'sleep';
  const isStudying = actionType === 'study';
  const isPlaying = actionType === 'game';
  const isSocial = actionType === 'social';
  const isExercise = actionType === 'exercise';
  const isMoving = actionType === 'move';

  const drainEnergy = isResting ? -perTick(24) : perTick((character.needState.stress > 60 ? 9 : 7) + (isMoving || isExercise ? 6 : 0));
  const focusShift = isStudying ? perTick(6) : -perTick(6 + (isPlaying ? 2 : 0));
  const funShift = isPlaying ? -perTick(18) : perTick(5 + (clock.phase === 'evening' ? 1 : 0));
  const socialShift = isSocial ? -perTick(16) : perTick(4 + (clock.phase === 'evening' ? 1 : 0));
  const stressShift = isResting
    ? -perTick(18)
    : perTick((isStudying ? 4 : 1) + (character.needState.energy < 35 ? 4 : 0) + (character.needState.fun > 65 ? 2 : 0));
  const comfortShift = isResting || actionType === 'social' ? perTick(12) : -perTick(5 + (isMoving ? 2 : 0));

  const needState: NeedState = {
    energy: clampGauge(character.needState.energy - drainEnergy),
    focus: clampGauge(character.needState.focus + focusShift),
    fun: clampGauge(character.needState.fun + funShift),
    social: clampGauge(character.needState.social + socialShift),
    stress: clampGauge(character.needState.stress + stressShift),
    comfort: clampGauge(character.needState.comfort + comfortShift)
  };

  return {
    ...character,
    needState,
    emotionState: deriveEmotionState(needState)
  };
}
