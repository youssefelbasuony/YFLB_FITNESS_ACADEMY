# Backup and Restore

## Verified source backup

- Source database: `YFLB-Fitness-Academy/data/yflb.sqlite`.
- SQLite Backup API snapshot: `D:\YFLB_Fitness_Academy_Backups\YFLB-Fitness-Academy\YFLB-Fitness-Academy_20261102_215031.sqlite`.
- Size: 282,624 bytes.
- `PRAGMA integrity_check`: `ok`.
- Restore drill: restored to a separate temporary SQLite database; integrity and per-table counts matched.
- SHA-256: `60C23DB55DF5E345353D7429515C8C6591138F5B1982EB389293A7AF575D0705`.
- The source DB was not replaced, reset, or migrated. The snapshot is outside the app repository and Git workspace.

The app was stopped and no writer was detected before backup. The original main DB and WAL sizes/times remained unchanged. A read-only SQLite inspection refreshed the existing SHM file timestamp; this was recorded and did not alter database rows. Do not upload the source, WAL/SHM, backup, or ZIP archives.

## Preserved row counts

| Table | Rows |
| --- | ---: |
| `user` | 1 |
| `account` | 1 |
| `session` | 1 |
| `verification` | 0 |
| `machines` | 6 |
| `muscles` | 8 |
| `machine_muscles` | 17 |
| `user_machines` | 0 |
| `workouts` | 3 |
| `workout_exercises` | 12 |
| `workout_completions` | 0 |
| `video_uploads` | 0 |
| `app_settings` | 1 |
| `disabled_seed_machines` | 0 |
| `yflb_content_migrations` | 1 |
| `training_plans` | 1 |
| `member_planner_profiles` | 0 |
| `member_training_sessions` | 0 |

The SQLite backup also passed a read-only dry-run of the migration importer with the same SHA-256 and counts. No video-upload rows or video files were present during inspection.

## Future backup procedure

1. Stop the local app and all processes with the database open for writing.
2. Use SQLite's Backup API via a read-write source connection; do not copy only the main DB while WAL mode is active.
3. Save a timestamped backup outside the repository and Git workspace. Preserve WAL/SHM source files.
4. Run `PRAGMA integrity_check` on the backup, compare important table counts, calculate SHA-256, and restore to a different temporary path for a read/relationship check.
5. Retain the backup until a later verified backup exists. Never run migration/reset commands against the only copy.

## Restore principles

Restore only to a new, separate destination first. Verify integrity, table counts, account IDs, and foreign keys. Do not overwrite the original SQLite database or a populated Supabase database as part of a restore test. For the Postgres data import safeguards, see [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md).
