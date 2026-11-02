# Database Schema Reference

The current full PostgreSQL DDL is in [`db/schema.postgres.sql`](../db/schema.postgres.sql). Better Auth identity schema is generated through Better Auth 1.7.15 from [`lib/auth.ts`](../lib/auth.ts) when the explicit migration runner executes.

## Better Auth tables

- `user`: stable account ID, name, unique email, verification state, profile image, timestamps.
- `account`: provider/account identity, password hash and credential tokens, linked to a user.
- `session`: session token, expiry, IP/user-agent metadata, linked to a user.
- `verification`: email/account verification identifiers and expiring values.

## YFLB tables

| Table | Purpose and key relationships |
| --- | --- |
| `machines` | Exercise equipment guides, localized copy, and media map. |
| `muscles` | Localized muscle names and beginner guidance. |
| `machine_muscles` | Machine-to-muscle relation plus primary/secondary role. |
| `user_machines` | Member-saved equipment; composite key and user ownership. |
| `workouts` | Seeded workout descriptions and localized labels. |
| `workout_exercises` | Ordered exercise entries; identity ID retained from SQLite. |
| `workout_completions` | Member completion state keyed by user and workout. |
| `video_uploads` | Uploaded file metadata and Storage object path; no video bytes. |
| `training_plans` | Goal, level, duration, publish state, and localized plan JSON. |
| `member_planner_profiles` | Per-user fitness profile and selected plan. |
| `member_training_sessions` | Scheduled, completed, and progress-tracked sessions. |
| `app_settings` | Local admin ownership setting and application values. |
| `disabled_seed_machines` | Prevents deliberately removed seed machines from returning. |
| `yflb_content_migrations` | Records translated-content initialization. |
| `yflb_migration_runs` | Schema/data migration checksums and idempotency markers. |

The schema enables foreign keys and indexes for user schedules, machine category, saved equipment, and workout completion. Public tables have RLS enabled with no direct client policies; Data API table/sequence grants are revoked. Better Auth and application queries use the private server-side pool.

Current SQLite row counts and migration status are recorded in [`BACKUP_AND_RESTORE.md`](BACKUP_AND_RESTORE.md) and [`SUPABASE_MIGRATION.md`](SUPABASE_MIGRATION.md).
