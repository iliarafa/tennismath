import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

import type { Level } from '../game/types';

interface LevelSelectPageProps {
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

const levels: { id: Level; label: string; className: string }[] = [
  { id: 'amateur', label: 'Amateur', className: 'bg-[#2d5940] hover:bg-[#3a6b50] text-white' },
  { id: 'pro', label: 'Pro', className: 'bg-[#3A8B4F] hover:bg-[#449959] text-white' },
  { id: 'world-class', label: 'World Class', className: 'bg-[#4CAF50] hover:bg-[#5CB860] text-white' },
  { id: 'elite', label: 'Elite', className: 'bg-[#66BB6A] hover:bg-[#76C47A] text-[#1a3a2e]' },
  { id: 'legend', label: 'Legend', className: 'bg-[#FFD700] hover:bg-[#FFE033] text-[#1a3a2e]' },
];

function TennisBall({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
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

  const handleSelect = (level: Level) => {
    setSelected(level);
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

      {/* Title + Level Buttons */}
      <div className="flex flex-col items-center gap-12 w-full max-w-xs">
        <h1 className="text-5xl font-bold text-white tracking-tight">
          Select Level
        </h1>

        <div className="flex flex-col gap-4 w-full">
        {levels.map((level) => (
          <Button
            key={level.id}
            onClick={() => handleSelect(level.id)}
            className={`relative w-full py-3 text-xl font-bold rounded-xl ${level.className}`}
          >
            <AnimatePresence>
              {selected === level.id && (
                <motion.span
                  layoutId="level-ball"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <TennisBall />
                </motion.span>
              )}
            </AnimatePresence>
            {level.label}
          </Button>
        ))}
        </div>

        <motion.div
          animate={{ opacity: selected ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`flex justify-center ${selected ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <button
            onClick={() => selected && onSelectLevel(selected)}
            className="focus:outline-none active:scale-90 transition-transform"
          >
            <TennisBall className="w-14 h-14" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
