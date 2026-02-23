import type { LevelConfig } from './types';

export interface DifficultyContext {
  rallyCount: number;
  playerGamesLead: number; // absolute value of game lead
}

export interface DifficultyModifier {
  rangeMultiplier: number;   // 1.0 to 1.25
  timerReduction: number;    // 0 to 2 seconds
  aiAccuracyBoost: number;   // 0 to 0.08
  aiDelayReduction: number;  // 0 to 400ms
}

export function getDifficultyModifier(ctx: DifficultyContext): DifficultyModifier {
  // Rally factor: caps at rally 6, 40% weight
  const rallyFactor = Math.min(ctx.rallyCount / 6, 1) * 0.4;

  // Lead factor: caps at 2-game lead, 60% weight
  const leadFactor = Math.min(ctx.playerGamesLead / 2, 1) * 0.6;

  const intensity = rallyFactor + leadFactor; // 0 to 1

  return {
    rangeMultiplier: 1 + intensity * 0.25,
    timerReduction: intensity * 2,
    aiAccuracyBoost: intensity * 0.08,
    aiDelayReduction: intensity * 400,
  };
}

export function applyModifier(baseConfig: LevelConfig, modifier: DifficultyModifier): LevelConfig {
  const rm = modifier.rangeMultiplier;

  const scaleRange = (min: number, max: number) => ({
    min,
    max: Math.round(max * rm),
  });

  const scaleMult = (min1: number, max1: number, min2: number, max2: number) => ({
    min1,
    max1: Math.round(max1 * rm),
    min2,
    max2: Math.round(max2 * rm),
  });

  const scaledTimer = Math.max(3, Math.round(baseConfig.timerSeconds - modifier.timerReduction));
  const scaledAccuracy = Math.min(0.98, baseConfig.aiAccuracy + modifier.aiAccuracyBoost);
  const scaledDelay = Math.max(300, baseConfig.aiDelayMs - modifier.aiDelayReduction);

  return {
    addition: scaleRange(baseConfig.addition.min, baseConfig.addition.max),
    subtraction: scaleRange(baseConfig.subtraction.min, baseConfig.subtraction.max),
    multiplication: scaleMult(
      baseConfig.multiplication.min1,
      baseConfig.multiplication.max1,
      baseConfig.multiplication.min2,
      baseConfig.multiplication.max2,
    ),
    division: baseConfig.division
      ? {
          ...baseConfig.division,
          maxDivisor: Math.round(baseConfig.division.maxDivisor * rm),
          maxAnswer: Math.round(baseConfig.division.maxAnswer * rm),
        }
      : null,
    multiStep: baseConfig.multiStep,
    timerSeconds: scaledTimer,
    aiAccuracy: scaledAccuracy,
    aiDelayMs: scaledDelay,
  };
}
