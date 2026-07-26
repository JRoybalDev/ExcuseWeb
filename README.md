# ExcuseMeImJack — Web

Placeholder "Coming Soon" site and schedule dashboard for ExcuseMeImJack, built on the [fullstack-template-v1](https://github.com/JRoybalDev/fullstack-template-v1) stack.

## Tech Stack

- **Runtime:** Bun
- **API:** Hono, Drizzle ORM, Postgres
- **Web:** React 19, Vite, React Router, TanStack Query
- **Shared schema:** Zod (`packages/schema`)
- **Auth:** admin-key (single dashboard password)

## Project Structure

```txt
apps/
  web/       Public "Coming Soon" page + schedule-only admin dashboard
  server/    Bun + Hono API: schedule CRUD, YouTube feed, uploads
packages/
  schema/    Shared Zod schemas and types
api/         Vercel Bun Function entrypoint (re-exports the Hono app)
```

## Local Setup

```bash
bun install
cd packages/schema && bun install
cd ../../apps/server && bun install
cd ../web && bun install
cd ../..
```

Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `ADMIN_KEY`, `YOUTUBE_API_KEY`, and `YOUTUBE_CHANNEL_ID`.

Run migrations against your Postgres instance:

```bash
cd apps/server
bunx drizzle-kit migrate
cd ../..
```

Start the stack:

```bash
bun run dev
```

- Public site: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard` (password = `ADMIN_KEY`)
- API health: `http://localhost:3001/health`
- API docs: `http://localhost:3001/docs`

## Deployment

Deploys as a single Vercel project: `apps/web` builds to static assets, and `api/index.ts` runs the Hono API as a Vercel Bun Function (see `vercel.json`). Set `STORAGE_DRIVER=cloudinary` and the `CLOUDINARY_*` env vars in production — Vercel Functions have a read-only filesystem, so local upload storage only works in dev.

## Scope

This build covers exactly two screens per the current design handoff: the public Coming Soon page and a schedule-only admin dashboard. The rest of the full site (Home, Content, Community, etc.) is a later, separate handoff — the underlying template's generic records/branding/uploads/users infrastructure is already in place for when that work starts.
