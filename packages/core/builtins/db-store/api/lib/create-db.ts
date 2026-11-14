import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Database } from 'bun:sqlite';
import { drizzle as drizzleSqlite } from 'drizzle-orm/bun-sqlite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

import { pgDocuments, sqliteDocuments } from './schema';

export type Dialect = 'sqlite' | 'postgres';

export type CreateDbOptions = {
  /** Override DATABASE_URL (postgres://… or file path). */
  databaseUrl?: string;
  /** SQLite path when not using Postgres; `:memory:` for tests. */
  databasePath?: string;
};

export type SqliteDb = ReturnType<typeof drizzleSqlite>;
export type PostgresDb = ReturnType<typeof drizzlePostgres>;

export type DbStoreContext =
  | {
      dialect: 'sqlite';
      db: SqliteDb;
      client: Database;
      close: () => void;
    }
  | {
      dialect: 'postgres';
      db: PostgresDb;
      client: ReturnType<typeof postgres>;
      close: () => Promise<void>;
    };

/** Default local store: `~/.agentos/store/db-store.sqlite` (override with AGENTOS_DB_PATH). */
function defaultSqlitePath(): string {
  const override = Bun.env.AGENTOS_DB_PATH;
  if (override) return override;
  return join(homedir(), '.agentos', 'store', 'db-store.sqlite');
}

function isPostgresUrl(url: string): boolean {
  return url.startsWith('postgres://') || url.startsWith('postgresql://');
}

async function ensureSqliteSchema(db: SqliteDb): Promise<void> {
  db.run(sql`
    CREATE TABLE IF NOT EXISTS documents (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (collection, id)
    )
  `);
}

async function ensurePostgresSchema(db: PostgresDb): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS documents (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (collection, id)
    )
  `);
}

/**
 * Open Drizzle-backed store. Sole process that may hold DATABASE_URL / SQL drivers.
 * Auth and customer APIs must use the HTTP client (ticket 22), not open drivers here.
 */
export async function createDb(
  options: CreateDbOptions = {},
): Promise<DbStoreContext> {
  const databaseUrl = options.databaseUrl ?? Bun.env.DATABASE_URL ?? undefined;

  if (databaseUrl && isPostgresUrl(databaseUrl)) {
    const client = postgres(databaseUrl, { max: 4 });
    const db = drizzlePostgres(client, { schema: { documents: pgDocuments } });
    await ensurePostgresSchema(db);
    return {
      dialect: 'postgres',
      db,
      client,
      close: async () => {
        await client.end({ timeout: 5 });
      },
    };
  }

  const databasePath =
    options.databasePath ??
    (databaseUrl && !isPostgresUrl(databaseUrl)
      ? databaseUrl.replace(/^file:/, '')
      : undefined) ??
    defaultSqlitePath();

  if (databasePath !== ':memory:') {
    mkdirSync(join(databasePath, '..'), { recursive: true });
  }

  const client = new Database(databasePath);
  const db = drizzleSqlite(client, { schema: { documents: sqliteDocuments } });
  await ensureSqliteSchema(db);

  return {
    dialect: 'sqlite',
    db,
    client,
    close: () => {
      client.close();
    },
  };
}
