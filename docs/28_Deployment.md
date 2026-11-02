# Deployment Guide

## Current verified status

- Vercel project: `yflb_fitness_academy`.
- Node runtime configured to 24.x.
- Supabase project `yflb_fitness_academy_database` contains the YFLB schema and the imported verified SQLite backup. Row counts, owner/account IDs, password-hash fingerprint, relationships, and RLS were checked; see [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md).
- The `yflb-training-videos` public-read 50 MiB bucket exists and is empty; there were no local video files to transfer.
- No deployment, custom domain, or GitHub remote is connected yet. The app folder has a local Git repository and commit.
- Vercel team authorization is still needed to inspect environment-variable names, finish Preview configuration, and create a Preview deployment. No Production deployment has been made.

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

The local production build passed after allowing Next.js to create a temporary junction under `.next`; the default sandbox blocks that Windows operation. Better Auth logged schema-connection errors because the build was isolated from the real database, so this does not prove runtime authentication.

`npm run build` runs only `next build`. Local SQLite setup/seeding is explicit (`npm run db:setup`). The Postgres schema migration and verified backup data import are separate commands documented in [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md).

## GitHub and Vercel workflow

1. Use the application folder itself as the Git repository root; do not use its parent folder.
2. Review `.gitignore`, scan the staged files, and confirm `.env*`, SQLite/WAL/SHM, backups, archives, `node_modules`, build output, and user media are ignored.
3. The source and non-secret docs/config have been committed locally. A GitHub account/repository connection is still required to publish this local commit.
4. Connect that repository to the existing Vercel project, keep Root Directory at `./` because the repository itself is the app folder, and use Node.js 24.x with the normal Next.js install/build defaults.
5. Create a Preview deployment only. Do not promote to Production without explicit owner approval.

## Preview acceptance checks

Test home and navigation, equipment and muscle catalog, account login with the existing owner account, admin gate, plans, member profile, planner, session logs, and one controlled media upload. Verify Supabase row persistence after a new deployment and re-open the Preview. Use a new test account for member flows; do not modify the owner's existing records.

## Rollback

Keep the local SQLite source and verified backup unchanged until Preview is fully verified and a newer backup exists. If Preview fails, disable the Preview integration or roll back the preview deployment only. Do not restore over a populated database or change Production routing without approval.
