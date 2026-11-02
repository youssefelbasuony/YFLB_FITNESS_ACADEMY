# Database Plan — Current Product

## Runtime database choices

Local development uses SQLite through `better-sqlite3` at `data/yflb.sqlite` (or `DATABASE_PATH`). Hosted environments use PostgreSQL through the Supabase pooler. The application never copies or seeds the local SQLite file during a Vercel build. Production refuses to fall back to a filesystem SQLite database.

## Current schema

The verified source database includes Better Auth identity/session tables and YFLB application tables for equipment, muscles, mappings, workouts, member saves/completions, localized-media metadata, admin settings, training plans, member profiles, and scheduled training sessions. See [Database_Schema.md](Database_Schema.md) and `db/schema.postgres.sql` for the implemented definitions.

There are no course, lesson, exam, nutrition, or community tables in the current application database. Old planning documents that list those features describe proposals only.

## PostgreSQL conversion

Better Auth creates its tables from the pinned auth configuration. The YFLB-specific PostgreSQL schema uses PostgreSQL `BOOLEAN`, identity columns, `DATE`, `TIMESTAMPTZ`, constraints, indexes, and foreign keys rather than copying SQLite DDL. Every public app/auth table has RLS enabled and direct Data API access revoked; the app accesses data server-side through its database pool.

Schema creation: `npm run db:migrate -- --apply`.

Data transfer from the verified backup: first use the dry-run form, review the source SHA-256 and row counts, then pass `--apply`. The importer preserves IDs and password hashes, refuses populated target tables, runs transactionally, compares source/target counts, and records the source checksum. Never run it against a target whose contents are not understood.

## Source data preservation

The local SQLite original and a tested SQLite Backup API copy remain outside Git. The backup report and exact counts are in [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md). Schema application and data import have not yet been run on Supabase.
