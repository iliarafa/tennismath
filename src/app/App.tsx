import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LevelSelectPage } from './components/LevelSelectPage';
import { MathTennisGame } from './components/MathTennisGame';

type Screen = 'landing' | 'level-select' | 'game';
type GameMode = 'ai' | 'human';
type Level = 'amateur' | 'pro' | 'world-class';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [mode, setMode] = useState<GameMode>('ai');
  const [level, setLevel] = useState<Level>('amateur');

  const handleSelectMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    if (selectedMode === 'ai') {
      setScreen('level-select');
    } else {
      setScreen('game');
    }
  };

  const handleSelectLevel = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    setScreen('game');
  };

  const handleBack = () => {
    setScreen('landing');
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
        {screen === 'game' && (
          <MathTennisGame mode={mode} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
