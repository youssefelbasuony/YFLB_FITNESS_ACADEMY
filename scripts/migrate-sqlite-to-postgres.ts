import { config } from "dotenv";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

const sourcePath = process.argv.find((argument) => argument.toLowerCase().endsWith(".sqlite") || argument.toLowerCase().endsWith(".sqlite3") || argument.toLowerCase().endsWith(".db"));
if (!sourcePath || !fs.existsSync(sourcePath)) throw new Error('Pass a verified SQLite backup path, e.g. --source "D:\\backups\\yflb.sqlite".');
const source = new Database(path.resolve(sourcePath), { readonly: true, fileMustExist: true });
source.pragma("query_only = ON");
const tables = [
  "user", "account", "session", "verification", "machines", "muscles", "machine_muscles", "user_machines",
  "workouts", "workout_exercises", "workout_completions", "video_uploads", "app_settings", "disabled_seed_machines",
  "yflb_content_migrations", "training_plans", "member_planner_profiles", "member_training_sessions",
];
const counts = new Map<string, number>();
for (const table of tables) {
  const exists = source.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table);
  if (!exists) throw new Error(`The backup is missing the required table ${table}.`);
  counts.set(table, Number((source.prepare(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`).get() as { count: number }).count));
}
const sourceHash = createHash("sha256").update(fs.readFileSync(path.resolve(sourcePath))).digest("hex");
const apply = process.argv.includes("--apply");
if (!apply) {
  console.log(JSON.stringify({ mode: "dry-run", source: path.resolve(sourcePath), sha256: sourceHash, rowCounts: Object.fromEntries(counts) }, null, 2));
  source.close();
  process.exit(0);
}

const migrationUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
if (["sqlite"].includes(process.env.DATABASE_PROVIDER?.trim().toLowerCase() || "") || !migrationUrl) {
  source.close();
  throw new Error("Refusing to open the local SQLite database. Provide a Postgres URL and DATABASE_PROVIDER=postgres.");
}
process.env.POSTGRES_PRISMA_URL = migrationUrl;
let databaseModule: typeof import("../lib/db");
try { databaseModule = await import("../lib/db"); }
catch (error) { source.close(); throw error; }
const { databaseProvider, postgresPool } = databaseModule;
if (databaseProvider !== "postgres" || !postgresPool) { source.close(); throw new Error("Set DATABASE_PROVIDER=postgres and the reviewed Supabase Postgres URL first."); }
const client = await postgresPool.connect();
try {
  await client.query("BEGIN");
  const marker = await client.query<{ source_sha256: string | null }>("SELECT source_sha256 FROM yflb_migration_runs WHERE id='002_sqlite_import'");
  if (marker.rows.length) {
    if (marker.rows[0].source_sha256 !== sourceHash) throw new Error("A different SQLite source was already imported; refusing to merge or overwrite data.");
    for (const table of tables) {
      const target = await client.query(`SELECT COUNT(*)::bigint AS count FROM public.${quoteIdentifier(table)}`);
      if (BigInt(target.rows[0].count) !== BigInt(counts.get(table)!)) throw new Error(`Post-import row count changed for ${table}.`);
    }
    await client.query("ROLLBACK");
    console.log("This exact backup was already imported and all row counts still match; no data was changed.");
    source.close();
    client.release();
    await postgresPool.end();
    process.exit(0);
  }

  for (const table of tables) {
    const target = await client.query(`SELECT COUNT(*)::bigint AS count FROM public.${quoteIdentifier(table)}`);
    if (BigInt(target.rows[0].count) !== 0n) throw new Error(`Refusing to import over existing rows in public.${table}.`);
  }

  for (const table of tables) {
    const columns = (source.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`).all() as Array<{ name: string }>).map((column) => column.name);
    if (!columns.length) throw new Error(`Could not inspect columns for ${table}.`);
    const rows = source.prepare(`SELECT * FROM ${quoteIdentifier(table)}`).all() as Array<Record<string, unknown>>;
    for (let offset = 0; offset < rows.length; offset += 200) {
      const batch = rows.slice(offset, offset + 200);
      const values: unknown[] = [];
      const tuples = batch.map((row) => `(${columns.map((column) => {
        const value = row[column];
        values.push(table === "training_plans" && column === "published" ? Boolean(value) : value);
        return `$${values.length}`;
      }).join(",")})`);
      await client.query(`INSERT INTO public.${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(",")}) VALUES ${tuples.join(",")}`, values);
    }
  }

  const sequence = await client.query("SELECT pg_get_serial_sequence('public.workout_exercises','id') AS name");
  if (sequence.rows[0]?.name) {
    await client.query("SELECT setval(pg_get_serial_sequence('public.workout_exercises','id'), GREATEST(COALESCE((SELECT MAX(id) FROM public.workout_exercises),1),1), EXISTS(SELECT 1 FROM public.workout_exercises))");
  }
  for (const table of tables) {
    const target = await client.query(`SELECT COUNT(*)::bigint AS count FROM public.${quoteIdentifier(table)}`);
    if (BigInt(target.rows[0].count) !== BigInt(counts.get(table)!)) throw new Error(`Row count verification failed for ${table}; the transaction will be rolled back.`);
  }
  await client.query("INSERT INTO yflb_migration_runs(id,source_sha256) VALUES('002_sqlite_import',$1)", [sourceHash]);
  await client.query("COMMIT");
  console.log(JSON.stringify({ mode: "applied", sourceSha256: sourceHash, rowCounts: Object.fromEntries(counts), verified: true }, null, 2));
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  source.close();
  client.release();
  await postgresPool.end();
}

function quoteIdentifier(value: string) { return `"${value.replaceAll('"', '""')}"`; }
