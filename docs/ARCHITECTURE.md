# Architecture Overview

## Runtime

Next.js 16 App Router serves the React 19 interface and Node.js Route Handlers. Better Auth owns account, session, verification, and password-hash records. `lib/db.ts` is the sole application query layer: it selects local SQLite when no hosted database is configured and PostgreSQL when `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, or `DATABASE_URL` is present. Production refuses to fall back to a local SQLite file.

The application modules in `app/api/` read and write through `db.all`, `db.get`, `db.run`, and `db.transaction`. These helpers translate positional `?` parameters for PostgreSQL and serialize access to the single local SQLite connection. Better Auth receives the configured SQLite database or PostgreSQL pool directly.

## Data ownership

- Better Auth tables hold users, password hashes, linked accounts, sessions, and verification tokens.
- `machines`, `muscles`, `machine_muscles`, and `workouts` hold the translated exercise catalog.
- `training_plans` stores plan metadata and localized plan content; member profiles and sessions are account-scoped.
- `user_machines` and `workout_completions` store member equipment and completion state.
- `video_uploads` stores file metadata and object paths; Supabase Storage stores the media bytes.
- `app_settings`, `disabled_seed_machines`, and `yflb_content_migrations` preserve local admin/content setup state.

The full application PostgreSQL definition is [db/schema.postgres.sql](../db/schema.postgres.sql). Better Auth creates its own tables from the pinned Better Auth configuration when `npm run db:migrate -- --apply` is deliberately run.

## Media flow

An owner requests a one-use signed upload URL from `/api/admin/videos`. The server checks the Better Auth user, owner email, admin cookie, request origin, machine, MIME type, and size. The browser uploads directly to the `yflb-training-videos` Supabase bucket using the publishable key and signed token. A completion request verifies stored byte count and file signature, then commits the public media URL and metadata to PostgreSQL. Public reads preserve the current public exercise-guide behavior; file creation and deletion remain server-controlled.

## Deployment boundaries

`npm run build` only runs `next build`. Local schema setup/seeding (`npm run db:setup`), Postgres schema creation (`npm run db:migrate -- --apply`), and SQLite data import (`npm run db:import-sqlite -- --source <verified-backup> --apply`) are separate operations. No build, install, or start hook performs a migration.

The existing project currently has no successful deployment. The schema and data commands are prepared and guarded, but remote migration, import, preview, and end-to-end production behavior remain unverified until Vercel access and environment configuration are available.
