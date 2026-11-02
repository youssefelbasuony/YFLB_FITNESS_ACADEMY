# Supabase PostgreSQL and Storage Setup

## Before starting

The verified source backup is described in [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md). It must remain available outside Git. Before the first migration, the Supabase project's `public` schema and Storage bucket list were empty. The YFLB schema and data have since been applied; do not rerun the import against a populated target or use reset, drop, truncate, or seed commands against the hosted project.

## Connection settings

For the Vercel app, use the Supabase connection pooler URL exposed as `POSTGRES_PRISMA_URL` (or `POSTGRES_URL`) and keep TLS verification enabled. For one-time migrations/imports, prefer the Supabase direct or session-pool URL exposed as `POSTGRES_URL_NON_POOLING` when available. The migration scripts select the non-pooled URL first, require an explicit `--apply`, and refuse an unknown or local target.

Set these variables in Vercel Preview first. Keep all server keys private:

- `DATABASE_PROVIDER=postgres`
- `POSTGRES_PRISMA_URL` — app runtime pooler URL.
- `POSTGRES_URL_NON_POOLING` — migration connection URL, when available.
- `BETTER_AUTH_SECRET` — private, random value at least 32 characters; keep stable after launch.
- `BETTER_AUTH_URL` — the exact Preview or Production URL.
- `ADMIN_EMAIL` — existing YFLB owner account email.
- `ADMIN_ACCESS_KEY` — separate private random value at least 32 characters.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — server-only Storage access.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — safe browser upload client settings.
- `SUPABASE_STORAGE_BUCKET=yflb-training-videos`.

Do not copy a service-role/secret key to a `NEXT_PUBLIC_` variable. The app does not use Supabase Auth for user accounts; Better Auth remains the authentication provider.

## Create the schema

1. Recheck that this is the intended Supabase project and no user data or tables have appeared since inspection.
2. In a trusted local shell, provide `DATABASE_PROVIDER=postgres` and the intended Postgres URL without printing it.
3. Run `npm run db:migrate -- --apply` from the application root.
4. The runner first rejects unknown tables or existing rows, then uses Better Auth's migration API, applies `db/schema.postgres.sql`, configures a public-read 50 MiB `yflb-training-videos` bucket, enables RLS, revokes Data API table/sequence access, and records a migration marker. It is not called by build/start.
5. Inspect public tables, RLS, bucket settings, and Supabase security advisors. Stop if any preflight check differs from expectations.

The migration is additive and refuses to overwrite an existing bucket with mismatched settings. It does not reset existing tables. A partially completed auth migration can be retried while all affected tables remain empty. The runner also reconciles the additive indexes in `db/migrations/002_foreign_key_indexes.sql` when the schema marker already exists.

## Import the verified SQLite backup

The importer defaults to dry-run. It reads only the explicitly supplied backup in read-only mode and prints a SHA-256 plus row counts:

```powershell
npm run db:import-sqlite -- --source "D:\YFLB_Fitness_Academy_Backups\YFLB-Fitness-Academy\YFLB-Fitness-Academy_20261102_215031.sqlite"
```

Review the source hash and counts. After the destination schema and empty-table checks pass, the explicit apply command is:

```powershell
npm run db:import-sqlite -- --source "D:\YFLB_Fitness_Academy_Backups\YFLB-Fitness-Academy\YFLB-Fitness-Academy_20261102_215031.sqlite" --apply
```

The importer preserves IDs, Better Auth hashes, foreign-key order, and workout exercise identity values. It runs in one transaction, refuses any preexisting destination rows, compares per-table row counts, and records the source checksum. A rerun with the same checksum only verifies counts; a different source is rejected. The SQLite source and backup are never modified.

Current backup counts are listed in [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md). There are no video-upload metadata rows or local video files to copy at this time. Do not claim that media was imported.

## Applied to the connected Supabase project — 2026-11-02

- Project reference: `lazzfdxdadvwcimzrylk` (`us-east-1`, PostgreSQL 17.11).
- Applied migration history: `yflb_postgres_schema` and `yflb_foreign_key_indexes`.
- Created 19 public tables, including Better Auth's four tables and the YFLB application tables. All have RLS enabled; direct `anon`/`authenticated` table and sequence grants are revoked. The app uses a server-side PostgreSQL connection.
- Created the `yflb-training-videos` bucket as public-read, 50 MiB maximum, with the app's accepted video/image MIME types. It contains no files.
- Imported the exact SQLite backup with an atomic transaction and source-checksum marker. Table counts match [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md); user/account IDs and the existing password hash were verified, and checked foreign-key relationships have no orphans.
- The original SQLite database and external backup remain unchanged. There were no video-upload rows or local video files to move.
- The initial schema and backup import were applied through the authenticated Supabase management connection after verifying the target was empty. Local `.env.local` has no Postgres URL, so it was not used to connect. The import ran as one transaction with an empty-target guard, row-count assertions, identity sequence reset, and source SHA-256 marker. Do not repeat it against this populated target.
- Security advisor reports `RLS enabled, no policy` at INFO for the server-only public tables. This is intentional: RLS denies access by default and Data API grants are revoked. Performance advisor's foreign-key-index warning was resolved; unused-index INFO findings are expected before app traffic.
- Preview deployment, live sign-in, admin access, and browser-to-Storage upload/download have not yet been tested.

## After import

- Verify `user`, `account`, `session`, and `verification` row counts and confirm the owner email is unchanged.
- Sign in with the existing owner account and password; do not create a replacement account to make admin work.
- Verify machine, muscle, workout, plan, profile, and session relationships.
- Confirm runtime uses the pooler variable, not the local SQLite path.
- Test changes in Preview only. Do not promote to Production without the owner's explicit approval.
