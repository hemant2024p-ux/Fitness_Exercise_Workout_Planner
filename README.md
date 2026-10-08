# FitForge — Exercise Library & Workout Planner

A modern fitness app built with **React 19, TypeScript, Redux Toolkit + RTK Query, React Router and Tailwind CSS v4**, powered by the real [ExerciseDB API](https://oss.exercisedb.dev/docs) (1,500+ exercises with animated demos).

## Features

- **Exercise library**: fuzzy search plus **body part**, **target muscle** and **equipment** filters, all combinable. Results are cursor-paginated, with infinite scroll and a "Load more" fallback.
- **Shareable URLs**: filters live in the query string (`/exercises?q=press&bodyPart=chest`), so reload, Back/Forward and sharing all work.
- **Exercise details**: animated GIF, target and secondary muscles, step-by-step instructions, and related exercises (same muscle / same equipment).
- **Favorites**: one-tap save, filterable, works offline (snapshots stored locally).
- **Workout planner**: create plans and schedule them on weekdays. Set sets/reps/weight/rest per exercise, reorder, and quick-add from favorites.
- **Workout logging and stats**: log what you actually did, then see totals, volume, streaks, weekly activity, sets per body part, most-trained exercises and history.
- **Dark / light / system theme**, with no flash on load.
- **Responsive** from 320px phones to wide desktops. **Accessible**: native `<dialog>` modals, labelled controls, keyboard-reachable chart tooltips and a table view for every chart.

## Tech stack

| Concern | Choice |
| --- | --- |
| UI | React 19, TypeScript (strict), Tailwind CSS v4, lucide-react icons |
| Server state | RTK Query: caching, infinite queries, retries, loading/error states |
| Client state | Redux Toolkit slices + entity adapters, memoized selectors |
| Persistence | localStorage via RTK listener middleware (debounced, validated on load) |
| Routing | React Router (data router, lazy route-level code splitting) |
| Tooling | Vite, ESLint (typescript-eslint, react-hooks, react-refresh) |

## Architecture

```
src/
├── app/                 # Store setup, typed hooks, router, persistence
├── services/exerciseDb/ # ALL API logic — UI never touches fetch or DTOs
│   ├── exerciseApi.ts   #   RTK Query endpoints (incl. infinite query)
│   ├── dto.ts           #   Raw API response types
│   ├── transforms.ts    #   DTO → domain mapping, query-param building
│   ├── errors.ts        #   Friendly error messages
│   ├── rateLimiter.ts   #   Client-side request pacing for the free tier
│   └── facetCache.ts    #   7-day cache for static facet lists
├── features/            # Feature modules (slice + selectors + components)
│   ├── exercises/       #   Search, filters, cards, grid, related
│   ├── favorites/
│   ├── workouts/        #   Plans, sessions, planner dialogs
│   ├── stats/           #   Pure, memoized stats selectors
│   ├── theme/
│   └── ui/              #   Toasts + global "add to plan" dialog state
├── components/          # Reusable, feature-agnostic UI
│   ├── ui/              #   Button, Badge, Modal, fields, states…
│   ├── charts/          #   Column chart, bar list, chart card
│   └── layout/          #   Navbar, footer, app shell
├── pages/               # Route components (lazy-loaded)
├── lib/                 # Date + formatting utilities
└── types/               # Domain types shared across features
```

Key decisions:

- **API layer is isolated.** Components only use generated hooks like `useGetExercisesInfiniteQuery(filters)` and receive domain types (`Exercise`). DTO shapes, pagination cursors, retry policy and error mapping all stay in `services/`.
- **The URL is the source of truth for filters.** Each filter combination is its own RTK Query cache entry, so going Back is instant.
- **Snapshots, not references.** Favorites, plans and history store a small `ExerciseSummary`, so they render offline and don't trigger extra API calls.
- **Derived data via selectors.** Stats are computed with `createSelector`, so nothing is duplicated in state.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint
npm run typecheck
npm run preview    # serve the production build
```

> **Note:** if `NODE_ENV=production` is set in your shell, `npm install` skips devDependencies (Vite, TypeScript, ESLint) and the build fails. Use `npm install --include=dev`, or unset `NODE_ENV` first.

### Configuration

No API key is needed. To point at a self-hosted ExerciseDB instance, copy `.env.example` to `.env.local` and set:

```
VITE_EXERCISEDB_BASE_URL=https://your-instance.example.com/api/v1
```

## About the API

This app uses the free tier of ExerciseDB v1 by AscendAPI. It is for **non-commercial use and requires attribution**, which appears in the app footer.

- The free tier **rate-limits bursts** (HTTP 429, ~10s `Retry-After`). Its 429 responses lack CORS headers, so browsers report them as network errors. The app handles this with a client-side request limiter, backoff retries (~1s, 3s, 7s), and a clear error message with a retry button.
- A few exercises reference GIFs missing from the media CDN. These show a "Preview unavailable" placeholder instead of a broken image.

## Data & privacy

All personal data (favorites, plans, workout history, theme) is stored only in your browser's localStorage under `fitforge:state:v1`. There is no backend and no account.
