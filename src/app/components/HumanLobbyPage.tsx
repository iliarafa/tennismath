import { Button } from './ui/button';

interface HumanLobbyPageProps {
  onBack: () => void;
  onStartGame: () => void;
}

export function HumanLobbyPage({ onBack, onStartGame }: HumanLobbyPageProps) {
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
        vs Human
      </h1>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={onStartGame}
          className="w-full py-4 text-xl font-bold rounded-xl bg-white hover:bg-gray-100 text-[#1a3a2e]"
        >
          Start Local Game
        </Button>
      </div>
    </div>
  );
}
