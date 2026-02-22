import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import type { Level } from '../game/types';

interface WaitingRoomPageProps {
  roomCode: string;
  hostName: string;
  guestName: string | null;
  isHost: boolean;
  selectedLevel: Level | null;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

const LEVELS: { value: Level; label: string }[] = [
  { value: 'amateur', label: 'Amateur' },
  { value: 'pro', label: 'Pro' },
  { value: 'world-class', label: 'World Class' },
];

export function WaitingRoomPage({
  roomCode,
  hostName,
  guestName,
  isHost,
  selectedLevel,
  onSelectLevel,
  onBack,
}: WaitingRoomPageProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#1a3a2e] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] px-8 gap-6">
      <button
        onClick={onBack}
        className="absolute left-4 top-4 mt-[env(safe-area-inset-top)] w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-bold text-white">Waiting Room</h2>

      {/* Room Code */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-white/50 text-sm">Room Code</span>
        <span className="text-4xl font-bold text-yellow-400 tracking-[0.3em]">
          {roomCode}
        </span>
        <span className="text-white/40 text-xs">Share this code with your opponent</span>
      </div>

      {/* Players */}
      <div className="w-full max-w-xs flex flex-col gap-3 bg-[#0f2419] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">{hostName}</span>
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
            Host
          </span>
        </div>
        <div className="h-px bg-white/10" />
        {guestName ? (
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{guestName}</span>
            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
              Guest
            </span>
          </div>
        ) : (
          <div className="text-white/30 text-center py-2">
            Waiting for opponent...
          </div>
        )}
      </div>

      {/* Level Selection (host only, when guest has joined) */}
      {isHost && guestName && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <span className="text-white/70 text-sm text-center">Pick difficulty</span>
          <div className="flex flex-col gap-2">
            {LEVELS.map(({ value, label }) => (
              <Button
                key={value}
                onClick={() => onSelectLevel(value)}
                className={`w-full py-3 text-lg font-bold rounded-xl ${
                  selectedLevel === value
                    ? 'bg-yellow-500 text-[#1a3a2e]'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Guest waiting for host to pick level */}
      {!isHost && !selectedLevel && (
        <div className="text-white/50 text-sm text-center">
          Waiting for host to pick difficulty...
        </div>
      )}

      {!isHost && selectedLevel && (
        <div className="text-white/50 text-sm text-center">
          Starting match...
        </div>
      )}

      {isHost && !guestName && (
        <div className="text-white/40 text-sm text-center animate-pulse">
          Waiting for opponent to join...
        </div>
      )}
    </div>
  );
}
