const DEFAULT_SEED = 0x1234abcd;
const MODULUS = 0x100000000;

export interface RandomSample<T> {
  state: number;
  value: T;
}

export function createRngState(seed = DEFAULT_SEED): number {
  const normalized = seed >>> 0;
  return normalized === 0 ? DEFAULT_SEED : normalized;
}

export function nextRngState(state: number): number {
  return (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0;
}

export function sampleFloat(state: number): RandomSample<number> {
  const nextState = nextRngState(state);
  return {
    state: nextState,
    value: nextState / MODULUS
  };
}

export function sampleRange(state: number, minInclusive: number, maxExclusive: number): RandomSample<number> {
  if (maxExclusive <= minInclusive) {
    return {
      state,
      value: minInclusive
    };
  }

  const sample = sampleFloat(state);
  return {
    state: sample.state,
    value: minInclusive + Math.floor(sample.value * (maxExclusive - minInclusive))
  };
}

export function sampleCenteredRange(state: number, amplitude: number): RandomSample<number> {
  const sample = sampleFloat(state);
  return {
    state: sample.state,
    value: Math.round((sample.value * 2 - 1) * amplitude)
  };
}

export function pickOne<T>(state: number, items: readonly T[]): RandomSample<T> {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty collection.');
  }

  const index = sampleRange(state, 0, items.length);
  return {
    state: index.state,
    value: items[index.value]
  };
}
