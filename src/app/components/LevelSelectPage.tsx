import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

type Level = 'amateur' | 'pro' | 'world-class';

interface LevelSelectPageProps {
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

const levels: { id: Level; label: string; className: string }[] = [
  { id: 'amateur', label: 'Amateur', className: 'bg-green-600 hover:bg-green-700 text-white' },
  { id: 'pro', label: 'Pro', className: 'bg-yellow-500 hover:bg-yellow-600 text-[#1a3a2e]' },
  { id: 'world-class', label: 'World Class', className: 'bg-orange-500 hover:bg-orange-600 text-white' },
];

function TennisBall() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FFD700" />
      <path
        d="M 4 8 Q 8 12 4 16"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 20 8 Q 16 12 20 16"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LevelSelectPage({ onSelectLevel, onBack }: LevelSelectPageProps) {
  const [selected, setSelected] = useState<Level | null>(null);

  const handleTap = (level: Level) => {
    setSelected(level);
    setTimeout(() => onSelectLevel(level), 300);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#1a3a2e] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] px-8 gap-12">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 mt-[env(safe-area-inset-top)] text-white p-2"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-5xl font-bold text-white tracking-tight">
        Select Level
      </h1>

      {/* Level Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {levels.map((level) => (
          <div key={level.id} className="relative flex items-center">
            <div className="w-10 flex justify-center shrink-0">
              <AnimatePresence>
                {selected === level.id && (
                  <motion.div
                    layoutId="level-ball"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <TennisBall />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button
              onClick={() => handleTap(level.id)}
              className={`flex-1 py-4 text-xl font-bold rounded-xl ${level.className}`}
            >
              {level.label}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
