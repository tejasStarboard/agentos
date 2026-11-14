import type { Database } from 'bun:sqlite';

import { PERMISSION_ADMIN_ONLY, PERMISSION_ALL } from './constants';

/** Ensure RBAC tables exist on the shared SQLite connection. */
export function ensureRbacSchema(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      PRIMARY KEY (user_id, role)
    );
    CREATE TABLE IF NOT EXISTS role_permissions (
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      PRIMARY KEY (role, permission)
    );
  `);
}

/** Seed default role → permission rows (idempotent). */
export function seedRolePermissions(db: Database): void {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO role_permissions (role, permission) VALUES (?, ?)`,
  );
  insert.run('admin', PERMISSION_ALL);
  insert.run('admin', PERMISSION_ADMIN_ONLY);
  insert.run('viewer', 'auth.session.read');
}

export function assignUserRole(
  db: Database,
  userId: string,
  role: string,
): void {
  db.prepare(
    `INSERT OR IGNORE INTO user_roles (user_id, role) VALUES (?, ?)`,
  ).run(userId, role);
}

export function listRolesForUser(db: Database, userId: string): string[] {
  const rows = db
    .prepare(`SELECT role FROM user_roles WHERE user_id = ?`)
    .all(userId) as Array<{ role: string }>;
  return rows.map((r) => r.role);
}

/** True when any of the user's roles grants `permission` or `*`. */
export function userHasPermission(
  db: Database,
  userId: string,
  permission: string,
): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS ok
       FROM user_roles ur
       JOIN role_permissions rp ON rp.role = ur.role
       WHERE ur.user_id = ?
         AND (rp.permission = ? OR rp.permission = ?)
       LIMIT 1`,
    )
    .get(userId, permission, PERMISSION_ALL) as { ok: number } | null;
  return row != null;
}
