import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LevelSelectPage } from './components/LevelSelectPage';
import { HumanLobbyPage } from './components/HumanLobbyPage';
import { MathTennisGame } from './components/MathTennisGame';
import { NameEntryPage } from './components/NameEntryPage';
import { OnlineLobbyPage } from './components/OnlineLobbyPage';
import { WaitingRoomPage } from './components/WaitingRoomPage';
import { OnlineMathTennisGame } from './components/OnlineMathTennisGame';
import { useSocket } from './hooks/useSocket';
import type { GameMode, Level } from './game/types';

type Screen =
  | 'landing'
  | 'level-select'
  | 'human-lobby'
  | 'game'
  | 'name-entry'
  | 'online-lobby'
  | 'waiting-room'
  | 'online-game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [mode, setMode] = useState<GameMode>('ai');
  const [level, setLevel] = useState<Level>('amateur');

  // Online state
  const { socket, connected } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [hostName, setHostName] = useState('');
  const [guestName, setGuestName] = useState<string | null>(null);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  // --- Socket event listeners for room management ---
  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = (data: { roomCode: string }) => {
      setRoomCode(data.roomCode);
      setIsHost(true);
      setHostName(playerName);
      setGuestName(null);
      setSelectedLevel(null);
      setScreen('waiting-room');
    };

    const onRoomJoined = (data: {
      roomCode: string;
      hostName: string;
      guestName: string;
    }) => {
      setRoomCode(data.roomCode);
      setIsHost(false);
      setHostName(data.hostName);
      setGuestName(data.guestName);
      setSelectedLevel(null);
      setScreen('waiting-room');
    };

    const onOpponentJoined = (data: { opponentName: string }) => {
      setGuestName(data.opponentName);
    };

    const onOpponentLeft = () => {
      setGuestName(null);
      setSelectedLevel(null);
      // If we're in-game, go back to waiting room
      if (screen === 'online-game') {
        setScreen('waiting-room');
      }
    };

    const onRoomError = (data: { message: string }) => {
      setOnlineError(data.message);
    };

    const onLevelSelected = (data: { level: Level }) => {
      setSelectedLevel(data.level);
    };

    const onGameStart = () => {
      setScreen('online-game');
    };

    socket.on('room:created', onRoomCreated);
    socket.on('room:joined', onRoomJoined);
    socket.on('room:opponent-joined', onOpponentJoined);
    socket.on('room:opponent-left', onOpponentLeft);
    socket.on('room:error', onRoomError);
    socket.on('game:level-selected', onLevelSelected);
    socket.on('game:start', onGameStart);

    return () => {
      socket.off('room:created', onRoomCreated);
      socket.off('room:joined', onRoomJoined);
      socket.off('room:opponent-joined', onOpponentJoined);
      socket.off('room:opponent-left', onOpponentLeft);
      socket.off('room:error', onRoomError);
      socket.off('game:level-selected', onLevelSelected);
      socket.off('game:start', onGameStart);
    };
  }, [socket, playerName, screen]);

  const handleSelectMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    if (selectedMode === 'online') {
      setScreen('name-entry');
    } else if (selectedMode === 'human') {
      setScreen('human-lobby');
    } else {
      setScreen('level-select');
    }
  };

  const handleSelectLevel = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    setScreen('game');
  };

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setOnlineError(null);
    setScreen('online-lobby');
  };

  const handleCreateRoom = () => {
    if (!socket || !connected) return;
    setOnlineError(null);
    socket.emit('room:create', { playerName });
  };

  const handleJoinRoom = (code: string) => {
    if (!socket || !connected) return;
    setOnlineError(null);
    socket.emit('room:join', { roomCode: code, playerName });
  };

  const handleOnlineLevelSelect = (level: Level) => {
    if (!socket) return;
    setSelectedLevel(level);
    socket.emit('game:select-level', { level });
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('room:leave');
    }
    setRoomCode('');
    setGuestName(null);
    setSelectedLevel(null);
    setScreen('online-lobby');
  };

  const handleBack = () => {
    switch (screen) {
      case 'game':
        setScreen('level-select');
        break;
      case 'level-select':
        setScreen(mode === 'human' ? 'human-lobby' : 'landing');
        break;
      case 'human-lobby':
        setScreen('landing');
        break;
      case 'name-entry':
        setScreen('landing');
        break;
      case 'online-lobby':
        setScreen('landing');
        break;
      case 'waiting-room':
        handleLeaveRoom();
        break;
      case 'online-game':
        handleLeaveRoom();
        break;
      default:
        setScreen('landing');
    }
  };

  return (
    <div className="size-full bg-[#1a3a2e] flex items-center justify-center">
      <div className="w-full h-full relative">
        {screen === 'landing' && (
          <LandingPage onSelectMode={handleSelectMode} />
        )}
        {screen === 'level-select' && (
          <LevelSelectPage
            onSelectLevel={handleSelectLevel}
            onBack={handleBack}
          />
        )}
        {screen === 'human-lobby' && (
          <HumanLobbyPage
            onBack={handleBack}
            onStartGame={() => setScreen('level-select')}
          />
        )}
        {screen === 'game' && (
          <MathTennisGame mode={mode} level={level} onBack={handleBack} />
        )}
        {screen === 'name-entry' && (
          <NameEntryPage onSubmit={handleNameSubmit} onBack={handleBack} />
        )}
        {screen === 'online-lobby' && (
          <OnlineLobbyPage
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onBack={handleBack}
            error={onlineError}
          />
        )}
        {screen === 'waiting-room' && (
          <WaitingRoomPage
            roomCode={roomCode}
            hostName={hostName}
            guestName={guestName}
            isHost={isHost}
            selectedLevel={selectedLevel}
            onSelectLevel={handleOnlineLevelSelect}
            onBack={handleBack}
          />
        )}
        {screen === 'online-game' && socket && (
          <OnlineMathTennisGame
            socket={socket}
            playerName={playerName}
            opponentName={isHost ? (guestName ?? '') : hostName}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
