# Math Tennis

A mobile math game where you solve arithmetic problems to rally a tennis ball against an AI opponent. Answer correctly to hit the ball back — get it wrong and lose a life. Three lives each, quick rounds.

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS 4
- Framer Motion
- Capacitor (iOS)
- Vite

## Getting Started

```bash
npm install
npm run dev
```

## iOS Build

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Then build and run in Xcode (Cmd+R).

## How It Works

Each turn presents a random math problem (addition, subtraction, or multiplication). The player enters their answer using an on-screen numpad. A correct answer hits the ball to the opponent's side. The AI opponent answers with 70% accuracy. First to deplete the other's three lives wins.
