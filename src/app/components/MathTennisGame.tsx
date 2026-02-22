import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { TennisCourtHorizontal } from './TennisCourtHorizontal';
import type { Player, Level, GameState } from '../game/types';
import { LEVEL_CONFIGS } from '../game/levels';
import { generateMathProblem } from '../game/math';
import {
  freshMatchScore,
  scorePoint,
  scoreGame,
  getServer,
  formatPointScore,
} from '../game/scoring';
import { useHitTimer } from '../game/useHitTimer';

interface MathTennisGameProps {
  mode: 'ai' | 'human';
  level: Level;
  onBack: () => void;
}

function createInitialState(level: Level): GameState {
  const config = LEVEL_CONFIGS[level];
  const problem = generateMathProblem(config);
  return {
    matchScore: freshMatchScore(),
    server: 'player',
    currentPlayer: 'player', // server goes first
    question: problem.question,
    answer: problem.answer,
    ballPosition: 'player',
    isAnimating: false,
    matchOver: false,
    winner: null,
    rallyCount: 0,
  };
}

export function MathTennisGame({ mode, level, onBack }: MathTennisGameProps) {
  const config = LEVEL_CONFIGS[level];
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(level));
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);

  const isHuman = mode === 'human';
  const p1Label = isHuman ? 'P1' : 'You';
  const p2Label = isHuman ? 'P2' : 'AI';

  // --- Point resolution ---
  const handlePointLost = useCallback((loser: Player) => {
    setGameState(prev => {
      if (prev.matchOver) return prev;

      const scorer: Player = loser === 'player' ? 'opponent' : 'player';
      const newGame = scorePoint(prev.matchScore.currentGame, scorer);

      if (newGame === null) {
        // Game won — check match
        const newMatch = scoreGame(prev.matchScore, scorer);

        if (newMatch === null) {
          // Match won
          return { ...prev, matchOver: true, winner: scorer };
        }

        // New game — alternate server
        const totalGames = newMatch.playerGames + newMatch.opponentGames;
        const newServer = getServer(totalGames);
        const problem = generateMathProblem(config);
        return {
          ...prev,
          matchScore: newMatch,
          server: newServer,
          currentPlayer: newServer,
          ballPosition: newServer,
          question: problem.question,
          answer: problem.answer,
          rallyCount: 0,
        };
      }

      // Point scored but game continues — server starts new rally
      const problem = generateMathProblem(config);
      return {
        ...prev,
        matchScore: { ...prev.matchScore, currentGame: newGame },
        currentPlayer: prev.server,
        ballPosition: prev.server,
        question: problem.question,
        answer: problem.answer,
        rallyCount: 0,
      };
    });
  }, [config]);

  // --- Timer ---
  const timerIsActive =
    !gameState.isAnimating &&
    !gameState.matchOver &&
    showFeedback === null &&
    (isHuman || gameState.currentPlayer === 'player');

  const handleTimeUp = useCallback(() => {
    if (gameState.matchOver || gameState.isAnimating || showFeedback !== null) return;
    setShowFeedback('wrong');
    setUserAnswer('');
    const loser = gameState.currentPlayer;
    setTimeout(() => {
      setShowFeedback(null);
      handlePointLost(loser);
    }, 500);
  }, [gameState.matchOver, gameState.isAnimating, gameState.currentPlayer, showFeedback, handlePointLost]);

  const { timeRemaining, resetTimer } = useHitTimer({
    initialSeconds: config.timerSeconds,
    onTimeUp: handleTimeUp,
    isActive: timerIsActive,
  });

  // --- AI auto-turn ---
  useEffect(() => {
    if (mode !== 'ai') return;
    if (gameState.currentPlayer !== 'opponent' || gameState.isAnimating || gameState.matchOver || showFeedback !== null) return;

    const timer = setTimeout(() => {
      const isCorrect = Math.random() < config.aiAccuracy;
      if (isCorrect) {
        hitBall('opponent', 'player');
      } else {
        handlePointLost('opponent');
      }
    }, config.aiDelayMs);

    return () => clearTimeout(timer);
  }, [gameState.currentPlayer, gameState.isAnimating, gameState.matchOver, showFeedback, mode]);

  // --- Ball animation ---
  const hitBall = (from: Player, to: Player) => {
    setGameState(prev => ({ ...prev, isAnimating: true }));

    setTimeout(() => {
      const problem = generateMathProblem(config);
      setGameState(prev => ({
        ...prev,
        currentPlayer: to,
        ballPosition: to,
        isAnimating: false,
        question: problem.question,
        answer: problem.answer,
        rallyCount: prev.rallyCount + 1,
      }));
      resetTimer();
    }, 800);
  };

  // --- Answer handling ---
  const handleAnswer = () => {
    if (!userAnswer || gameState.isAnimating || gameState.matchOver) return;

    const currentPlayer = gameState.currentPlayer;
    const isCorrect = parseInt(userAnswer) === gameState.answer;
    setShowFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setShowFeedback(null);
      setUserAnswer('');

      if (isCorrect) {
        const to: Player = currentPlayer === 'player' ? 'opponent' : 'player';
        hitBall(currentPlayer, to);
      } else {
        handlePointLost(currentPlayer);
      }
    }, 500);
  };

  // --- Keypad ---
  const isCurrentPlayerTurn = isHuman
    ? !gameState.isAnimating && showFeedback === null && !gameState.matchOver
    : gameState.currentPlayer === 'player' && !gameState.isAnimating && showFeedback === null && !gameState.matchOver;

  const handleKeypadPress = (value: string) => {
    if (!isCurrentPlayerTurn) return;
    if (value === 'delete') {
      setUserAnswer(prev => prev.slice(0, -1));
    } else if (value === 'enter') {
      handleAnswer();
    } else {
      setUserAnswer(prev => prev + value);
    }
  };

  // --- Reset ---
  const resetGame = () => {
    setGameState(createInitialState(level));
    setUserAnswer('');
    setShowFeedback(null);
    resetTimer();
  };

  // --- Ball position ---
  const getBallPosition = () => {
    if (gameState.isAnimating) {
      return gameState.currentPlayer === 'player'
        ? { left: '75%', top: '50%' }
        : { left: '25%', top: '50%' };
    }
    return gameState.ballPosition === 'opponent'
      ? { left: '20%', top: '50%' }
      : { left: '80%', top: '50%' };
  };

  // --- Status message ---
  const getStatusMessage = () => {
    if (gameState.matchOver) {
      if (isHuman) {
        return gameState.winner === 'player' ? 'P1 Wins the Match!' : 'P2 Wins the Match!';
      }
      return gameState.winner === 'player' ? 'You Win the Match!' : 'Game Over!';
    }
    if (isHuman) {
      const label = gameState.currentPlayer === 'player' ? 'P1' : 'P2';
      const serving = gameState.currentPlayer === gameState.server ? ' (serving)' : '';
      return `${label}'s turn${serving} - solve to hit!`;
    }
    if (gameState.currentPlayer === 'player') {
      const serving = gameState.server === 'player' ? ' (serving)' : '';
      return `Your turn${serving} - solve to hit!`;
    }
    return 'Opponent is thinking...';
  };

  // --- Score display ---
  const pointDisplay = formatPointScore(gameState.matchScore.currentGame);
  const isDeuce = pointDisplay.player === 'DEUCE';

  const TennisBallIcon = () => (
    <svg className="w-3 h-3 inline-block" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FFD700"/>
      <path d="M 4 8 Q 8 12 4 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 20 8 Q 16 12 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#1a3a2e] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Score Board */}
      <div className="bg-[#1a3a2e] text-white py-2 px-6 relative">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Row 1: Games score */}
        <div className="flex items-center justify-center gap-6 mb-1">
          <div className="flex items-center gap-2">
            {gameState.server === 'player' && <TennisBallIcon />}
            <span className="text-sm font-medium">{p1Label}</span>
            <span className="text-3xl font-bold">{gameState.matchScore.playerGames}</span>
          </div>
          <span className="text-2xl text-white/50">-</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{gameState.matchScore.opponentGames}</span>
            <span className="text-sm font-medium">{p2Label}</span>
            {gameState.server === 'opponent' && <TennisBallIcon />}
          </div>
        </div>

        {/* Row 2: Current game points */}
        <div className="text-center text-sm text-white/80">
          {isDeuce ? (
            <span className="font-bold text-yellow-400">DEUCE</span>
          ) : (
            <span>{pointDisplay.player} - {pointDisplay.opponent}</span>
          )}
        </div>

        {/* Row 3: Timer */}
        <div className="text-center mt-1">
          <span
            className={`text-lg font-mono font-bold ${
              timeRemaining <= 3
                ? 'text-red-400 animate-pulse'
                : 'text-white/70'
            }`}
          >
            {timeRemaining}s
          </span>
        </div>
      </div>

      {/* Tennis Court */}
      <div className="flex-1 px-4 py-2 relative">
        <div className="w-full h-full relative rounded-lg overflow-hidden border-4 border-white/20">
          <TennisCourtHorizontal />

          {/* Tennis Ball */}
          <AnimatePresence>
            {!gameState.matchOver && (
              <motion.div
                key={`${gameState.currentPlayer}-${gameState.isAnimating}`}
                className="absolute z-20"
                style={{
                  left: getBallPosition().left,
                  top: getBallPosition().top,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={
                  gameState.isAnimating
                    ? gameState.currentPlayer === 'opponent'
                      ? { left: '20%', scale: 1 }
                      : { left: '80%', scale: 1 }
                    : { scale: 1 }
                }
                animate={
                  gameState.isAnimating
                    ? gameState.currentPlayer === 'opponent'
                      ? { left: '80%', scale: [1, 1.3, 1] }
                      : { left: '20%', scale: [1, 1.3, 1] }
                    : { scale: [1, 1.1, 1] }
                }
                transition={{
                  duration: gameState.isAnimating ? 0.8 : 1,
                  repeat: gameState.isAnimating ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#FFD700"/>
                  <path d="M 4 8 Q 8 12 4 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M 20 8 Q 16 12 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center text-white py-1 text-sm">
        {gameState.matchOver ? (
          <span className="text-yellow-400 font-bold">{getStatusMessage()}</span>
        ) : gameState.currentPlayer === 'player' || isHuman ? (
          <span>{getStatusMessage()}</span>
        ) : (
          <span className="text-gray-400">{getStatusMessage()}</span>
        )}
      </div>

      {/* Math Problem */}
      <div className="bg-[#1a3a2e] text-white text-center py-2">
        <p className="text-3xl font-bold">{gameState.question}</p>
      </div>

      {/* Answer Display */}
      <div className="bg-[#0f2419] text-center py-3 relative">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold text-white">
            {userAnswer || '_'}
          </span>
          <button
            onClick={() => setUserAnswer('')}
            className={`ml-2 w-10 h-10 rounded-full bg-[#244a35] hover:bg-[#2d5940] flex items-center justify-center transition-opacity ${
              userAnswer ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xl ${
                showFeedback === 'correct' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {showFeedback === 'correct' ? 'Correct!' : 'Wrong!'}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {gameState.matchOver && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex gap-3 justify-center mt-4">
                <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700 text-white px-8 py-2">
                  Play Again
                </Button>
                <Button onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white px-8 py-2">
                  Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keypad */}
      <div className="bg-[#1a3a2e] grid grid-cols-3 border-t-4 border-[#0f2419]">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleKeypadPress(num.toString())}
            disabled={!isCurrentPlayerTurn}
            className="h-14 text-white text-2xl font-bold border border-[#0f2419] hover:bg-[#244a35] active:bg-[#2d5940] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => handleKeypadPress('delete')}
          disabled={!isCurrentPlayerTurn || !userAnswer}
          className="h-14 text-white text-2xl font-bold border border-[#0f2419] hover:bg-[#244a35] active:bg-[#2d5940] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>

        <button
          onClick={() => handleKeypadPress('0')}
          disabled={!isCurrentPlayerTurn}
          className="h-14 text-white text-2xl font-bold border border-[#0f2419] hover:bg-[#244a35] active:bg-[#2d5940] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          0
        </button>

        <button
          onClick={() => handleKeypadPress('enter')}
          disabled={!isCurrentPlayerTurn || !userAnswer}
          className="h-14 text-white text-2xl font-bold border border-[#0f2419] hover:bg-[#244a35] active:bg-[#2d5940] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#FFD700"/>
            <path d="M 4 8 Q 8 12 4 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M 20 8 Q 16 12 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
