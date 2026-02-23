export type Player = 'player' | 'opponent';
export type GameMode = 'ai' | 'human' | 'online';
export type Level = 'amateur' | 'pro' | 'world-class' | 'elite' | 'legend';
export type TennisPoint = 0 | 15 | 30 | 40;

export interface GameScore {
  player: TennisPoint;
  opponent: TennisPoint;
  advantage: Player | null; // only set when deuce
}

export interface MatchScore {
  playerGames: number;
  opponentGames: number;
  currentGame: GameScore;
}

export interface DivisionConfig {
  minDivisor: number;
  maxDivisor: number;
  minAnswer: number;
  maxAnswer: number;
}

export interface MultiStepConfig {
  enabled: boolean;
  operations: ('+' | '-' | '*')[];
}

export interface LevelConfig {
  addition: { min: number; max: number };
  subtraction: { min: number; max: number };
  multiplication: { min1: number; max1: number; min2: number; max2: number };
  division: DivisionConfig | null;
  multiStep: MultiStepConfig | null;
  timerSeconds: number;
  aiAccuracy: number;
  aiDelayMs: number;
}

export interface MathProblem {
  question: string;
  answer: number;
}

export interface GameState {
  matchScore: MatchScore;
  server: Player;
  currentPlayer: Player;
  question: string;
  answer: number;
  ballPosition: 'player' | 'opponent';
  isAnimating: boolean;
  matchOver: boolean;
  winner: Player | null;
  rallyCount: number;
}
