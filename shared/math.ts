import type { LevelConfig, MathProblem } from './types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMathProblem(config: LevelConfig): MathProblem {
  const operations = ['+', '-', '*'] as const;
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1: number, num2: number, answer: number;

  switch (operation) {
    case '+': {
      const { min, max } = config.addition;
      num1 = randInt(min, max);
      num2 = randInt(min, max);
      answer = num1 + num2;
      break;
    }
    case '-': {
      const { min, max } = config.subtraction;
      num1 = randInt(min, max);
      num2 = randInt(min, max);
      // Swap to avoid negatives
      if (num2 > num1) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      break;
    }
    case '*': {
      const { min1, max1, min2, max2 } = config.multiplication;
      num1 = randInt(min1, max1);
      num2 = randInt(min2, max2);
      answer = num1 * num2;
      break;
    }
  }

  return {
    question: `${num1} ${operation === '*' ? '\u00d7' : operation} ${num2}`,
    answer,
  };
}
