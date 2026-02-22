# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Vite dev server with hot reload
npm run dev:server   # Start Socket.IO server only (port 3001)
npm run dev:all      # Run both client and server via concurrently
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

### iOS Build & Deploy

```bash
npm run build && npx cap sync ios   # Build web + sync to iOS project
npx cap open ios                     # Open in Xcode
```

Build and run in Xcode with Cmd+R. The Capacitor config lives in `capacitor.config.ts` (appId: `com.tennismath.app`, webDir: `dist`).

## Architecture

Single-page React 18 app wrapped with Capacitor for iOS. No routing library — screen navigation is managed via a `screen` state in `src/app/App.tsx`.

**Screens & navigation** (`src/app/App.tsx`):
- `landing` — Mode selection (vs AI / vs Human / Online)
- `level-select` — Difficulty picker (Amateur / Pro / World Class)
- `human-lobby` — Pre-game lobby for local 2-player
- `game` — The local match itself
- `name-entry` — Display name input for online play
- `online-lobby` — Create room or join with 6-char code
- `waiting-room` — Wait for opponent, host picks level
- `online-game` — Socket-driven online match

Flow: **vs AI**: Landing → Level Select → Game. **vs Human**: Landing → Human Lobby → Level Select → Game. **Online**: Landing → Name Entry → Online Lobby → Waiting Room → Online Game. Back button reverses each flow.

**Core game components**:
- `MathTennisGame.tsx` — Local game (vs AI / vs Human). All game state and logic in a single component using React hooks. Accepts `mode` (ai/human), `level`, and `onBack` props.
- `OnlineMathTennisGame.tsx` — Online game. Same court/keypad layout but state is driven by Socket.IO events from the server. Accepts `socket`, `playerName`, `opponentName`, and `onBack` props.

**Game loop**: Player solves math → ball animates to opponent → opponent answers (AI auto-answers; human uses same keypad) → ball returns → repeat. Tennis scoring (love/15/30/40/deuce/advantage), first to win 3 games takes the match.

**Shared game logic** (`shared/`): Types, scoring, math generation, and level configs live in `shared/` so both client and server import the same code. Client files in `src/app/game/` re-export from `shared/`.

**Levels** (`shared/levels.ts`): Three difficulty tiers control number ranges, timer duration, AI accuracy, and AI delay. Timer counts down each turn; running out loses the point.

**Scoring** (`shared/scoring.ts`): Real tennis scoring with deuce/advantage. `GAMES_TO_WIN = 3`. Server alternates each game.

**Tennis court**: SVG-based, rendered by `TennisCourtHorizontal.tsx`. Ball animation uses the `motion` library with `AnimatePresence`.

**UI primitives**: `src/app/components/ui/` has a CVA-based Button and a `cn()` utility (clsx + tailwind-merge).

## Online Multiplayer

**Server** (`server/`): Node.js + Socket.IO server (port 3001). Server-authoritative — generates math problems, validates answers, manages timers, and runs all scoring logic. Clients send answers and receive state updates.

- `server/src/index.ts` — HTTP server + Socket.IO setup, event wiring
- `server/src/room-manager.ts` — Room create/join/leave, 6-char codes (no ambiguous chars like O/0/I/1), 30s reconnection window on disconnect
- `server/src/game-engine.ts` — Server-side game loop: problems, answer validation, scoring, turn management
- `server/src/timer-manager.ts` — Per-room countdown timers

**Protocol** (`shared/protocol.ts`): Typed Socket.IO event contract. Each client receives scores from their own perspective (the server flips the MatchScore for the guest).

**Client socket hook** (`src/app/hooks/useSocket.ts`): Connects to `VITE_SERVER_URL` env var (defaults to `http://localhost:3001`).

**Room system**: 6-character uppercase alphanumeric codes. One player creates, shares the code, the other joins. Host picks difficulty to start the match. Rooms auto-clean when both players leave or the match ends.

## Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — config is in `src/styles/tailwind.css`, not a separate config file
- **Design tokens**: CSS custom properties in `src/styles/theme.css` (OKLCH color space)
- **Game colors**: Dark green background `#1a3a2e`, court green `#3A8B4F`, gold ball `#FFD700`
- **Path alias**: `@/` maps to `./src/`

## iOS-Specific Considerations

- `index.html` uses `viewport-fit=cover` and `100dvh` for edge-to-edge rendering
- Body background is `#1a3a2e` to match safe area insets with the app theme
- Safe area padding is applied on the game container via `pt-[env(safe-area-inset-top)]` and `pb-[env(safe-area-inset-bottom)]`
- Layout is intentionally compact (smaller text sizes, reduced padding) to fit all content including 4 keypad rows on iOS screens without scrolling
