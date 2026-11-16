import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';

const SKIP_NAMES = new Set([
  'node_modules',
  '.git',
  'dist',
  '.turbo',
  '__pycache__',
  '.venv',
]);

/**
 * Recursively copy `srcDir` → `destDir`, skipping install/build artifacts.
 */
export function copyTemplateTree(srcDir: string, destDir: string): void {
  if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) {
    throw new Error(`Template not found: ${srcDir}`);
  }
  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    if (SKIP_NAMES.has(name)) continue;
    const from = join(srcDir, name);
    const to = join(destDir, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      copyTemplateTree(from, to);
      continue;
    }
    cpSync(from, to);
  }
}

/** Rewrite package.json `name` and README `__APP_NAME__` placeholders. */
export function applyAppIdentity(destDir: string, appName: string): void {
  const pkgPath = join(destDir, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as Record<
      string,
      unknown
    >;
    pkg.name = appName;
    if (typeof pkg.description === 'string') {
      pkg.description = (pkg.description as string).replaceAll(
        '__APP_NAME__',
        appName,
      );
    }
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  const readmePath = join(destDir, 'README.md');
  if (existsSync(readmePath)) {
    const text = readFileSync(readmePath, 'utf8').replaceAll(
      '__APP_NAME__',
      appName,
    );
    writeFileSync(readmePath, text);
  }
}

/** Derive a package/folder-friendly name from the destination path. */
export function appNameFromTarget(targetDir: string): string {
  const base = basename(targetDir);
  if (!base || base === '.' || base === '..') {
    throw new Error('Invalid app directory name');
  }
  return base;
}
