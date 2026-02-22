import type { Player, TennisPoint, GameScore, MatchScore } from './types';
import { GAMES_TO_WIN } from './levels';

const POINT_PROGRESSION: Record<TennisPoint, TennisPoint | null> = {
  0: 15,
  15: 30,
  30: 40,
  40: null, // game won (when opponent is below 40)
};

export function freshGameScore(): GameScore {
  return { player: 0, opponent: 0, advantage: null };
}

export function freshMatchScore(): MatchScore {
  return { playerGames: 0, opponentGames: 0, currentGame: freshGameScore() };
}

/**
 * Score a point for `scorer`. Returns the new GameScore,
 * or null if the scorer just won the game.
 */
export function scorePoint(game: GameScore, scorer: Player): GameScore | null {
  const scorerPoints = game[scorer];
  const otherPlayer: Player = scorer === 'player' ? 'opponent' : 'player';
  const otherPoints = game[otherPlayer];

  // Both at 40 (deuce territory)
  if (scorerPoints === 40 && otherPoints === 40) {
    if (game.advantage === scorer) {
      // Scorer had advantage → wins the game
      return null;
    }
    if (game.advantage === otherPlayer) {
      // Opponent had advantage → back to deuce
      return { ...game, advantage: null };
    }
    // No advantage → scorer gets advantage
    return { ...game, advantage: scorer };
  }

  // Scorer at 40, opponent below 40 → game won
  if (scorerPoints === 40) {
    return null;
  }

  // Normal progression
  const nextPoint = POINT_PROGRESSION[scorerPoints]!;

  return {
    ...game,
    [scorer]: nextPoint,
    advantage: null,
  };
}

/**
 * Score a game for `scorer`. Returns new MatchScore,
 * or null if the scorer just won the match.
 */
export function scoreGame(match: MatchScore, scorer: Player): MatchScore | null {
  const key = scorer === 'player' ? 'playerGames' : 'opponentGames';
  const otherKey = scorer === 'player' ? 'opponentGames' : 'playerGames';

  const newGames = match[key] + 1;
  const otherGames = match[otherKey];

  if (newGames >= GAMES_TO_WIN && newGames - otherGames >= 2) {
    return null; // match won
  }

  return {
    ...match,
    [key]: newGames,
    currentGame: freshGameScore(),
  };
}

/**
 * Determine who serves based on total games played.
 * Player serves first (game 0), alternates each game.
 */
export function getServer(totalGamesPlayed: number): Player {
  return totalGamesPlayed % 2 === 0 ? 'player' : 'opponent';
}

/**
 * Format point display for a player's score in the current game.
 */
export function formatPointScore(game: GameScore): { player: string; opponent: string } {
  if (game.player === 40 && game.opponent === 40) {
    if (game.advantage === 'player') {
      return { player: 'AD', opponent: '40' };
    }
    if (game.advantage === 'opponent') {
      return { player: '40', opponent: 'AD' };
    }
    return { player: 'DEUCE', opponent: 'DEUCE' };
  }

  return {
    player: String(game.player),
    opponent: String(game.opponent),
  };
}
