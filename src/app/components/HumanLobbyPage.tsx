import { Button } from './ui/button';

interface HumanLobbyPageProps {
  onBack: () => void;
}

export function HumanLobbyPage({ onBack }: HumanLobbyPageProps) {
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
          className="w-full py-4 text-xl font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white"
        >
          Create Room
        </Button>
        <Button
          className="w-full py-4 text-xl font-bold rounded-xl bg-yellow-500 hover:bg-yellow-600 text-[#1a3a2e]"
        >
          Join Game
        </Button>
      </div>
    </div>
  );
}
