# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Placeholder "Coming Soon" site + a schedule-only admin dashboard for the ExcuseMeImJack channel, built on the `fullstack-template-v1` stack (Bun, Hono, Drizzle, React/Vite). Deployed as a single Vercel project at `excusemeimjack.com`.

Scope is intentionally narrow: only two screens exist today — the public Coming Soon page and a password-gated dashboard that edits just the weekly schedule. The rest of the full site (Home, Content, Community, etc.) is a later, separate build. The template's generic records/branding/uploads/users infrastructure is already wired up server-side for when that work starts, but has no frontend UI yet — don't build UI for it speculatively.

## Commands

This is a Bun-only monorepo with **separate install contexts** per directory (root, `apps/server`, `apps/web`, `packages/schema` each have their own `node_modules` — there is no hoisting/workspaces). After changing dependencies in any one of them, install there specifically, e.g. `cd apps/server && bun install`.

```bash
# Full local setup (run once)
bun install
cd packages/schema && bun install
cd ../../apps/server && bun install
cd ../web && bun install
cd ../..
cp .env.example .env   # fill in DATABASE_URL, ADMIN_KEY, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID

# Run migrations against whatever Postgres DATABASE_URL points to
cd apps/server && bunx drizzle-kit migrate && cd ../..

# Start everything (API on :3001, web on :5173)
bun run dev

# Typecheck / build the whole workspace
bun run typecheck
bun run build
```

Per-package commands (typecheck/build one piece only):
```bash
bun run --cwd packages/schema typecheck
bun run --cwd apps/server typecheck
bun run --cwd apps/web typecheck
```

Server-only (from `apps/server`):
```bash
bun run dev              # bun --watch src/index.ts
bunx drizzle-kit generate --name <name>   # after editing db/schema.ts
bunx drizzle-kit migrate
bunx drizzle-kit studio
bun run db:seed          # only relevant if AUTH_MODE=better-auth
```

There is no test suite in this repo currently — verification is `bun run typecheck`, `bun run build`, and manually exercising `bun run dev` in a browser.

## Architecture

### Monorepo shape
```
apps/server/   Bun + Hono API — Postgres via Drizzle, admin-key/better-auth, Cloudinary/local uploads
apps/web/      React 19 + Vite — public site + dashboard, React Router, TanStack Query, Zustand
packages/schema/  Shared Zod schemas — the single source of truth for API request/response shapes
api/           Vercel deployment entrypoint — see "Deployment" below, this is NOT a normal source file
```

`packages/schema/src/index.ts` is the contract between server and web: add/change a Zod schema there first, then update the server route and the frontend call site to match. Server route handlers parse with `SomeSchema.safeParse`, return via `ok(c, data)` / `fail(c, message, status, { code })` from `apps/server/src/http/response.ts` (`{ success, data, meta }` / `{ success, error, code, meta }` envelope), and `apps/web/src/shared/api.ts`'s `apiJson` helper unwraps `data` automatically on the client.

