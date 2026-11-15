import { BUILTIN_SERVERS, builtinApiEnv } from './builtin-servers';
import {
  discoverBunApis,
  discoverPythonServices,
  resolvePythonCmd,
} from './discover-extensions';
import { corePackageRoot, repoRoot } from './paths';
import { ProcessManager } from './process-manager';
import { resolveConsumerRoot, resolveExtensionsDir } from './resolve-consumer';

export type DevOptions = {
  /** Consumer app root override (`--cwd`). */
  cwd?: string;
  /** When false, skip Vite (BFF-only mode for escape hatch). Default true. */
  startVite?: boolean;
  /** Prefix child logs. Default true. */
  prefixLogs?: boolean;
};

/**
 * Start the local AgentOS stack: builtins, customer Bun APIs, Python services,
 * and (by default) the Vite Shell/gateway.
 */
export async function runDev(options: DevOptions = {}): Promise<void> {
  const consumerRoot = resolveConsumerRoot(options.cwd);
  const extensionsDir = resolveExtensionsDir(consumerRoot);
  const packageRoot = corePackageRoot();
  const root = repoRoot();
  const startVite = options.startVite !== false;

  const pm = new ProcessManager({ prefixLogs: options.prefixLogs });
  pm.installSignalHandlers();

  console.log(`[agentos] consumer: ${consumerRoot}`);
  console.log(`[agentos] starting builtin APIs…`);

  for (const server of BUILTIN_SERVERS) {
    pm.spawn({
      name: server.name,
      cmd: ['bun', server.entry],
      cwd: packageRoot,
      fatalOnExit: true,
    });
  }

  const bunApis = discoverBunApis(extensionsDir);
  if (bunApis.length === 0) {
    console.log(`[agentos] no customer Bun APIs under ${extensionsDir}`);
  } else {
    console.log(`[agentos] starting ${bunApis.length} customer Bun API(s)…`);
  }
  for (const api of bunApis) {
    console.log(
      `[agentos] ${api.id} → http://127.0.0.1:${api.port} (proxy /api/ext/${api.id}/*)`,
    );
    pm.spawn({
      name: api.id,
      cmd: ['bun', api.serverEntry],
      cwd: consumerRoot,
      fatalOnExit: false,
    });
  }

  const pythonServices = discoverPythonServices(extensionsDir);
  const pyEnv = builtinApiEnv();
  if (pythonServices.length === 0) {
    console.log(`[agentos] no python services under ${extensionsDir}`);
  } else {
    console.log(
      `[agentos] starting ${pythonServices.length} python service(s)…`,
    );
  }
  for (const service of pythonServices) {
    const resolved = resolvePythonCmd(service.resolvedRoot, root, pyEnv);
    if (!resolved) {
      console.warn(
        `[agentos] skip ${service.id}: no python/.venv or uv — install packages/python .venv or run uv sync in ${service.resolvedRoot}`,
      );
      continue;
    }
    const cmd = resolved.cmd.map((part) =>
      part === 'PORT' ? String(service.port) : part,
    );
    console.log(
      `[agentos] ${service.id} → http://127.0.0.1:${service.port} (proxy /api/ext/${service.id}/*)`,
    );
    pm.spawn({
      name: service.id,
      cmd,
      cwd: service.resolvedRoot,
      env: resolved.env,
      fatalOnExit: false,
    });
  }

  if (startVite) {
    console.log(`[agentos] starting Vite Shell…`);
    pm.spawn({
      name: 'vite',
      cmd: ['bunx', '--bun', 'vite'],
      cwd: consumerRoot,
      fatalOnExit: true,
    });
  }

  if (pm.childCount === 0) {
    console.error('[agentos] nothing to start');
    process.exitCode = 1;
    return;
  }

  await pm.waitForShutdown();
  // Give children a moment; ProcessManager already killed them.
  process.exit(0);
}
