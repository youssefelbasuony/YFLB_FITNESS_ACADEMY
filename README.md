# YFLB Fitness Academy

A beginner-first gym companion for learning equipment setup, movement technique, target muscles, and an achievable first training plan. Members can save gym equipment, build a personal fitness profile, plan sessions, log sets, and adjust missed workouts. Owners manage translated equipment guides, localized videos, and training plans from the protected admin area.

## Technology

- Next.js 16 App Router, React 19, TypeScript, and Node.js 24.
- Better Auth for email/password accounts and sessions.
- SQLite (`better-sqlite3`) for local development; PostgreSQL (`pg`) for hosted deployments.
- Supabase Storage for public exercise media, uploaded through short-lived signed URLs after server-side admin authorization.
- Zod request validation and server-side owner checks.

## Local development

Requirements: Node.js 24.x and npm. From this application folder:

```powershell
npm ci
npm run dev
```

The current local database is `data/yflb.sqlite`; local media is stored in `public/uploads/videos/`. `npm run dev` does not run database setup or seed data. For a brand-new local database only, review `.env.example`, create a private `.env.local`, then deliberately run `npm run db:setup`. That command is SQLite-only and must not be pointed at valuable or hosted data.

Run checks with `npm run lint`, `npx tsc --noEmit`, and `npm run build`. The build does not run database migrations or seeds.

## Admin access

Open `/admin`, sign in, and use the owner email configured as `ADMIN_EMAIL` plus the separate secret `ADMIN_ACCESS_KEY`. Both are checked by server routes; the service key and admin key never go to the browser. In local development, the first account can claim the owner slot only when no `ADMIN_EMAIL` is set. See [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md).

## Production data and deployment

The Vercel project is configured for Node.js 24. Its Supabase integration provides Postgres connection variables, and the app chooses PostgreSQL when a Postgres URL is present. The Supabase schema and verified SQLite backup have been applied to the connected database; the local SQLite source remains unchanged. Vercel environment access and Preview deployment still need to be completed before the hosted app can be tested. A Vercel build never creates tables, seeds content, or changes data.

Before connecting the app to production, read:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/28_Deployment.md](docs/28_Deployment.md)
- [docs/BACKUP_AND_RESTORE.md](docs/BACKUP_AND_RESTORE.md)
- [docs/SUPABASE_MIGRATION.md](docs/SUPABASE_MIGRATION.md)
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

The verified SQLite backup is outside the repository at `D:\YFLB_Fitness_Academy_Backups\YFLB-Fitness-Academy\YFLB-Fitness-Academy_20261102_215031.sqlite`. Do not upload SQLite files, backups, archives, `.env*` secrets, or user uploads to GitHub.

## Project structure

- `app/` — pages and API handlers.
- `components/` — member and admin React interfaces.
- `lib/` — authentication, database adapter, authorization, repository, and media storage.
- `data/` — translated starter catalog and plan content.
- `db/` — local SQLite schema, Postgres schema, and Supabase Storage bucket definition.
- `scripts/` — local-only setup and guarded, explicit Postgres/data migration commands.
- `public/logos/` — YFLB brand assets.
- `public/uploads/videos/` — local-development media files (ignored by Git).
- `docs/` — project state, architecture, backup, migration, security, and admin guides.
- `archive/prototype-2026-11-02/` — static UI prototype; its browser-only data is not production data.

## Important limits

Public exercise recordings remain public, matching the existing guide behavior. Uploads and deletion require owner access. The initial Supabase bucket is limited to 50 MiB per file; files larger than that require a different storage plan. The app does not translate or dub audio: upload language-matched recordings or captions for each published language. Email verification and password recovery delivery are not configured.
