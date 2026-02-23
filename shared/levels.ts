import type { Level, LevelConfig } from './types';

export const GAMES_TO_WIN = 3;

export const LEVEL_CONFIGS: Record<Level, LevelConfig> = {
  amateur: {
    addition: { min: 1, max: 10 },
    subtraction: { min: 1, max: 10 },
    multiplication: { min1: 1, max1: 10, min2: 1, max2: 10 },
    division: null,
    multiStep: null,
    timerSeconds: 15,
    aiAccuracy: 0.75,
    aiDelayMs: 3000,
  },
  pro: {
    addition: { min: 1, max: 25 },
    subtraction: { min: 1, max: 25 },
    multiplication: { min1: 1, max1: 12, min2: 1, max2: 12 },
    division: null,
    multiStep: null,
    timerSeconds: 10,
    aiAccuracy: 0.85,
    aiDelayMs: 2000,
  },
  'world-class': {
    addition: { min: 1, max: 50 },
    subtraction: { min: 1, max: 50 },
    multiplication: { min1: 1, max1: 20, min2: 1, max2: 12 },
    division: { minDivisor: 2, maxDivisor: 10, minAnswer: 2, maxAnswer: 12 },
    multiStep: null,
    timerSeconds: 7,
    aiAccuracy: 0.93,
    aiDelayMs: 1000,
  },
  elite: {
    addition: { min: 1, max: 75 },
    subtraction: { min: 1, max: 75 },
    multiplication: { min1: 1, max1: 25, min2: 1, max2: 15 },
    division: { minDivisor: 2, maxDivisor: 12, minAnswer: 2, maxAnswer: 20 },
    multiStep: { enabled: true, operations: ['+', '-', '*'] },
    timerSeconds: 6,
    aiAccuracy: 0.95,
    aiDelayMs: 800,
  },
  legend: {
    addition: { min: 1, max: 100 },
    subtraction: { min: 1, max: 100 },
    multiplication: { min1: 1, max1: 30, min2: 1, max2: 20 },
    division: { minDivisor: 2, maxDivisor: 15, minAnswer: 3, maxAnswer: 25 },
    multiStep: { enabled: true, operations: ['+', '-', '*'] },
    timerSeconds: 5,
    aiAccuracy: 0.97,
    aiDelayMs: 600,
  },
};
