import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { betterAuth, type Auth } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { Database } from 'bun:sqlite';

import { AUTH_PORT, DEMO_ADMIN, DEMO_VIEWER } from './constants';
import type { PermissionCacheConfig } from './permission-cache';
import {
  assignUserRole,
  ensureRbacSchema,
  seedRolePermissions,
} from './rbac-store';

export type AuthSqlite = Database;

export type CreateAuthOptions = {
  /** SQLite path, or `:memory:` for tests. */
  databasePath?: string;
  baseURL?: string;
  secret?: string;
  /** When false, skip demo user seed (tests that sign up themselves). */
  seedDemoUsers?: boolean;
  /** Optional soft-fail permission cache via cache-store. */
  permissionCache?: PermissionCacheConfig;
};

export type AuthContext = {
  auth: Auth;
  db: AuthSqlite;
  permissionCache?: PermissionCacheConfig;
};

const DEFAULT_SECRET = 'agentos-dev-auth-secret-min-32-chars!!';

/** Default local store: `~/.agentos/store/auth.sqlite` (override with AGENT_OS_EXT_AUTH_DB). */
function defaultDatabasePath(): string {
  return join(homedir(), '.agentos', 'store', 'auth.sqlite');
}

function openDatabase(databasePath: string): AuthSqlite {
  if (databasePath !== ':memory:') {
    mkdirSync(join(databasePath, '..'), { recursive: true });
  }
  return new Database(databasePath);
}

function findUserIdByEmail(db: AuthSqlite, email: string): string | null {
  const row = db
    .prepare(`SELECT id FROM user WHERE email = ? LIMIT 1`)
    .get(email) as { id: string } | null;
  return row?.id ?? null;
}

async function seedDemoUser(
  auth: Auth,
  db: AuthSqlite,
  demo: typeof DEMO_ADMIN | typeof DEMO_VIEWER,
): Promise<void> {
  let userId = findUserIdByEmail(db, demo.email);
  if (!userId) {
    try {
      const created = await auth.api.signUpEmail({
        body: {
          email: demo.email,
          password: demo.password,
          name: demo.name,
        },
      });
      userId = created?.user?.id ?? findUserIdByEmail(db, demo.email);
    } catch {
      userId = findUserIdByEmail(db, demo.email);
    }
  }
  if (userId) {
    assignUserRole(db, userId, demo.role);
  }
}

/**
 * Build Better Auth + local RBAC store (temp SQLite until ticket 16 / db-store).
 */
export async function createAuth(
  options: CreateAuthOptions = {},
): Promise<AuthContext> {
  const databasePath = options.databasePath ?? defaultDatabasePath();
  const db = openDatabase(databasePath);
  const baseURL = options.baseURL ?? `http://127.0.0.1:${AUTH_PORT}`;
  const secret = options.secret ?? DEFAULT_SECRET;

  const betterAuthOptions = {
    database: db,
    baseURL,
    secret,
    emailAndPassword: { enabled: true },
    trustedOrigins: [baseURL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    advanced: {
      useSecureCookies: false,
      defaultCookieAttributes: {
        sameSite: 'lax' as const,
        secure: false,
        httpOnly: true,
        path: '/',
      },
    },
  };

  const { runMigrations } = await getMigrations(betterAuthOptions);
  await runMigrations();

  ensureRbacSchema(db);
  seedRolePermissions(db);

  const auth = betterAuth(betterAuthOptions) as Auth;

  if (options.seedDemoUsers !== false) {
    await seedDemoUser(auth, db, DEMO_ADMIN);
    await seedDemoUser(auth, db, DEMO_VIEWER);
  }

  return { auth, db, permissionCache: options.permissionCache };
}
