import type { LevelConfig, MathProblem } from './types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAddition(config: LevelConfig): MathProblem {
  const { min, max } = config.addition;
  const num1 = randInt(min, max);
  const num2 = randInt(min, max);
  return { question: `${num1} + ${num2}`, answer: num1 + num2 };
}

function generateSubtraction(config: LevelConfig): MathProblem {
  const { min, max } = config.subtraction;
  let num1 = randInt(min, max);
  let num2 = randInt(min, max);
  if (num2 > num1) [num1, num2] = [num2, num1];
  return { question: `${num1} - ${num2}`, answer: num1 - num2 };
}

function generateMultiplication(config: LevelConfig): MathProblem {
  const { min1, max1, min2, max2 } = config.multiplication;
  const num1 = randInt(min1, max1);
  const num2 = randInt(min2, max2);
  return { question: `${num1} \u00d7 ${num2}`, answer: num1 * num2 };
}

function generateDivision(config: LevelConfig): MathProblem {
  const div = config.division!;
  const answer = randInt(div.minAnswer, div.maxAnswer);
  const divisor = randInt(div.minDivisor, div.maxDivisor);
  const dividend = answer * divisor;
  return { question: `${dividend} \u00f7 ${divisor}`, answer };
}

function generateMultiStep(config: LevelConfig): MathProblem {
  const ms = config.multiStep!;
  // Four patterns with capped operand ranges to keep answers under ~400
  const patterns = [
    // (a + b) × c
    () => {
      const a = randInt(2, 15);
      const b = randInt(2, 15);
      const c = randInt(2, 10);
      return { question: `(${a} + ${b}) \u00d7 ${c}`, answer: (a + b) * c };
    },
    // (a - b) × c
    () => {
      let a = randInt(5, 20);
      let b = randInt(2, 15);
      if (b >= a) [a, b] = [b + 1, a];
      const c = randInt(2, 10);
      return { question: `(${a} - ${b}) \u00d7 ${c}`, answer: (a - b) * c };
    },
    // a × b + c
    () => {
      const a = randInt(2, 15);
      const b = randInt(2, 12);
      const c = randInt(1, 20);
      return { question: `${a} \u00d7 ${b} + ${c}`, answer: a * b + c };
    },
    // a × b - c
    () => {
      const a = randInt(2, 15);
      const b = randInt(2, 12);
      const product = a * b;
      const c = randInt(1, Math.min(product - 1, 20));
      return { question: `${a} \u00d7 ${b} - ${c}`, answer: product - c };
    },
  ];

  // Legend gets wider ranges
  if (ms.operations.length === 3) {
    // Check if this is a legend-tier config by looking at addition max
    const isLegend = config.addition.max >= 100;
    if (isLegend) {
      patterns.push(
        // Harder (a + b) × c for Legend
        () => {
          const a = randInt(5, 25);
          const b = randInt(5, 25);
          const c = randInt(2, 12);
          return { question: `(${a} + ${b}) \u00d7 ${c}`, answer: (a + b) * c };
        },
        // Harder a × b + c for Legend
        () => {
          const a = randInt(3, 20);
          const b = randInt(3, 15);
          const c = randInt(5, 30);
          return { question: `${a} \u00d7 ${b} + ${c}`, answer: a * b + c };
        },
      );
    }
  }

  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  return pattern();
}

// --- Pair generation for fair problem matching ---

function narrowRange(min: number, max: number): { min: number; max: number } {
  const span = max - min;
  const bandWidth = Math.max(3, Math.round(span * 0.4));
  const bandMin = randInt(min, max - bandWidth);
  return { min: bandMin, max: bandMin + bandWidth };
}

function generateAdditionPair(config: LevelConfig): [MathProblem, MathProblem] {
  const band = narrowRange(config.addition.min, config.addition.max);
  const make = (): MathProblem => {
    const a = randInt(band.min, band.max);
    const b = randInt(band.min, band.max);
    return { question: `${a} + ${b}`, answer: a + b };
  };
  return [make(), make()];
}

function generateSubtractionPair(config: LevelConfig): [MathProblem, MathProblem] {
  const band = narrowRange(config.subtraction.min, config.subtraction.max);
  const make = (): MathProblem => {
    let a = randInt(band.min, band.max);
    let b = randInt(band.min, band.max);
    if (b > a) [a, b] = [b, a];
    return { question: `${a} - ${b}`, answer: a - b };
  };
  return [make(), make()];
}

