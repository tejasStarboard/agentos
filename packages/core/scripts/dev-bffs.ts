/**
 * Spawn driving-builtin Bun API servers + customer Python services for local
 * `turbo run dev`. Stops all children on SIGINT / SIGTERM.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(packageRoot, '../..');
const defaultExtensionsDir = join(repoRoot, 'examples/client-app/extensions');

const servers = [
  { name: 'auth', entry: './builtins/auth/api/server.ts', port: 6110 },
  { name: 'db-store', entry: './builtins/db-store/api/server.ts', port: 6111 },
  {
    name: 'cache-store',
    entry: './builtins/cache-store/api/server.ts',
    port: 6112,
  },
  { name: 'ai', entry: './builtins/ai/api/server.ts', port: 6113 },
  { name: 'hitl', entry: './builtins/hitl/api/server.ts', port: 6114 },
  { name: 'events', entry: './builtins/events/api/server.ts', port: 6115 },
  { name: 'files', entry: './builtins/files/api/server.ts', port: 6116 },
  {
    name: 'notifications',
    entry: './builtins/notifications/api/server.ts',
    port: 6117,
  },
  { name: 'secrets', entry: './builtins/secrets/api/server.ts', port: 6118 },
  { name: 'audit', entry: './builtins/audit/api/server.ts', port: 6119 },
] as const;

/** Direct builtin bases so Python kits skip the Vite hop during local dev. */
function builtinApiEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const s of servers) {
    const key = `AGENT_OS_${s.name.toUpperCase().replace(/-/g, '_')}_API_BASE`;
    env[key] = `http://127.0.0.1:${s.port}`;
  }
  // auth / db-store / hitl use these exact override keys in agentos.http
  env.AGENT_OS_AUTH_API_BASE = 'http://127.0.0.1:6110';
  env.AGENT_OS_DB_STORE_API_BASE = 'http://127.0.0.1:6111';
  env.AGENT_OS_CACHE_STORE_API_BASE = 'http://127.0.0.1:6112';
  env.AGENT_OS_AI_API_BASE = 'http://127.0.0.1:6113';
  env.AGENT_OS_HITL_API_BASE = 'http://127.0.0.1:6114';
  env.AGENT_OS_GLOBAL_GATEWAY_URL =
    Bun.env.AGENT_OS_GLOBAL_GATEWAY_URL ?? 'http://127.0.0.1:5173';
  return env;
}

type PythonService = {
  id: string;
  resolvedRoot: string;
  port: number;
};

type ExtensionMeta = {
  api?: {
    language?: string;
    root?: string;
    port?: number;
  };
};

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function discoverPythonServices(extensionsDir: string): PythonService[] {
  if (!isDirectory(extensionsDir)) return [];

  const out: PythonService[] = [];
  for (const id of readdirSync(extensionsDir)) {
    const extDir = join(extensionsDir, id);
    if (!isDirectory(extDir)) continue;
    const metaPath = join(extDir, 'meta.json');
    if (!existsSync(metaPath)) continue;

    let meta: ExtensionMeta;
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf8')) as ExtensionMeta;
    } catch {
      console.warn(`[agentos core] skip ${id}: invalid meta.json`);
      continue;
    }

    if (meta.api?.language !== 'python') continue;
    if (typeof meta.api.root !== 'string' || !meta.api.root) {
      console.warn(`[agentos core] skip ${id}: python meta missing api.root`);
      continue;
    }
    if (typeof meta.api.port !== 'number') {
      console.warn(`[agentos core] skip ${id}: python meta missing api.port`);
      continue;
    }

    const resolvedRoot = resolve(extDir, meta.api.root);
    if (!isDirectory(resolvedRoot)) {
      console.warn(
        `[agentos core] skip ${id}: python service root missing: ${resolvedRoot}`,
      );
      continue;
    }

    out.push({ id, resolvedRoot, port: meta.api.port });
  }
  return out;
}

function pythonHasUvicorn(pythonBin: string): boolean {
  const result = Bun.spawnSync([pythonBin, '-c', 'import uvicorn'], {
    stdout: 'ignore',
    stderr: 'ignore',
  });
  return result.exitCode === 0;
}

function resolvePythonCmd(
  serviceRoot: string,
): { cmd: string[]; env: Record<string, string> } | null {
  const agentosPython = join(repoRoot, 'packages/python');
  const serviceVenvPython = join(serviceRoot, '.venv/bin/python');
  const kitVenvPython = join(agentosPython, '.venv/bin/python');
  const baseEnv = { ...builtinApiEnv() };
  const pythonPathEnv = {
    ...baseEnv,
    PYTHONPATH: [agentosPython, serviceRoot, Bun.env.PYTHONPATH]
      .filter(Boolean)
      .join(':'),
  };

  const candidates = [serviceVenvPython, kitVenvPython].filter(
    (bin) => existsSync(bin) && pythonHasUvicorn(bin),
  );

  if (candidates.length > 0) {
    return {
      cmd: [
        candidates[0]!,
        '-m',
        'uvicorn',
        'app.main:app',
        '--host',
        '127.0.0.1',
        '--port',
        'PORT',
      ],
      env: pythonPathEnv,
    };
  }

  const uv = Bun.which('uv');
  if (uv) {
    return {
      cmd: [
        uv,
        'run',
        'uvicorn',
        'app.main:app',
        '--host',
        '127.0.0.1',
        '--port',
        'PORT',
      ],
      env: baseEnv,
    };
  }

  return null;
}

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

const extensionsDir =
  Bun.env.AGENT_OS_EXTENSIONS_DIR?.trim() || defaultExtensionsDir;
const pythonServices = discoverPythonServices(extensionsDir);

if (pythonServices.length === 0) {
  console.log(`[agentos core] no python services found under ${extensionsDir}`);
} else {
  console.log(
    `[agentos core] starting ${pythonServices.length} python service(s)…`,
  );
}

for (const service of pythonServices) {
  const resolved = resolvePythonCmd(service.resolvedRoot);
  if (!resolved) {
    console.warn(
      `[agentos core] skip ${service.id}: no python/.venv or uv — install packages/python .venv or run uv sync in ${service.resolvedRoot}`,
    );
    continue;
  }

  const cmd = resolved.cmd.map((part) =>
    part === 'PORT' ? String(service.port) : part,
  );
  console.log(
    `[agentos ${service.id}] listening on http://127.0.0.1:${service.port} (proxy /api/ext/${service.id}/*)`,
  );
  const proc = Bun.spawn(cmd, {
    cwd: service.resolvedRoot,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: {
      ...Bun.env,
      ...resolved.env,
    },
  });
  children.push({ name: service.id, proc });
  void proc.exited.then((code) => {
    if (shuttingDown) return;
    // Keep builtins + Vite up if a sample Python service crashes.
    console.error(
      `[agentos core] python service ${service.id} exited with code ${code ?? 'null'} (builtins still running)`,
    );
  });
}

await Promise.race(children.map((c) => c.proc.exited));
