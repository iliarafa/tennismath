import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Heart, X, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { TennisCourtHorizontal } from './TennisCourtHorizontal';

type Player = 'player' | 'opponent';

interface GameState {
  currentPlayer: Player;
  playerScore: number;
  opponentScore: number;
  playerLives: number;
  opponentLives: number;
  question: string;
  answer: number;
  ballPosition: 'player' | 'opponent' | 'net';
  isAnimating: boolean;
  gameOver: boolean;
  winner: Player | null;
}

interface MathTennisGameProps {
  mode: 'ai' | 'human';
  onBack: () => void;
}

function generateMathProblem(): { question: string; answer: number } {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1: number, num2: number, answer: number;

  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      break;
    default:
      num1 = 5;
      num2 = 5;
      answer = 10;
  }

  return {
    question: `${num1} ${operation} ${num2}`,
    answer,
  };
}

export function MathTennisGame({ mode, onBack }: MathTennisGameProps) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const problem = generateMathProblem();
    return {
      currentPlayer: 'opponent',
      playerScore: 0,
      opponentScore: 0,
      playerLives: 3,
      opponentLives: 3,
      question: problem.question,
      answer: problem.answer,
      ballPosition: 'opponent',
      isAnimating: false,
      gameOver: false,
      winner: null,
    };
  });

  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);

  const isHuman = mode === 'human';
  const p1Label = isHuman ? 'P1' : 'Pl';
  const p2Label = isHuman ? 'P2' : 'AI';

  // AI auto-turn — only active in AI mode
  useEffect(() => {
    if (mode !== 'ai') return;
    if (gameState.currentPlayer === 'opponent' && !gameState.isAnimating && !gameState.gameOver) {
      const timer = setTimeout(() => {
        handleOpponentTurn();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.isAnimating, gameState.gameOver, mode]);

  const handleOpponentTurn = () => {
    const isCorrect = Math.random() < 0.7;

    if (isCorrect) {
      hitBall('opponent', 'player');
    } else {
      const newPlayerScore = gameState.playerScore + 1;
      const newOpponentLives = gameState.opponentLives - 1;

      if (newOpponentLives <= 0) {
        setGameState(prev => ({
          ...prev,
          playerScore: newPlayerScore,
          opponentLives: 0,
          gameOver: true,
          winner: 'player',
        }));
      } else {
        const problem = generateMathProblem();
        setGameState(prev => ({
          ...prev,
          currentPlayer: 'opponent',
          playerScore: newPlayerScore,
          opponentLives: newOpponentLives,
          question: problem.question,
          answer: problem.answer,
          ballPosition: 'opponent',
        }));
      }
    }
  };

  const hitBall = (from: Player, to: Player) => {
    setGameState(prev => ({ ...prev, isAnimating: true }));

    setTimeout(() => {
      const problem = generateMathProblem();
      setGameState(prev => ({
        ...prev,
        currentPlayer: to,
        ballPosition: to,
        isAnimating: false,
        question: problem.question,
        answer: problem.answer,
      }));
    }, 800);
  };

  const handleAnswer = () => {
    if (!userAnswer || gameState.isAnimating || gameState.gameOver) return;

    const currentPlayer = gameState.currentPlayer;
    const isCorrect = parseInt(userAnswer) === gameState.answer;
    setShowFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setShowFeedback(null);
      setUserAnswer('');

      if (isCorrect) {
        if (currentPlayer === 'player') {
          hitBall('player', 'opponent');
        } else {
          hitBall('opponent', 'player');
        }
      } else {
        // Wrong answer — the other player scores
        if (currentPlayer === 'player') {
          const newOpponentScore = gameState.opponentScore + 1;
          const newPlayerLives = gameState.playerLives - 1;

          if (newPlayerLives <= 0) {
            setGameState(prev => ({
              ...prev,
              opponentScore: newOpponentScore,
              playerLives: 0,
              gameOver: true,
              winner: 'opponent',
            }));
          } else {
            const problem = generateMathProblem();
            setGameState(prev => ({
              ...prev,
              currentPlayer: 'opponent',
              opponentScore: newOpponentScore,
              playerLives: newPlayerLives,
              ballPosition: 'opponent',
              question: problem.question,
              answer: problem.answer,
            }));
          }
        } else {
          // Opponent (P2) got it wrong
          const newPlayerScore = gameState.playerScore + 1;
          const newOpponentLives = gameState.opponentLives - 1;

          if (newOpponentLives <= 0) {
            setGameState(prev => ({
              ...prev,
              playerScore: newPlayerScore,
              opponentLives: 0,
              gameOver: true,
              winner: 'player',
            }));
          } else {
            const problem = generateMathProblem();
            setGameState(prev => ({
              ...prev,
              currentPlayer: 'opponent',
              playerScore: newPlayerScore,
              opponentLives: newOpponentLives,
              question: problem.question,
              answer: problem.answer,
              ballPosition: 'opponent',
            }));
          }
        }
      }
    }, 500);
  };

  // In human mode, both players can use the keypad on their turn
  const isCurrentPlayerTurn = isHuman
    ? !gameState.isAnimating && showFeedback === null && !gameState.gameOver
    : gameState.currentPlayer === 'player' && !gameState.isAnimating && showFeedback === null && !gameState.gameOver;

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

  const resetGame = () => {
    const problem = generateMathProblem();
    setGameState({
      currentPlayer: 'opponent',
      playerScore: 0,
      opponentScore: 0,
      playerLives: 3,
      opponentLives: 3,
      question: problem.question,
      answer: problem.answer,
      ballPosition: 'opponent',
      isAnimating: false,
      gameOver: false,
      winner: null,
    });
    setUserAnswer('');
    setShowFeedback(null);
  };

  const getBallPosition = () => {
    if (gameState.isAnimating) {
      return gameState.currentPlayer === 'player'
        ? { left: '75%', top: '50%' }
        : { left: '25%', top: '50%' };
    }

    if (gameState.ballPosition === 'opponent') {
      return { left: '20%', top: '50%' };
    } else {
      return { left: '80%', top: '50%' };
    }
  };

  const getStatusMessage = () => {
    if (gameState.gameOver) {
      if (isHuman) {
        return gameState.winner === 'player' ? 'P1 Wins!' : 'P2 Wins!';
      }
      return gameState.winner === 'player' ? 'You Win!' : 'Game Over!';
    }
    if (isHuman) {
      return gameState.currentPlayer === 'player'
        ? "Player 1's turn - solve to hit!"
        : "Player 2's turn - solve to hit!";
    }
    return gameState.currentPlayer === 'player'
      ? 'Your turn - solve to hit!'
      : 'Opponent is thinking...';
  };

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

        <div className="flex items-center justify-center gap-8 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{p1Label}</span>
            <span className="text-3xl font-bold">{gameState.playerScore}</span>
          </div>
          <span className="text-2xl">:</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{gameState.opponentScore}</span>
            <span className="text-sm">{p2Label}</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < gameState.playerLives ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < gameState.opponentLives ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tennis Court */}
      <div className="flex-1 px-4 py-2 relative">
        <div className="w-full h-full relative rounded-lg overflow-hidden border-4 border-white/20">
          <TennisCourtHorizontal />

          {/* Tennis Ball */}
          <AnimatePresence>
            {!gameState.gameOver && (
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
        {gameState.gameOver ? (
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
      <div className="bg-[#0f2419] text-center py-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold text-white">
            {userAnswer || '_'}
          </span>
          {userAnswer && (
            <button
              onClick={() => setUserAnswer('')}
              className="ml-2 w-10 h-10 rounded-full bg-[#244a35] hover:bg-[#2d5940] flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 font-bold text-xl ${
              showFeedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {showFeedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
          </motion.div>
        )}
        {gameState.gameOver && (
          <Button onClick={resetGame} className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-2">
            Play Again
          </Button>
        )}
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
