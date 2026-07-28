# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Placeholder "Coming Soon" site + a password-gated production-ops dashboard for the ExcuseMeImJack channel, built on the `fullstack-template-v1` stack (Bun, Hono, Drizzle, React/Vite). Deployed as a single Vercel project at `excusemeimjack.com`.

Scope is still narrower than the full future site (Home, Content, Community, etc. are a later, separate build), but the dashboard itself has grown well past "just the schedule." Nav tabs (`DashboardNav.tsx`): weekly schedule (`ScheduleTab`), a content calendar (`calendar/CalendarTab`, per-video upload tracking with CSV export and a Saturday auto-fill action), a recurring weekly-rhythm + Sunday-stream checklist (`weeklyRhythm/WeeklyRhythmTab`), a title-brainstorming scorer (`titleLab/TitleLabTab`), a biweekly channel-metrics audit log (`audit/AuditTab`), a static copy-paste reference tab (`templates/TemplatesTab`), and viewer build-request triage (`buildRequests/BuildRequestsTab`, fed by the public `/build-requests` submission form). One more tab isn't in the nav: each Calendar row links out to a per-video production checklist (`checklist/ProductionChecklistTab`, route `/dashboard/calendar/:entryId/checklist`). See `apps/web/src/main.tsx` for the full route tree. The template's generic records/branding/sites/users infrastructure (`routes/sites.ts`, `routes/admin.ts` user management, Better Auth password reset at `/reset-password`) is wired up server-side but still has no dashboard UI beyond what's listed above — don't build UI for it speculatively unless asked.

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

`packages/schema/src/index.ts` is the contract between server and web: add/change a Zod schema there first, then update the server route and the frontend call site to match. Server route handlers parse with `SomeSchema.safeParse`, return via `ok(c, data)` / `fail(c, message, status, { code })` from `apps/server/src/http/response.ts` (`{ success, data, meta }` / `{ success, error, code, meta }` envelope), and `apps/web/src/shared/api.ts`'s `apiJson` helper unwraps `data` automatically on the client. The schema package has grown beyond pure request/response shapes — it now also holds shared domain logic both server and client call into: `scoreTitles` (Title Lab), `diagnoseAudit` (Audit), `computeCalendarStats` and `calcChecklistProgress` (Calendar/checklist tabs). Keep that logic there rather than duplicating it per-side.

