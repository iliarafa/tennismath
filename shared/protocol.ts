import type { Level, MatchScore } from './types';

// Client → Server events
export interface ClientToServerEvents {
  'room:create': (data: { playerName: string }) => void;
  'room:join': (data: { roomCode: string; playerName: string }) => void;
  'room:leave': () => void;
  'game:select-level': (data: { level: Level }) => void;
  'game:answer': (data: { answer: number }) => void;
}

// Server → Client events
export interface ServerToClientEvents {
  'room:created': (data: { roomCode: string }) => void;
  'room:joined': (data: {
    roomCode: string;
    hostName: string;
    guestName: string;
  }) => void;
  'room:opponent-joined': (data: { opponentName: string }) => void;
  'room:opponent-left': () => void;
  'room:error': (data: { message: string }) => void;
  'game:level-selected': (data: { level: Level }) => void;
  'game:start': (data: {
    question: string;
    yourTurn: boolean;
    server: 'player' | 'opponent';
    timerSeconds: number;
  }) => void;
  'game:question': (data: {
    question: string;
    yourTurn: boolean;
    timerSeconds: number;
  }) => void;
  'game:answer-result': (data: { correct: boolean }) => void;
  'game:opponent-answered': (data: { correct: boolean }) => void;
  'game:score-update': (data: {
    matchScore: MatchScore;
    pointScorer: 'player' | 'opponent';
  }) => void;
  'game:timer-expired': (data: { who: 'player' | 'opponent' }) => void;
  'game:match-over': (data: { winner: 'player' | 'opponent' }) => void;
  'connection:opponent-disconnected': () => void;
  'connection:opponent-reconnected': () => void;
}
