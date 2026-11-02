import { AsyncLocalStorage } from "node:async_hooks";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { Pool, type QueryResultRow } from "pg";

export type DatabaseProvider = "sqlite" | "postgres";
type SqliteTransactionContext = { provider: "sqlite" };
type PostgresTransactionContext = { provider: "postgres"; client: import("pg").PoolClient };
type TransactionContext = SqliteTransactionContext | PostgresTransactionContext;

class AsyncMutex {
  private tail: Promise<void> = Promise.resolve();
  async run<T>(operation: () => T | Promise<T>): Promise<T> {
    let release!: () => void;
    const previous = this.tail;
    this.tail = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try { return await operation(); } finally { release(); }
  }
}

function configuredProvider(): DatabaseProvider {
  const explicit = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
  if (explicit === "postgres" || explicit === "postgresql") return "postgres";
  if (explicit === "sqlite") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Production requires PostgreSQL; SQLite is disabled for production deployments.");
    }
    return "sqlite";
  }
  if (explicit) throw new Error("DATABASE_PROVIDER must be sqlite or postgres.");
  if (process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL) return "postgres";
  if (process.env.NODE_ENV === "production") throw new Error("Production requires POSTGRES_URL; refusing to open a local SQLite database.");
  return "sqlite";
}

export const databaseProvider = configuredProvider();
const transactionContext = new AsyncLocalStorage<TransactionContext>();
const sqliteMutex = new AsyncMutex();
const sqlitePath = path.resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH || path.join(process.cwd(), "data", "yflb.sqlite"));
let sharedSqlite = (globalThis as typeof globalThis & { yflbSqlite?: Database.Database }).yflbSqlite;
if (databaseProvider === "sqlite" && !sharedSqlite) {
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  sharedSqlite = new Database(sqlitePath);
  sharedSqlite.pragma("foreign_keys = ON");
  sharedSqlite.pragma("journal_mode = WAL");
  if (process.env.NODE_ENV !== "production") (globalThis as typeof globalThis & { yflbSqlite?: Database.Database }).yflbSqlite = sharedSqlite;
}

export const sqliteDb = sharedSqlite ?? null;
const connectionString = process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (databaseProvider === "postgres" && !connectionString) throw new Error("POSTGRES_URL is required when DATABASE_PROVIDER=postgres.");
export const postgresPool = databaseProvider === "postgres" ? new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: true },
}) : null;
export const authDatabase: Database.Database | Pool = (postgresPool ?? sqliteDb)!;

function postgresSql(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function inTransaction() { return transactionContext.getStore(); }
function bindValues(parameters: unknown[]) {
  return databaseProvider === "sqlite" ? parameters.map((value) => typeof value === "boolean" ? Number(value) : value) : parameters;
}

export const db = {
  async all<T extends QueryResultRow = QueryResultRow>(sql: string, parameters: unknown[] = []): Promise<T[]> {
    if (databaseProvider === "postgres") {
      const context = inTransaction();
      const result = context?.provider === "postgres"
        ? await context.client.query<T>(postgresSql(sql), bindValues(parameters))
        : await postgresPool!.query<T>(postgresSql(sql), bindValues(parameters));
      return result.rows;
    }
    const values = bindValues(parameters);
    const operation = () => sqliteDb!.prepare(sql).all(...values) as T[];
    const context = inTransaction();
    return context?.provider === "sqlite" ? operation() : sqliteMutex.run(operation);
  },

  async get<T extends QueryResultRow = QueryResultRow>(sql: string, parameters: unknown[] = []): Promise<T | undefined> {
    if (databaseProvider === "postgres") {
      const context = inTransaction();
      const result = context?.provider === "postgres"
        ? await context.client.query<T>(postgresSql(sql), bindValues(parameters))
        : await postgresPool!.query<T>(postgresSql(sql), bindValues(parameters));
      return result.rows[0];
    }
    const values = bindValues(parameters);
    const operation = () => sqliteDb!.prepare(sql).get(...values) as T | undefined;
    const context = inTransaction();
    return context?.provider === "sqlite" ? operation() : sqliteMutex.run(operation);
  },

  async run(sql: string, parameters: unknown[] = []): Promise<number> {
    if (databaseProvider === "postgres") {
      const context = inTransaction();
      const client = context?.provider === "postgres" ? context.client : postgresPool!;
      const result = await client.query(postgresSql(sql), bindValues(parameters));
      return result.rowCount ?? 0;
    }
    const values = bindValues(parameters);
    const operation = () => sqliteDb!.prepare(sql).run(...values).changes;
    const context = inTransaction();
    return context?.provider === "sqlite" ? operation() : sqliteMutex.run(operation);
  },

  async transaction<T>(operation: () => Promise<T>): Promise<T> {
    if (inTransaction()) return operation();
    if (databaseProvider === "postgres") {
      const client = await postgresPool!.connect();
      try {
        await client.query("BEGIN");
        const result = await transactionContext.run({ provider: "postgres", client }, operation);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally { client.release(); }
    }
    return sqliteMutex.run(async () => {
      sqliteDb!.exec("BEGIN IMMEDIATE");
      try {
        const result = await transactionContext.run({ provider: "sqlite" }, operation);
        sqliteDb!.exec("COMMIT");
        return result;
      } catch (error) {
        sqliteDb!.exec("ROLLBACK");
        throw error;
      }
    });
  },
};
