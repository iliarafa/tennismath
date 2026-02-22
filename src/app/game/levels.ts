import type { Level, LevelConfig } from './types';

export const GAMES_TO_WIN = 3;

export const LEVEL_CONFIGS: Record<Level, LevelConfig> = {
  amateur: {
    addition: { min: 1, max: 10 },
    subtraction: { min: 1, max: 10 },
    multiplication: { min1: 1, max1: 10, min2: 1, max2: 10 },
    timerSeconds: 15,
    aiAccuracy: 0.5,
    aiDelayMs: 3000,
  },
  pro: {
    addition: { min: 1, max: 25 },
    subtraction: { min: 1, max: 25 },
    multiplication: { min1: 1, max1: 12, min2: 1, max2: 12 },
    timerSeconds: 10,
    aiAccuracy: 0.7,
    aiDelayMs: 2000,
  },
  'world-class': {
    addition: { min: 1, max: 50 },
    subtraction: { min: 1, max: 50 },
    multiplication: { min1: 1, max1: 20, min2: 1, max2: 12 },
    timerSeconds: 7,
    aiAccuracy: 0.9,
    aiDelayMs: 1000,
  },
};
