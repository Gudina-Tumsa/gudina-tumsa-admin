# Gudina Tumsa Digital Library — Admin

Next.js 15 (App Router) + React 19 admin panel for the Gudina Tumsa digital library backend. Manages books, audio books, categories, events, users, and roles.

## Stack

- Next.js 15 / React 19, TypeScript (strict), Tailwind CSS 4
- shadcn/ui ("new-york" style) components in `src/components/ui`, Radix UI primitives, lucide-react icons
- Redux Toolkit + redux-persist for client state (`src/app/store`)
- `@tanstack/react-table` for data tables, `@dnd-kit/*` for drag-and-drop
- react-hot-toast / sonner for notifications, zod for schemas, recharts for charts

## Commands

```bash
npm run dev     # start dev server (localhost:3000)
npm run build
npm run start
npm run lint
```

No test runner is configured (`test/` currently just holds scratch files, not a test suite).

## Architecture

- `src/app/<feature>/` — one route per feature (`books`, `audio_book`, `category`, `events`, `roles`, `users`, `home`). Each typically has `page.tsx` + `data-table.tsx`.
- `src/app/store/` — Redux store (`store.ts`) + `features/` slices (e.g. `userSlice.ts`). Persisted via redux-persist to `localStorage`.
- `src/lib/api/` — one file per resource (`book.ts`, `category.ts`, `events.ts`, `roles.ts`, `user.ts`, `auth.ts`). Plain `fetch` wrappers against the backend, no shared HTTP client — each function builds its own request and throws on non-OK responses.
- `src/types/` — shared TypeScript types/interfaces per resource.
- `src/components/ui/` — shadcn/ui primitives (don't hand-edit generated look; regenerate via shadcn CLI if adding new primitives, matching `components.json` config: style "new-york", baseColor "stone").
- Path alias `@/*` → `src/*`.

## Backend API

- Base URL comes from `NEXT_PUBLIC_BASE_URL` in `next.config.ts` (currently pointed at `http://localhost:3002` locally; production is `https://api.gudinatumsa.com`).
- Auth: `POST /api/users/login` issues a Bearer token; send as `Authorization: Bearer <token>`.
- Error shape: `{ "status": "fail", "message": "..." }` with HTTP status indicating the error kind (400/401/402/403/404/409/502).
- See `MARKETPLACE_INTEGRATION.md` for the full book-purchase/marketplace API contract (sales, payment gateways CHAPA/TELEBIRR/STARPAY/CASH/BANK_TRANSFER, content-gating on `payable` books via `fileUrl`/`audioSummarizationUrl` being null until purchased).

## Conventions / gotchas

- Many files under `src/lib/api/` and `src/app/store/` start with `/* eslint-disable */` and `// @ts-nocheck` — this is existing practice, not something to silently "fix"; don't remove those pragmas as a drive-by change.
- `src/lib/api/book.ts` has a bug: `getBooks` reads `request.category` but `GetBooksRequest` declares `categories?: string[]` — be aware if touching book search/filtering.
- API functions do NOT attach `Authorization` headers in most `src/lib/api/*.ts` files — check each function before assuming auth is wired up when extending marketplace/purchase features.