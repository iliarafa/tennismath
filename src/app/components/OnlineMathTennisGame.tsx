import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { TennisCourtHorizontal } from './TennisCourtHorizontal';
import type { MatchScore } from '../game/types';
import { formatPointScore } from '../game/scoring';
import type { Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../../shared/protocol';
import { playHitSound } from '../audio/hitSound';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface OnlineMathTennisGameProps {
  socket: TypedSocket;
  playerName: string;
  opponentName: string;
  onBack: () => void;
}

interface OnlineGameState {
  matchScore: MatchScore;
  server: 'player' | 'opponent';
  currentPlayer: 'player' | 'opponent';
  question: string;
  myTurn: boolean;
  ballPosition: 'player' | 'opponent';
  isAnimating: boolean;
  matchOver: boolean;
  winner: 'player' | 'opponent' | null;
  timerSeconds: number;
  opponentDisconnected: boolean;
}

export function OnlineMathTennisGame({
  socket,
  playerName,
  opponentName,
  onBack,
}: OnlineMathTennisGameProps) {
  const [gameState, setGameState] = useState<OnlineGameState>({
    matchScore: {
      playerGames: 0,
      opponentGames: 0,
      currentGame: { player: 0, opponent: 0, advantage: null },
    },
    server: 'player',
    currentPlayer: 'player',
    question: '',
    myTurn: false,
    ballPosition: 'player',
    isAnimating: false,
    matchOver: false,
    winner: null,
    timerSeconds: 10,
    opponentDisconnected: false,
  });

  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(10);

  // --- Socket event handlers ---
  useEffect(() => {
    const onStart = (data: {
      question: string;
      yourTurn: boolean;
      server: 'player' | 'opponent';
      timerSeconds: number;
    }) => {
      setGameState((prev) => ({
        ...prev,
        question: data.question,
        myTurn: data.yourTurn,
        server: data.server,
        currentPlayer: data.yourTurn ? 'player' : 'opponent',
        ballPosition: data.server,
        timerSeconds: data.timerSeconds,
      }));
      setTimeRemaining(data.timerSeconds);
    };

    const onQuestion = (data: {
      question: string;
      yourTurn: boolean;
      timerSeconds: number;
    }) => {
      setGameState((prev) => ({
        ...prev,
        question: data.question,
        myTurn: data.yourTurn,
        currentPlayer: data.yourTurn ? 'player' : 'opponent',
        ballPosition: data.yourTurn ? 'player' : 'opponent',
        isAnimating: false,
        timerSeconds: data.timerSeconds,
      }));
      setTimeRemaining(data.timerSeconds);
      setUserAnswer('');
    };

    const onAnswerResult = (data: { correct: boolean }) => {
      setShowFeedback(data.correct ? 'correct' : 'wrong');
      if (data.correct) {
        // Ball animates to opponent side
        setGameState((prev) => ({ ...prev, isAnimating: true }));
      }
      setTimeout(() => setShowFeedback(null), 500);
    };

    const onOpponentAnswered = (data: { correct: boolean }) => {
      if (data.correct) {
        // Ball animates to our side
        setGameState((prev) => ({ ...prev, isAnimating: true }));
      }
    };

    const onScoreUpdate = (data: {
      matchScore: MatchScore;
      pointScorer: 'player' | 'opponent';
    }) => {
      setGameState((prev) => ({
        ...prev,
        matchScore: data.matchScore,
        isAnimating: false,
      }));
    };

    const onTimerExpired = (data: { who: 'player' | 'opponent' }) => {
      if (data.who === 'player') {
        setShowFeedback('wrong');
        setTimeout(() => setShowFeedback(null), 500);
      }
    };

    const onMatchOver = (data: { winner: 'player' | 'opponent' }) => {
      setGameState((prev) => ({
        ...prev,
        matchOver: true,
        winner: data.winner,
        isAnimating: false,
      }));
    };

    const onOpponentDisconnected = () => {
      setGameState((prev) => ({ ...prev, opponentDisconnected: true }));
    };

    const onOpponentReconnected = () => {
      setGameState((prev) => ({ ...prev, opponentDisconnected: false }));
    };

    socket.on('game:start', onStart);
    socket.on('game:question', onQuestion);
    socket.on('game:answer-result', onAnswerResult);
    socket.on('game:opponent-answered', onOpponentAnswered);
    socket.on('game:score-update', onScoreUpdate);
    socket.on('game:timer-expired', onTimerExpired);
    socket.on('game:match-over', onMatchOver);
    socket.on('connection:opponent-disconnected', onOpponentDisconnected);
    socket.on('connection:opponent-reconnected', onOpponentReconnected);

    return () => {
      socket.off('game:start', onStart);
      socket.off('game:question', onQuestion);
      socket.off('game:answer-result', onAnswerResult);
      socket.off('game:opponent-answered', onOpponentAnswered);
      socket.off('game:score-update', onScoreUpdate);
      socket.off('game:timer-expired', onTimerExpired);
      socket.off('game:match-over', onMatchOver);
      socket.off('connection:opponent-disconnected', onOpponentDisconnected);
      socket.off('connection:opponent-reconnected', onOpponentReconnected);
    };
  }, [socket]);

  // --- Client-side timer display ---
  useEffect(() => {
    if (!gameState.myTurn || gameState.matchOver || gameState.isAnimating || showFeedback !== null) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.myTurn, gameState.matchOver, gameState.isAnimating, showFeedback]);

  // --- Answer handling ---
  const handleAnswer = useCallback(() => {
    if (!userAnswer || !gameState.myTurn || gameState.isAnimating || gameState.matchOver) return;
    playHitSound();
    socket.emit('game:answer', { answer: parseInt(userAnswer) });
    setUserAnswer('');
  }, [userAnswer, gameState.myTurn, gameState.isAnimating, gameState.matchOver, socket]);

  // --- Keypad ---
  const isInputEnabled =
    gameState.myTurn &&
    !gameState.isAnimating &&
    showFeedback === null &&
    !gameState.matchOver;

  const handleKeypadPress = (value: string) => {
    if (!isInputEnabled) return;
    if (value === 'delete') {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else if (value === 'enter') {
      handleAnswer();
    } else {
      setUserAnswer((prev) => prev + value);
    }
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
      return gameState.winner === 'player' ? 'You Win the Match!' : 'Game Over!';
    }
    if (gameState.myTurn) {
      return 'Your turn - solve to hit!';
    }
    return `${opponentName} is thinking...`;
  };

  // --- Score display ---
  const pointDisplay = formatPointScore(gameState.matchScore.currentGame);
  const isDeuce = pointDisplay.player === 'DEUCE';

  const TennisBallIcon = () => (
    <svg className="w-3 h-3 inline-block" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FFD700" />
      <path d="M 4 8 Q 8 12 4 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 20 8 Q 16 12 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#1a3a2e] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Disconnect overlay */}
      {gameState.opponentDisconnected && !gameState.matchOver && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-[#1a3a2e] border border-white/20 rounded-xl p-6 text-center">
            <p className="text-white font-bold text-lg">Opponent Disconnected</p>
            <p className="text-white/50 text-sm mt-2">Waiting for reconnection...</p>
          </div>
        </div>
      )}

      {/* Score Board */}
      <div className="bg-[#1a3a2e] text-white py-2 px-6 relative">
        <button
          onClick={onBack}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Row 1: Current game points */}
        <div className="flex items-center justify-center gap-6 mb-1">
          {isDeuce ? (
            <span className="text-3xl font-bold text-yellow-400">DEUCE</span>
          ) : (
            <>
              <div className="flex items-center gap-2 min-w-[100px] justify-end">
                {gameState.server === 'player' && <TennisBallIcon />}
                <span className="text-sm font-medium">{playerName}</span>
                <span className="text-3xl font-bold">{pointDisplay.player}</span>
              </div>
              <span className="text-3xl font-bold text-white/50">-</span>
              <div className="flex items-center gap-2 min-w-[100px] justify-start">
                <span className="text-3xl font-bold">{pointDisplay.opponent}</span>
                <span className="text-sm font-medium">{opponentName}</span>
                {gameState.server === 'opponent' && <TennisBallIcon />}
              </div>
            </>
          )}
        </div>

        {/* Row 2: Games score */}
        <div className="text-center text-sm font-medium text-white/80">
          <span>Games: {gameState.matchScore.playerGames} - {gameState.matchScore.opponentGames}</span>
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
                  <circle cx="12" cy="12" r="10" fill="#FFD700" />
                  <path d="M 4 8 Q 8 12 4 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 20 8 Q 16 12 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
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
        ) : gameState.myTurn ? (
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
                showFeedback === 'correct' ? 'text-green-600' : 'text-white'
              }`}
            >
              {showFeedback === 'correct' ? 'Correct!' : 'OUT!'}
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
                <Button
                  onClick={onBack}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-2"
                >
                  Back to Lobby
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
            disabled={!isInputEnabled}
            className="h-14 text-white text-2xl font-bold border border-[#0f2419] hover:bg-[#244a35] active:bg-[#2d5940] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => handleKeypadPress('delete')}
          disabled={!isInputEnabled || !userAnswer}
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
          disabled={!isInputEnabled}
          className="h-14 text-white text-2xl font-bold border border-[#0f2419] hover:bg-[#244a35] active:bg-[#2d5940] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          0
        </button>

        <button
          onClick={() => handleKeypadPress('enter')}
          disabled={!isInputEnabled || !userAnswer}
          className="h-14 text-white text-2xl font-bold border border-[#0f2419] hover:bg-[#244a35] active:bg-[#2d5940] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#FFD700" />
            <path d="M 4 8 Q 8 12 4 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 20 8 Q 16 12 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
