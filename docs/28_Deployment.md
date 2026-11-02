# Deployment Guide

## Current verified status

- Vercel project: `yflb_fitness_academy`.
- Node runtime configured to 24.x.
- A Supabase project named `yflb_fitness_academy_database` is connected to the Vercel project, but app use of the database still requires Vercel team authorization and verified environment access.
- The Supabase public schema and Storage bucket list were empty at the last read-only inspection.
- No deployment, custom domain, or GitHub repository is connected yet.
- Local PostgreSQL schema and guarded data-import scripts are prepared. Neither has been applied to Supabase.

## Required environment

Configure Preview first using [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md). Confirm Vercel Preview has the Postgres pooler URL, Better Auth settings, owner email/admin key, Supabase URL, server Storage key, browser publishable key, and bucket name. Never print or commit decrypted values. Production values remain separate.

## Local checks

From the application root (`YFLB-Fitness-Academy`):

```powershell
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

`npm run build` runs only `next build`. Local SQLite setup/seeding is explicit (`npm run db:setup`). The Postgres schema migration and verified backup data import are separate commands documented in [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md).

## GitHub and Vercel workflow

1. Use the application folder itself as the Git repository root; do not use its parent folder.
2. Review `.gitignore`, scan the staged files, and confirm `.env*`, SQLite/WAL/SHM, backups, archives, `node_modules`, build output, and user media are ignored.
3. Commit only application source and non-secret docs/config. A GitHub account/repository connection is still required to publish this local commit.
4. Connect that repository to the existing Vercel project, keep Root Directory at `./` because the repository itself is the app folder, and use Node.js 24.x with the normal Next.js install/build defaults.
5. Create a Preview deployment only. Do not promote to Production without explicit owner approval.

## Preview acceptance checks

Test home and navigation, equipment and muscle catalog, account login with the existing owner account, admin gate, plans, member profile, planner, session logs, and one controlled media upload. Verify Supabase row persistence after a new deployment and re-open the Preview. Use a new test account for member flows; do not modify the owner's existing records.

## Rollback

Keep the local SQLite source and verified backup unchanged until Preview is fully verified and a newer backup exists. If Preview fails, disable the Preview integration or roll back the preview deployment only. Do not restore over a populated database or change Production routing without approval.
