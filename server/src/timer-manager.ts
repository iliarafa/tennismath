type TimerCallback = () => void;

interface RoomTimer {
  timeout: ReturnType<typeof setTimeout>;
  startedAt: number;
  durationMs: number;
}

export class TimerManager {
  private timers = new Map<string, RoomTimer>();

  start(roomCode: string, durationSeconds: number, onExpire: TimerCallback): void {
    this.clear(roomCode);

    const durationMs = durationSeconds * 1000;
    const timeout = setTimeout(() => {
      this.timers.delete(roomCode);
      onExpire();
    }, durationMs);

    this.timers.set(roomCode, {
      timeout,
      startedAt: Date.now(),
      durationMs,
    });
  }

  clear(roomCode: string): void {
    const timer = this.timers.get(roomCode);
    if (timer) {
      clearTimeout(timer.timeout);
      this.timers.delete(roomCode);
    }
  }

  getRemainingSeconds(roomCode: string): number {
    const timer = this.timers.get(roomCode);
    if (!timer) return 0;

    const elapsed = Date.now() - timer.startedAt;
    return Math.max(0, Math.ceil((timer.durationMs - elapsed) / 1000));
  }
}