### Server (`apps/server/src`)
- `index.ts` registers all routes on one Hono app; auth (`auth.ts`), rate limiting, security headers, and CORS are applied here.
- `env.ts` is the only place that reads `process.env` — always add new config there, never inline `process.env.X` elsewhere. It's loaded via `loadEnv.ts`, which reads the single root `.env` file (not per-package `.env` files).
- Two admin auth modes controlled by `AUTH_MODE`: `admin-key` (single shared secret, `X-Admin-Key` header, `middleware/admin.ts`) — what this project actually uses — or `better-auth` (real accounts). **`auth.ts` initializes Better Auth unconditionally regardless of `AUTH_MODE`** (other code paths reference it), but the construction is wrapped in try/catch and exported as possibly `null` (`auth`, `authInitError`) — every real `auth.api.*`/`auth.handler` call site is guarded with `|| !auth` so a failed Better Auth init degrades to a 503 on those specific routes instead of crashing the whole app. Keep that pattern if you touch `auth.ts`.
- `routes/schedule.ts` is the one genuinely dynamic piece of public content. `schedule_entries` stores `dayOfWeek` + `time`/`type`/`title`/`thumbnailUrl`/`uploadId` but **no calendar date** — the public page computes each entry's next occurrence client-side from `dayOfWeek` (see `nextOccurrence` in `PublicSite.tsx`), matching the admin copy "the site countdown updates automatically." One entry per day is enforced with a unique constraint + a 409 on conflict.
- Uploads (`storage/uploadStorage.ts`) support `local` (dev) or `cloudinary` (prod, required — Vercel Functions have a read-only filesystem) storage drivers via `STORAGE_DRIVER`. Schedule entries track `uploadId` so deleting or replacing a thumbnail cascades to delete the underlying `uploads` row *and* the actual Cloudinary/local asset (`routes/schedule.ts`'s `deleteUploadById`) — don't let entries reference orphaned uploads.
- `uploads/thumbnail.ts` uses `sharp` (native binary) for local-storage thumbnails only. It's imported **dynamically** (`await import(...)`) inside `uploadStorage.ts`, not statically — sharp is never touched at all when `STORAGE_DRIVER=cloudinary`, which is deliberate (see Deployment gotchas).
- Drizzle migrations: `db/migrations/meta/` is missing snapshot JSON files for migrations 0000–0005 (an upstream template gap, not something to "fix" retroactively). This means `drizzle-kit generate` only diffs correctly against the latest present snapshot — after generating a new migration, always read the generated `.sql` file and confirm it contains only the intended incremental change (`CREATE TABLE`/`ALTER TABLE` for what you actually added), not a `CREATE TABLE` for every existing table. Trim it by hand if it over-generates.

### Web (`apps/web/src`)
- `routes/App.tsx` is the shell for all routes. It renders shared chrome (topbar, theme switcher) for generic pages, but both `/` (Coming Soon) and `/dashboard` opt out of it entirely (`hideChrome`) and render their own full-bleed layouts — they are not built on the template's generic `frontend-template-grid`/aside/footer pattern described in `docs/page-setup-grid-layout.md`. That doc's pattern is what *future* full-site pages should use.
- `routes/PublicSite.tsx` and `routes/Dashboard.tsx` are almost entirely bespoke to this design (dark "Ranger Station"/"Operations Center" theme, full-bleed background photo, specific fonts/tokens from `styles/design-tokens.css`) rather than using the template's generic Site-record/branding-driven CMS system (`routes/sites.ts`, the Branding/Records/Uploads dashboard tabs that shipped with the template exist server-side but have no UI here).
- Dashboard editing model: field edits (day/time/type/title, thumbnail upload) are staged locally in React state and only persist on the explicit "Save changes" button (batched `PUT` per dirty row) — there is no more per-keystroke autosave. Add-entry and delete are still immediate actions with their own explicit buttons. If you add new editable fields, follow the staged-then-batch-saved pattern, not autosave.
- `shared/apiClient.ts` groups typed API calls by resource (`apiClient.schedule.*`, `apiClient.uploads.*`, `apiClient.admin.*`, `apiClient.youtube.*`); add new server routes here rather than calling `fetch`/`apiJson` directly from components.
- Local-only local storage state (`adminKey`, draft site JSON) lives in Zustand stores under `state/`, persisted to `localStorage`.

### Deployment (read this before touching anything under `api/` or `vercel.json`)
This is a single Vercel project serving both the static `apps/web` build and the API as one Bun Function, but **the API cannot be deployed as a normal TypeScript source file that imports from `apps/server`.** Two non-obvious platform constraints drive `vercel.json` and `api/`:

1. Vercel's Bun Function bundler does not inline a relative import that crosses outside the `/api` directory. An `api/index.ts` doing `import server from "../apps/server/src/index.ts"` builds and deploys "successfully" but crashes with `Bun process exited with exit status: 1` on *every single request* (the real underlying error, `Cannot find module '.../apps/server/src/index.ts'`, only shows up in Vercel's raw runtime-logs API — `vercel logs`/`vercel inspect --logs` on the CLI only shows the generic wrapper message).
2. Vercel decides whether `/api` contains a function at all from the files present in git *before* the build runs — a file only generated by `buildCommand` is invisible to that check, even though the build itself succeeds.

The fix, and the reason `api/index.ts` (TypeScript source) doesn't exist in this repo: `vercel.json`'s `buildCommand` runs `bun build apps/server/src/index.ts --outdir api --target bun --external sharp`, producing a single self-contained `api/index.js` (~30MB, everything inlined except `sharp`) with zero relative imports left to resolve at deploy time. **That generated `api/index.js` is committed to git** (not gitignored) purely so Vercel's initial function-detection step sees it; `buildCommand` regenerates it fresh on every deploy regardless, so the committed copy is never what's actually stale — server code changes take effect on the next deploy automatically. If you ever "clean up" by gitignoring `api/index.js` again, the API will silently stop being deployed as a function (requests fall through to the SPA's `index.html` instead of erroring, which is its own confusing failure mode).

Do not hand-edit `api/index.js`. If you need to change the API's deployment entrypoint behavior, change `apps/server/src/index.ts` and regenerate.

### Environment
Single root `.env` (not per-package) is the env source for Drizzle, the Bun API, and Vite. `.env.production` documents the trimmed set of vars actually needed on Vercel (vs. local-only ones like `VITE_API_PROXY_TARGET` that have no effect in production). Storage driver, cookie security, and HSTS flags all need different values between local (`local`/`false`/`false`) and production (`cloudinary`/`true`/`true`) — see that file for the full list and reasoning.
