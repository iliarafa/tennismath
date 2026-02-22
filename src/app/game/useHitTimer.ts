import { useState, useEffect, useCallback, useRef } from 'react';

interface UseHitTimerOptions {
  initialSeconds: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function useHitTimer({ initialSeconds, onTimeUp, isActive }: UseHitTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const resetTimer = useCallback(() => {
    setTimeRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Defer to avoid state update during render
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Reset timer when isActive transitions to true
  useEffect(() => {
    if (isActive) {
      setTimeRemaining(initialSeconds);
    }
  }, [isActive, initialSeconds]);

  return { timeRemaining, resetTimer };
}
