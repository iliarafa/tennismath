import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface OnlineLobbyPageProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
  error: string | null;
}

export function OnlineLobbyPage({
  onCreateRoom,
  onJoinRoom,
  onBack,
  error,
}: OnlineLobbyPageProps) {
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = () => {
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length === 6) {
      onJoinRoom(trimmed);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#1a3a2e] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] px-8 gap-8">
      <button
        onClick={onBack}
        className="absolute left-4 top-4 mt-[env(safe-area-inset-top)] w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h2 className="text-3xl font-bold text-white">Online Match</h2>

      {error && (
        <div className="w-full max-w-xs text-center text-red-400 font-medium bg-red-400/10 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <Button
        onClick={onCreateRoom}
        className="w-full max-w-xs py-4 text-xl font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl"
      >
        Create Room
      </Button>

      <div className="w-full max-w-xs flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/50 text-sm">or</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="Enter room code"
          maxLength={6}
          className="w-full text-center text-2xl font-bold tracking-[0.3em] bg-[#0f2419] text-white border-2 border-white/20 rounded-xl px-4 py-3 placeholder-white/30 focus:border-yellow-400 focus:outline-none uppercase"
        />
        <Button
          onClick={handleJoin}
          disabled={joinCode.trim().length !== 6}
          className="w-full py-4 text-xl font-bold bg-yellow-500 hover:bg-yellow-600 text-[#1a3a2e] rounded-xl disabled:opacity-40"
        >
          Join Room
        </Button>
      </div>
    </div>
  );
}
