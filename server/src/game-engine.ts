import type { Level, LevelConfig, MatchScore, MathProblem } from '../../shared/types';
import { LEVEL_CONFIGS } from '../../shared/levels';
import { generateMathProblem, generateMathProblemPair } from '../../shared/math';
import { getDifficultyModifier, applyModifier } from '../../shared/scaling';
import type { DifficultyContext } from '../../shared/scaling';
import {
  freshMatchScore,
  scorePoint,
  scoreGame,
  getServer,
} from '../../shared/scoring';
import { TimerManager } from './timer-manager';
import type { Room } from './room-manager';

export interface GameRoomState {
  roomCode: string;
  level: Level;
  matchScore: MatchScore;
  currentTurn: 'host' | 'guest';
  server: 'host' | 'guest';
  currentProblem: MathProblem;
  nextProblem: MathProblem | null;
  rallyCount: number;
  matchOver: boolean;
  winner: 'host' | 'guest' | null;
}

type EmitToPlayer = (
  socketId: string,
  event: string,
  data: Record<string, unknown>
) => void;

export class GameEngine {
  private games = new Map<string, GameRoomState>();
  private timerManager = new TimerManager();

  startGame(room: Room, emit: EmitToPlayer): void {
    if (!room.level || !room.guest) return;

    const state: GameRoomState = {
      roomCode: room.code,
      level: room.level,
      matchScore: freshMatchScore(),
      currentTurn: 'host', // host serves first
      server: 'host',
      currentProblem: { question: '', answer: 0 },
      nextProblem: null,
      rallyCount: 0,
      matchOver: false,
      winner: null,
    };

    const scaledConfig = this.getScaledConfig(state);
    const [first, second] = generateMathProblemPair(scaledConfig);
    state.currentProblem = first;
    state.nextProblem = second;

    this.games.set(room.code, state);
    room.gameInProgress = true;

    // Emit to host (host is "player" from their perspective)
    emit(room.host.socketId, 'game:start', {
      question: first.question,
      yourTurn: true,
      server: 'player' as const,
      timerSeconds: scaledConfig.timerSeconds,
    });

    // Emit to guest (guest sees host as "opponent")
    emit(room.guest.socketId, 'game:start', {
      question: first.question,
      yourTurn: false,
      server: 'opponent' as const,
      timerSeconds: scaledConfig.timerSeconds,
    });

    // Start timer for current turn
    this.startTurnTimer(room, state, emit);
  }

  handleAnswer(
    room: Room,
    socketId: string,
    answer: number,
    emit: EmitToPlayer
  ): void {
    const state = this.games.get(room.code);
    if (!state || state.matchOver) return;

    const isHost = room.host.socketId === socketId;
    const playerRole = isHost ? 'host' : 'guest';

    // Only accept answers from the current turn's player
    if (state.currentTurn !== playerRole) return;

    const isCorrect = answer === state.currentProblem.answer;

    // Notify the answerer
    emit(socketId, 'game:answer-result', { correct: isCorrect });

    // Notify opponent
    const opponentSocketId = isHost
      ? room.guest!.socketId
      : room.host.socketId;
    emit(opponentSocketId, 'game:opponent-answered', { correct: isCorrect });

    // Clear the timer
    this.timerManager.clear(room.code);

    if (isCorrect) {
      // Ball goes to opponent — switch turn
      state.currentTurn = isHost ? 'guest' : 'host';
      state.rallyCount++;

      // Generate new problem after animation delay
      setTimeout(() => {
        if (state.matchOver) return;
        this.sendNextQuestion(room, state, emit);
      }, 800);
    } else {
      // Wrong answer — point lost
      this.handlePointLost(room, state, playerRole, emit);
    }
  }

  handleTimerExpired(
    room: Room,
    state: GameRoomState,
    emit: EmitToPlayer
  ): void {
    if (state.matchOver) return;

    const loserRole = state.currentTurn;

    // Notify both players
    emit(room.host.socketId, 'game:timer-expired', {
      who: loserRole === 'host' ? 'player' : 'opponent',
    });
    if (room.guest) {
      emit(room.guest.socketId, 'game:timer-expired', {
        who: loserRole === 'guest' ? 'player' : 'opponent',
      });
    }

    // After feedback delay, resolve the point
    setTimeout(() => {
      this.handlePointLost(room, state, loserRole, emit);
    }, 500);
  }