### Server (`apps/server/src`)
- `index.ts` registers all routes on one Hono app; auth (`auth.ts`), rate limiting, security headers, and CORS are applied here.
- `env.ts` is the only place that reads `process.env` — always add new config there, never inline `process.env.X` elsewhere. It's loaded via `loadEnv.ts`, which reads the single root `.env` file (not per-package `.env` files).
- Two admin auth modes controlled by `AUTH_MODE`: `admin-key` (single shared secret, `X-Admin-Key` header, `middleware/admin.ts`) — what this project actually uses for the dashboard — or `better-auth` (real accounts, user management under `routes/admin.ts`'s `/api/admin/users/*`). **`auth.ts` initializes Better Auth unconditionally regardless of `AUTH_MODE`** (other code paths reference it), but the construction is wrapped in try/catch and exported as possibly `null` (`auth`, `authInitError`) — every real `auth.api.*`/`auth.handler` call site is guarded with `|| !auth` so a failed Better Auth init degrades to a 503 on those specific routes instead of crashing the whole app. Keep that pattern if you touch `auth.ts`. Better Auth's password-reset flow is live independent of `AUTH_MODE` — `apps/web/src/routes/ResetPassword.tsx` (route `/reset-password`) posts to `/api/auth/request-password-reset` and `/api/auth/reset-password`, emailed via Resend or logged to console per `PASSWORD_RESET_EMAIL_MODE`.
- Route-to-table map (`apps/server/src/index.ts` mounts these under `/api/*`, all admin-key gated except where noted): `routes/schedule.ts` → `schedule_entries`; `routes/calendar.ts` → `calendar_entries` (also has `POST /auto-fill` to bulk-create upcoming Saturday slots) plus `GET`/`PUT /:id/checklist` → `calendar_checklists`, the per-video production checklist state (one row per calendar entry); `routes/checklistItems.ts` → `checklist_items`, the shared *item-definition* table (label/note/sortOrder per `groupKey`) that both the production checklist tab and the weekly-rhythm tab add/edit/delete items from; `routes/weeklyRhythm.ts` → `weekly_rhythm_state` (a single app-level-enforced singleton row — see `getOrCreateSingleton`, not a DB constraint); `routes/audit.ts` → `audit_runs` (create+delete only, deliberately no update — diagnosis is computed client-side and frozen at write time so past runs stay stable if diagnosis rules change later); `routes/buildRequests.ts` → `build_requests` (its `POST /` and `POST /upload` are public/unauthenticated with their own rate limits and a honeypot field, since viewers submit these from `/build-requests`; `GET`/`PATCH`/`DELETE` are admin-key gated); `routes/sites.ts` → `sites`; `routes/uploads.ts` → `uploads` (generic upload management UI now exists for schedule thumbnails and build-request images — it's the Records/Branding/Sites side of the template that still has no dashboard UI). `titleLab` and `templates` dashboard tabs have no dedicated server route — Title Lab debounce-autosaves its title candidates onto the calendar entry via `apiClient.calendar.update`, and Templates is static client-side reference content with no API calls at all.
- `schedule_entries` stores `dayOfWeek` + `time`/`type`/`title`/`thumbnailUrl`/`uploadId` but **no calendar date** — the public page computes each entry's next occurrence client-side from `dayOfWeek` (see `nextOccurrence` in `PublicSite.tsx`), matching the admin copy "the site countdown updates automatically." One entry per day is enforced with a unique constraint + a 409 on conflict. `calendar_entries`, by contrast, does carry real dates for actual production planning.
- Uploads (`storage/uploadStorage.ts`) support `local` (dev) or `cloudinary` (prod, required — Vercel Functions have a read-only filesystem) storage drivers via `STORAGE_DRIVER`. Any row that tracks `uploadId` (schedule entries, build requests) cascades the delete to the underlying `uploads` row *and* the actual Cloudinary/local asset (each route has its own `deleteUploadById`) — don't let entries reference orphaned uploads.
- `uploads/thumbnail.ts` uses `sharp` (native binary) for local-storage thumbnails only. It's imported **dynamically** (`await import(...)`) inside `uploadStorage.ts`, not statically — sharp is never touched at all when `STORAGE_DRIVER=cloudinary`, which is deliberate (see Deployment gotchas).
- Drizzle migrations: `db/migrations/meta/` is missing snapshot JSON files for migrations 0000–0005 (an upstream template gap, not something to "fix" retroactively). This means `drizzle-kit generate` only diffs correctly against the latest present snapshot — after generating a new migration, always read the generated `.sql` file and confirm it contains only the intended incremental change (`CREATE TABLE`/`ALTER TABLE` for what you actually added), not a `CREATE TABLE` for every existing table. Trim it by hand if it over-generates.

### Web (`apps/web/src`)
- `routes/App.tsx`'s chrome logic is now inverted from a simple opt-out list: `hideChrome = !isResetPassword`, i.e. *every* route (`/`, `/build-requests`, all of `/dashboard/*`) renders its own full-bleed layout and hides the generic template chrome (topbar, theme switcher) **except** `/reset-password`, which is the one screen still using the template's generic shell. Bespoke pages are not built on the template's generic `frontend-template-grid`/aside/footer pattern described in `docs/page-setup-grid-layout.md`. That doc's pattern is what *future* full-site pages (and, already, `/reset-password`) should use.
- The dashboard shell is `routes/dashboard/DashboardLayout.tsx` (nav in `DashboardNav.tsx`), with one file per tab under `routes/dashboard/<tab>/`; `ScheduleTab.tsx` alone still lives flat in `routes/dashboard/`. `routes/PublicSite.tsx` and the dashboard are almost entirely bespoke to this design (dark "Ranger Station"/"Operations Center" theme, full-bleed background photo, specific fonts/tokens from `styles/design-tokens.css`) rather than using the template's generic Site-record/branding-driven CMS system (`routes/sites.ts` exists server-side but has no dashboard UI).
- **Editing pattern differs by tab — check the tab you're touching before assuming one applies.** `ScheduleTab` and `CalendarTab` stage field edits locally in React state (dirty-row tracking, a `beforeunload` warning) and only persist on an explicit "Save changes" button (batched `PUT` per dirty row); add-entry and delete are immediate either way. `ProductionChecklistTab` and `WeeklyRhythmTab` instead **autosave**: every checkbox toggle fires a `useMutation` immediately (copy literally says "Progress saves automatically"), and free-text notes are staged locally only until `onBlur`, which then fires the same immediate mutation — no dirty-tracking, no save button. `TitleLabTab` is a third variant: debounced autosave (~600ms after the last keystroke) writing title candidates back onto the calendar entry. `AuditTab` (create/delete-only, no in-place edit) and the `BuildRequestsTab` status dropdown/delete are one-shot immediate mutations, same as any add/delete action elsewhere. If you add new editable fields, match the pattern already used by the tab you're in rather than defaulting to "staged batch save."
- `shared/apiClient.ts` groups typed API calls by resource (`apiClient.schedule.*`, `apiClient.calendar.*`, `apiClient.checklistItems.*`, `apiClient.weeklyRhythm.*`, `apiClient.audit.*`, `apiClient.buildRequests.*`, `apiClient.uploads.*`, `apiClient.admin.*`, `apiClient.auth.*`, `apiClient.youtube.*`); add new server routes here rather than calling `fetch`/`apiJson` directly from components.
- Local-only local storage state (`adminKey`, draft site JSON) lives in Zustand stores under `state/`, persisted to `localStorage`.

### Deployment (read this before touching anything under `api/` or `vercel.json`)
This is a single Vercel project serving both the static `apps/web` build and the API as one Bun Function, but **the API cannot be deployed as a normal TypeScript source file that imports from `apps/server`.** Two non-obvious platform constraints drive `vercel.json` and `api/`:

1. Vercel's Bun Function bundler does not inline a relative import that crosses outside the `/api` directory. An `api/index.ts` doing `import server from "../apps/server/src/index.ts"` builds and deploys "successfully" but crashes with `Bun process exited with exit status: 1` on *every single request* (the real underlying error, `Cannot find module '.../apps/server/src/index.ts'`, only shows up in Vercel's raw runtime-logs API — `vercel logs`/`vercel inspect --logs` on the CLI only shows the generic wrapper message).
2. Vercel decides whether `/api` contains a function at all from the files present in git *before* the build runs — a file only generated by `buildCommand` is invisible to that check, even though the build itself succeeds.

The fix, and the reason `api/index.ts` (TypeScript source) doesn't exist in this repo: `vercel.json`'s `buildCommand` runs `bun build apps/server/src/index.ts --outdir api --target bun --external sharp`, producing a single self-contained `api/index.js` (~30MB, everything inlined except `sharp`) with zero relative imports left to resolve at deploy time. **That generated `api/index.js` is committed to git** (not gitignored) purely so Vercel's initial function-detection step sees it; `buildCommand` regenerates it fresh on every deploy regardless, so the committed copy is never what's actually stale — server code changes take effect on the next deploy automatically. If you ever "clean up" by gitignoring `api/index.js` again, the API will silently stop being deployed as a function (requests fall through to the SPA's `index.html` instead of erroring, which is its own confusing failure mode).

Do not hand-edit `api/index.js`. If you need to change the API's deployment entrypoint behavior, change `apps/server/src/index.ts` and regenerate.

### Environment
Single root `.env` (not per-package) is the env source for Drizzle, the Bun API, and Vite. `.env.production` documents the trimmed set of vars actually needed on Vercel (vs. local-only ones like `VITE_API_PROXY_TARGET` that have no effect in production). Storage driver, cookie security, and HSTS flags all need different values between local (`local`/`false`/`false`) and production (`cloudinary`/`true`/`true`) — see that file for the full list and reasoning.
