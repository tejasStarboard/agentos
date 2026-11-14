/**
 * Spawn driving-builtin Bun API servers for local `turbo run dev`.
 * Stops all children on SIGINT / SIGTERM.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const servers = [
  { name: 'auth', entry: './builtins/auth/api/server.ts' },
  { name: 'db-store', entry: './builtins/db-store/api/server.ts' },
  { name: 'cache-store', entry: './builtins/cache-store/api/server.ts' },
  { name: 'ai', entry: './builtins/ai/api/server.ts' },
] as const;

const children: Array<{ name: string; proc: ReturnType<typeof Bun.spawn> }> =
  [];

let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[agentos core] shutting down BFFs (${signal})…`);
  for (const child of children) {
    try {
      child.proc.kill();
    } catch {
      // already exited
    }
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

console.log('[agentos core] starting builtin BFFs…');

for (const server of servers) {
  const proc = Bun.spawn(['bun', server.entry], {
    cwd: packageRoot,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: Bun.env,
  });
  children.push({ name: server.name, proc });
  void proc.exited.then((code) => {
    if (shuttingDown) return;
    console.error(
      `[agentos core] BFF ${server.name} exited with code ${code ?? 'null'}`,
    );
    shutdown(`BFF ${server.name} exit`);
  });
}

await Promise.race(children.map((c) => c.proc.exited));
