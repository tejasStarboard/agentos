/**
 * Sync Python envs with uv (packages/python + services/*).
 * Invoked from root postinstall so `pnpm install` also installs Python deps.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');

const uv = Bun.which('uv');
if (!uv) {
  console.warn(
    '[agentos] uv not found — skipping Python sync. Install: https://github.com/astral-sh/uv',
  );
  process.exit(0);
}

async function sync(relDir: string, extraArgs: string[] = []): Promise<void> {
  const cwd = join(root, relDir);
  console.log(`[agentos] uv sync → ${relDir}`);
  const proc = Bun.spawn([uv, 'sync', ...extraArgs], {
    cwd,
    stdout: 'inherit',
    stderr: 'inherit',
  });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`uv sync failed in ${relDir} (exit ${code})`);
  }
}

await sync('packages/python', ['--extra', 'dev']);

const servicesDir = join(root, 'services');
if (existsSync(servicesDir)) {
  for (const name of readdirSync(servicesDir)) {
    if (!existsSync(join(servicesDir, name, 'pyproject.toml'))) continue;
    await sync(join('services', name));
  }
}
