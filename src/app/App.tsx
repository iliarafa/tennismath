import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { MathTennisGame } from './components/MathTennisGame';

type Screen = 'landing' | 'game';
type GameMode = 'ai' | 'human';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [mode, setMode] = useState<GameMode>('ai');

  const handleSelectMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScreen('game');
  };

  const handleBack = () => {
    setScreen('landing');
  };

  return (
    <div className="size-full bg-[#1a3a2e] flex items-center justify-center">
      <div className="w-full h-full relative">
        {screen === 'landing' ? (
          <LandingPage onSelectMode={handleSelectMode} />
        ) : (
          <MathTennisGame mode={mode} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
