import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/** True when `root` looks like an AgentOS consumer app. */
export function isConsumerRoot(root: string): boolean {
  if (!isDirectory(root)) return false;
  if (
    existsSync(join(root, 'extensions')) &&
    isDirectory(join(root, 'extensions'))
  ) {
    return true;
  }
  for (const name of [
    'vite.config.ts',
    'vite.config.mts',
    'vite.config.js',
    'vite.config.mjs',
  ]) {
    if (existsSync(join(root, name))) return true;
  }
  return false;
}

export function resolveConsumerRoot(cwdOption?: string): string {
  const root = resolve(cwdOption ?? process.cwd());
  if (!isConsumerRoot(root)) {
    throw new Error(
      `agentos: not a consumer app root: ${root}\n` +
        `Expected an extensions/ directory or vite.config.* (use --cwd).`,
    );
  }
  return root;
}

export function resolveExtensionsDir(consumerRoot: string): string {
  const override = Bun.env.AGENT_OS_EXTENSIONS_DIR?.trim();
  if (override) return resolve(override);
  return join(consumerRoot, 'extensions');
}

export function readPackageName(consumerRoot: string): string | null {
  const pkgPath = join(consumerRoot, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string };
    return typeof pkg.name === 'string' && pkg.name ? pkg.name : null;
  } catch {
    return null;
  }
}
