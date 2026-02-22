import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LevelSelectPage } from './components/LevelSelectPage';
import { HumanLobbyPage } from './components/HumanLobbyPage';
import { MathTennisGame } from './components/MathTennisGame';
import type { GameMode, Level } from './game/types';

type Screen = 'landing' | 'level-select' | 'human-lobby' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [mode, setMode] = useState<GameMode>('ai');
  const [level, setLevel] = useState<Level>('amateur');

  const handleSelectMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScreen('level-select');
  };

  const handleSelectLevel = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    if (mode === 'ai') {
      setScreen('game');
    } else {
      setScreen('human-lobby');
    }
  };

  const handleBack = () => {
    switch (screen) {
      case 'game':
        setScreen('level-select');
        break;
      case 'human-lobby':
        setScreen('level-select');
        break;
      case 'level-select':
        setScreen('landing');
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
            onStartGame={() => setScreen('game')}
          />
        )}
        {screen === 'game' && (
          <MathTennisGame mode={mode} level={level} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
