# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Vite dev server with hot reload
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

Single-page React 18 app wrapped with Capacitor for iOS. No routing — the entire game is one screen.

**Core game component**: `src/app/components/MathTennisGame.tsx` contains all game state and logic in a single component using React hooks (`useState` + `useEffect`). The `GameState` interface holds scores, lives, current player, ball position, question/answer, and animation flags.

**Game loop**: Player solves math → ball animates to opponent → AI answers (70% accuracy, 2s delay) → ball returns → repeat. 3 lives each. Fixed timings: 800ms ball travel, 500ms feedback display.

**Tennis court**: SVG-based, rendered by `TennisCourtHorizontal.tsx`. Ball animation uses the `motion` library with `AnimatePresence`.

**UI primitives**: `src/app/components/ui/` has a CVA-based Button and a `cn()` utility (clsx + tailwind-merge).

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
