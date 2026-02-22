import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface NameEntryPageProps {
  onSubmit: (name: string) => void;
  onBack: () => void;
}

export function NameEntryPage({ onSubmit, onBack }: NameEntryPageProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length >= 1) {
      onSubmit(trimmed);
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

      <h2 className="text-3xl font-bold text-white">Enter Your Name</h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Your display name"
        maxLength={16}
        autoFocus
        className="w-full max-w-xs text-center text-2xl font-bold bg-[#0f2419] text-white border-2 border-white/20 rounded-xl px-4 py-3 placeholder-white/30 focus:border-yellow-400 focus:outline-none"
      />

      <Button
        onClick={handleSubmit}
        disabled={name.trim().length < 1}
        className="w-full max-w-xs py-4 text-xl font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-40"
      >
        Continue
      </Button>
    </div>
  );
}
