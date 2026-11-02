import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";

config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

const apply = process.argv.includes("--apply");
if (!apply) {
  console.log("Dry run only. Review the Supabase target, then rerun with --apply to create the schema.");
  process.exit(0);
}

const migrationUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
if (["sqlite"].includes(process.env.DATABASE_PROVIDER?.trim().toLowerCase() || "") || !migrationUrl) {
  throw new Error("Refusing to open the local SQLite database. Provide a Postgres URL and DATABASE_PROVIDER=postgres.");
}
if (process.env.SUPABASE_STORAGE_BUCKET && process.env.SUPABASE_STORAGE_BUCKET !== "yflb-training-videos") {
  throw new Error("This migration creates yflb-training-videos. Keep SUPABASE_STORAGE_BUCKET aligned or prepare a reviewed bucket migration.");
}
process.env.POSTGRES_PRISMA_URL = migrationUrl;

const [{ auth }, { databaseProvider, postgresPool }, { getMigrations }] = await Promise.all([
  import("../lib/auth"), import("../lib/db"), import("better-auth/db/migration"),
]);
if (databaseProvider !== "postgres" || !postgresPool) throw new Error("Set DATABASE_PROVIDER=postgres and a Supabase Postgres connection URL first.");

const targetUrl = migrationUrl;
const targetHost = targetUrl ? new URL(targetUrl).hostname.toLowerCase() : "";
if (!targetHost || ["localhost", "127.0.0.1", "::1"].includes(targetHost)) throw new Error("Refusing to apply a Supabase schema to a local or unknown Postgres host.");

const appTables = [
  "machines", "muscles", "machine_muscles", "user_machines", "workouts", "workout_exercises",
  "workout_completions", "video_uploads", "app_settings", "disabled_seed_machines",
  "yflb_content_migrations", "training_plans", "member_planner_profiles", "member_training_sessions", "yflb_migration_runs",
];
const knownTables = new Set([...appTables, "user", "account", "session", "verification", "jwks"]);
const pool = postgresPool;

const existing = await pool.query<{ table_name: string }>(
  "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name",
);
const unexpected = existing.rows.map((row) => row.table_name).filter((table) => !knownTables.has(table));
if (unexpected.length) throw new Error(`Refusing to modify an unrecognized public schema. Existing tables: ${unexpected.join(", ")}`);
if (existing.rows.some((row) => row.table_name === "yflb_migration_runs")) {
  const marker = await pool.query("SELECT 1 FROM public.yflb_migration_runs WHERE id='001_postgres_schema'");
  if (marker.rowCount) {
    const tableNames = new Set(existing.rows.map((row) => row.table_name));
    const missing = appTables.filter((table) => !tableNames.has(table));
    const bucket = await pool.query<{ public: boolean; file_size_limit: number; allowed_mime_types: string[] }>(
      "SELECT public,file_size_limit,allowed_mime_types FROM storage.buckets WHERE id='yflb-training-videos'",
    );
    if (missing.length || bucket.rows[0]?.public !== true || Number(bucket.rows[0]?.file_size_limit) !== 52428800) {
      throw new Error(`The recorded YFLB schema is incomplete. Missing tables: ${missing.join(", ") || "none"}; inspect the storage bucket before retrying.`);
    }
    console.log("The YFLB PostgreSQL schema migration is already recorded; no database changes were made.");
    await pool.end();
    process.exit(0);
  }
}
for (const { table_name: table } of existing.rows) {
  const count = await pool.query(`SELECT COUNT(*)::bigint AS count FROM public.${quoteIdentifier(table)}`);
  if (BigInt(count.rows[0].count) > 0n) throw new Error(`Refusing to apply schema over existing data in public.${table}.`);
}

const authMigrations = await getMigrations(auth.options);
await authMigrations.runMigrations();

const appSchema = fs.readFileSync(path.join(process.cwd(), "db", "schema.postgres.sql"), "utf8");
const storageSchema = fs.readFileSync(path.join(process.cwd(), "db", "storage.supabase.sql"), "utf8");
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(appSchema);
  await client.query(storageSchema);
  const bucket = await client.query<{ public: boolean; file_size_limit: number; allowed_mime_types: string[] }>(
    "SELECT public,file_size_limit,allowed_mime_types FROM storage.buckets WHERE id='yflb-training-videos'",
  );
  const configMatches = bucket.rows[0]?.public === true
    && Number(bucket.rows[0]?.file_size_limit) === 52428800
    && ["video/mp4", "video/webm", "video/quicktime", "image/gif", "image/webp"].every((mime) => bucket.rows[0].allowed_mime_types?.includes(mime));
  if (!configMatches) throw new Error("The existing Supabase video bucket does not match the required public-read, 50 MB media configuration.");

  const protectedTables = ["user", "account", "session", "verification", "jwks", ...appTables];
  for (const table of protectedTables) {
    const present = await client.query("SELECT to_regclass($1) AS relation", [`public.${table}`]);
    if (!present.rows[0].relation) continue;
    await client.query(`ALTER TABLE public.${quoteIdentifier(table)} ENABLE ROW LEVEL SECURITY`);
  }
  await client.query("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated");
  await client.query("REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated");
  await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated");
  await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated");
  await client.query("INSERT INTO yflb_migration_runs(id) VALUES('001_postgres_schema') ON CONFLICT(id) DO NOTHING");
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}
console.log(`PostgreSQL schema applied to ${targetHost}; application tables are RLS-enabled and inaccessible through the public Data API.`);

function quoteIdentifier(value: string) { return `"${value.replaceAll('"', '""')}"`; }
