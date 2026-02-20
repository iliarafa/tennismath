import { motion } from 'motion/react';
import { Button } from './ui/button';

interface LandingPageProps {
  onSelectMode: (mode: 'ai' | 'human') => void;
}

export function LandingPage({ onSelectMode }: LandingPageProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#1a3a2e] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] px-8 gap-12">
      {/* Animated Tennis Ball */}
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
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

      {/* Mode Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={() => onSelectMode('ai')}
          className="w-full py-4 text-xl font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl"
        >
          vs AI
        </Button>
        <Button
          onClick={() => onSelectMode('human')}
          className="w-full py-4 text-xl font-bold bg-yellow-500 hover:bg-yellow-600 text-[#1a3a2e] rounded-xl"
        >
          vs Human
        </Button>
      </div>
    </div>
  );
}
