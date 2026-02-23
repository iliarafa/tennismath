import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import type { GameMode } from '../game/types';

interface LandingPageProps {
  onSelectMode: (mode: GameMode) => void;
}

const modes: { id: GameMode; label: string; className: string }[] = [
  { id: 'ai', label: 'vs AI', className: 'bg-[#2d5940] hover:bg-[#3a6b50] text-white' },
  { id: 'human', label: 'vs Human', className: 'bg-[#3A8B4F] hover:bg-[#449959] text-white' },
  { id: 'online', label: 'Online', className: 'bg-[#4CAF50] hover:bg-[#5CB860] text-white' },
];

export function LandingPage({ onSelectMode }: LandingPageProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="h-full w-full relative overflow-hidden bg-[#1a3a2e] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Layer 2 — Mode buttons (sits behind, revealed when layer 1 slides up) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 gap-10 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Back button */}
        <button
          onClick={() => setExpanded(false)}
          className="absolute top-4 left-4 mt-[env(safe-area-inset-top)] text-white p-2"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Select Mode
        </h1>

        {/* Mode buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {modes.map((mode) => (
            <Button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`w-full py-3 text-xl font-bold rounded-xl ${mode.className}`}
            >
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Layer 1 — Landing page (ball + title + hint), slides up to reveal mode buttons */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-8 gap-12 bg-[#1a3a2e] z-10 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        animate={{ y: expanded ? '-100%' : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Tappable bouncing ball */}
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => setExpanded(true)}
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer"
        >
          <svg className="w-28 h-28" viewBox="0 0 24 24" fill="none">
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
        </motion.div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white tracking-tight">
          Tennis Math
        </h1>

        {/* Tap hint */}
        <motion.p
          className="text-white/60 text-lg"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Tap the ball to play
        </motion.p>
      </motion.div>
    </div>
  );
}
