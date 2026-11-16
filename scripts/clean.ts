/**
 * Remove root install artifacts and leftover caches (JS + Python).
 * Package-level `clean` scripts run first via `turbo run clean`.
 */
import { existsSync, lstatSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');

const ROOT_DIRS = ['node_modules', 'dist', '.turbo', '.agentos'] as const;

const NESTED_DIR_NAMES = new Set([
  '.venv',
  '__pycache__',
  '.pytest_cache',
  '.ruff_cache',
  '.mypy_cache',
  '.turbo',
  'dist',
]);

function isEggInfo(name: string): boolean {
  return name.endsWith('.egg-info');
}

function shouldSkipDir(name: string): boolean {
  return name === '.git' || name === 'node_modules';
}

function removeNested(dir: string): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const name of entries) {
    const path = join(dir, name);
    let stat;
    try {
      stat = lstatSync(path);
    } catch {
      continue;
    }
    // Don't follow symlinks (e.g. examples/client-app/services → ../../services).
    if (stat.isSymbolicLink()) continue;
    if (!stat.isDirectory()) {
      if (name.endsWith('.tsbuildinfo') || name.endsWith('.pyc')) {
        rmSync(path, { force: true });
      }
      continue;
    }
    if (shouldSkipDir(name)) continue;
    if (NESTED_DIR_NAMES.has(name) || isEggInfo(name)) {
      rmSync(path, { recursive: true, force: true });
      continue;
    }
    removeNested(path);
  }
}

for (const name of ROOT_DIRS) {
  const path = join(root, name);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

removeNested(root);
console.log('[agentos] clean complete');