function generateMultiplicationPair(config: LevelConfig): [MathProblem, MathProblem] {
  const { min1, max1, min2, max2 } = config.multiplication;
  const band1 = narrowRange(min1, max1);
  const band2 = narrowRange(min2, max2);
  const make = (): MathProblem => {
    const a = randInt(band1.min, band1.max);
    const b = randInt(band2.min, band2.max);
    return { question: `${a} × ${b}`, answer: a * b };
  };
  return [make(), make()];
}

function generateDivisionPair(config: LevelConfig): [MathProblem, MathProblem] {
  const div = config.division!;
  const answerBand = narrowRange(div.minAnswer, div.maxAnswer);
  const divisorBand = narrowRange(div.minDivisor, div.maxDivisor);
  const make = (): MathProblem => {
    const answer = randInt(answerBand.min, answerBand.max);
    const divisor = randInt(divisorBand.min, divisorBand.max);
    const dividend = answer * divisor;
    return { question: `${dividend} ÷ ${divisor}`, answer };
  };
  return [make(), make()];
}

function generateMultiStepPair(config: LevelConfig): [MathProblem, MathProblem] {
  // Pick the same pattern for both problems (ranges are already tight)
  const ms = config.multiStep!;
  const patterns = [
    () => { const a = randInt(2, 15); const b = randInt(2, 15); const c = randInt(2, 10); return { question: `(${a} + ${b}) × ${c}`, answer: (a + b) * c }; },
    () => { let a = randInt(5, 20); let b = randInt(2, 15); if (b >= a) [a, b] = [b + 1, a]; const c = randInt(2, 10); return { question: `(${a} - ${b}) × ${c}`, answer: (a - b) * c }; },
    () => { const a = randInt(2, 15); const b = randInt(2, 12); const c = randInt(1, 20); return { question: `${a} × ${b} + ${c}`, answer: a * b + c }; },
    () => { const a = randInt(2, 15); const b = randInt(2, 12); const product = a * b; const c = randInt(1, Math.min(product - 1, 20)); return { question: `${a} × ${b} - ${c}`, answer: product - c }; },
  ];
  if (ms.operations.length === 3) {
    const isLegend = config.addition.max >= 100;
    if (isLegend) {
      patterns.push(
        () => { const a = randInt(5, 25); const b = randInt(5, 25); const c = randInt(2, 12); return { question: `(${a} + ${b}) × ${c}`, answer: (a + b) * c }; },
        () => { const a = randInt(3, 20); const b = randInt(3, 15); const c = randInt(5, 30); return { question: `${a} × ${b} + ${c}`, answer: a * b + c }; },
      );
    }
  }
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  return [pattern(), pattern()];
}

export function generateMathProblemPair(config: LevelConfig): [MathProblem, MathProblem] {
  type PairGenerator = () => [MathProblem, MathProblem];
  const pool: { gen: PairGenerator; weight: number }[] = [
    { gen: () => generateAdditionPair(config), weight: 3 },
    { gen: () => generateSubtractionPair(config), weight: 3 },
    { gen: () => generateMultiplicationPair(config), weight: 3 },
  ];

  if (config.division) {
    pool.push({ gen: () => generateDivisionPair(config), weight: 3 });
  }

  if (config.multiStep?.enabled) {
    pool.push({ gen: () => generateMultiStepPair(config), weight: 2 });
  }

  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.gen();
  }

  return pool[0].gen();
}

export function generateMathProblem(config: LevelConfig): MathProblem {
  // Build weighted pool of generators
  type Generator = () => MathProblem;
  const pool: { gen: Generator; weight: number }[] = [
    { gen: () => generateAddition(config), weight: 3 },
    { gen: () => generateSubtraction(config), weight: 3 },
    { gen: () => generateMultiplication(config), weight: 3 },
  ];

  if (config.division) {
    pool.push({ gen: () => generateDivision(config), weight: 3 });
  }

  if (config.multiStep?.enabled) {
    pool.push({ gen: () => generateMultiStep(config), weight: 2 });
  }

  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.gen();
  }

  // Fallback (shouldn't reach here)
  return pool[0].gen();
}