  private handlePointLost(
    room: Room,
    state: GameRoomState,
    loser: 'host' | 'guest',
    emit: EmitToPlayer
  ): void {
    if (state.matchOver) return;

    // Map to Player type for scoring functions
    const scorerAsPlayer = loser === 'host' ? 'opponent' : 'player';
    const newGame = scorePoint(
      state.matchScore.currentGame,
      scorerAsPlayer === 'player' ? 'player' : 'opponent'
    );

    if (newGame === null) {
      // Game won — check match
      const newMatch = scoreGame(state.matchScore, scorerAsPlayer);

      if (newMatch === null) {
        // Match won
        state.matchOver = true;
        state.winner = loser === 'host' ? 'guest' : 'host';

        this.emitScoreUpdate(room, state, loser === 'host' ? 'guest' : 'host', emit);

        emit(room.host.socketId, 'game:match-over', {
          winner: state.winner === 'host' ? 'player' : 'opponent',
        });
        if (room.guest) {
          emit(room.guest.socketId, 'game:match-over', {
            winner: state.winner === 'guest' ? 'player' : 'opponent',
          });
        }

        this.cleanup(room.code);
        room.gameInProgress = false;
        return;
      }

      // New game
      state.matchScore = newMatch;
      const totalGames = newMatch.playerGames + newMatch.opponentGames;
      const serverAsPlayer = getServer(totalGames);
      state.server = serverAsPlayer === 'player' ? 'host' : 'guest';
      state.currentTurn = state.server;
      state.rallyCount = 0;
      state.nextProblem = null;
    } else {
      // Point scored but game continues
      state.matchScore = { ...state.matchScore, currentGame: newGame };
      state.currentTurn = state.server;
      state.rallyCount = 0;
      state.nextProblem = null;
    }

    // Emit score update
    this.emitScoreUpdate(room, state, loser === 'host' ? 'guest' : 'host', emit);

    // Send next question after brief delay
    setTimeout(() => {
      if (state.matchOver) return;
      this.sendNextQuestion(room, state, emit);
    }, 500);
  }

  private emitScoreUpdate(
    room: Room,
    state: GameRoomState,
    scorer: 'host' | 'guest',
    emit: EmitToPlayer
  ): void {
    // Host sees score as-is (host=player, guest=opponent)
    emit(room.host.socketId, 'game:score-update', {
      matchScore: state.matchScore,
      pointScorer: scorer === 'host' ? 'player' : 'opponent',
    });

    // Guest sees flipped score
    if (room.guest) {
      const flipped: MatchScore = {
        playerGames: state.matchScore.opponentGames,
        opponentGames: state.matchScore.playerGames,
        currentGame: {
          player: state.matchScore.currentGame.opponent,
          opponent: state.matchScore.currentGame.player,
          advantage:
            state.matchScore.currentGame.advantage === 'player'
              ? 'opponent'
              : state.matchScore.currentGame.advantage === 'opponent'
                ? 'player'
                : null,
        },
      };
      emit(room.guest.socketId, 'game:score-update', {
        matchScore: flipped,
        pointScorer: scorer === 'guest' ? 'player' : 'opponent',
      });
    }
  }

  private sendNextQuestion(
    room: Room,
    state: GameRoomState,
    emit: EmitToPlayer
  ): void {
    const scaledConfig = this.getScaledConfig(state);

    let problem: MathProblem;
    if (state.nextProblem) {
      problem = state.nextProblem;
      state.nextProblem = null;
    } else {
      const [first, second] = generateMathProblemPair(scaledConfig);
      problem = first;
      state.nextProblem = second;
    }
    state.currentProblem = problem;

    emit(room.host.socketId, 'game:question', {
      question: problem.question,
      yourTurn: state.currentTurn === 'host',
      timerSeconds: scaledConfig.timerSeconds,
    });
    if (room.guest) {
      emit(room.guest.socketId, 'game:question', {
        question: problem.question,
        yourTurn: state.currentTurn === 'guest',
        timerSeconds: scaledConfig.timerSeconds,
      });
    }

    this.startTurnTimer(room, state, emit);
  }

  private startTurnTimer(
    room: Room,
    state: GameRoomState,
    emit: EmitToPlayer
  ): void {
    const scaledConfig = this.getScaledConfig(state);
    this.timerManager.start(room.code, scaledConfig.timerSeconds, () => {
      this.handleTimerExpired(room, state, emit);
    });
  }

  private getScaledConfig(state: GameRoomState): LevelConfig {
    const baseConfig = LEVEL_CONFIGS[state.level];
    const ctx: DifficultyContext = {
      rallyCount: state.rallyCount,
      // Use absolute game lead so both players face the same difficulty
      playerGamesLead: Math.abs(
        state.matchScore.playerGames - state.matchScore.opponentGames
      ),
    };
    return applyModifier(baseConfig, getDifficultyModifier(ctx));
  }

  getState(roomCode: string): GameRoomState | undefined {
    return this.games.get(roomCode);
  }

  cleanup(roomCode: string): void {
    this.timerManager.clear(roomCode);
    this.games.delete(roomCode);
  }
}
