# Tennis Math

A mobile math game where you solve arithmetic problems to rally a tennis ball. Answer correctly to hit the ball back — get it wrong or run out of time and you lose the point. Real tennis scoring, three difficulty levels, play against AI or a friend on the same device.

## Game Modes

- **vs AI** — Solo play against a computer opponent with configurable difficulty
- **vs Human** — Local 2-player on the same device, taking turns at the keypad
- **Online** — Real-time 1v1 multiplayer. One player creates a room and shares a 6-character code, the other joins. Server-authoritative — no cheating.

## Difficulty Levels

| Level | Numbers | Timer | AI Accuracy |
|-------|---------|-------|-------------|
| Amateur | 1–10 | 15s | 50% |
| Pro | 1–25 | 10s | 70% |
| World Class | 1–50 | 7s | 90% |

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS 4
- Motion (animation)
- Capacitor (iOS)
- Vite
- Node.js + Socket.IO (multiplayer server)

## Getting Started

```bash
npm install
npm run dev          # client only (vs AI / vs Human)
npm run dev:all      # client + multiplayer server
```

## iOS Build

```bash
npm run build && npx cap sync ios
npx cap open ios
```

Then build and run in Xcode (Cmd+R).

## How It Works

Each turn presents a random math problem (addition, subtraction, or multiplication). The player enters their answer using an on-screen keypad. A correct answer hits the ball to the opponent's side. An incorrect answer or timeout loses the point. Scoring follows real tennis rules (love, 15, 30, 40, deuce, advantage). First to win 3 games takes the match.
