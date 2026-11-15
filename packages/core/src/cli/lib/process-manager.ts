import { pipePrefixed, writeStderr, writeStdout } from './prefix-logs';

export type ChildSpec = {
  name: string;
  cmd: string[];
  cwd: string;
  env?: Record<string, string>;
  /** When true, child exit triggers full shutdown. */
  fatalOnExit: boolean;
};

type TrackedChild = {
  name: string;
  fatalOnExit: boolean;
  proc: ReturnType<typeof Bun.spawn>;
};

export type ProcessManagerOptions = {
  /** Prefix child logs with `[name]`. Default true. */
  prefixLogs?: boolean;
};

/**
 * Concurrent child process supervisor for `agentos dev`.
 * SIGINT / SIGTERM kill all children.
 */
export class ProcessManager {
  private readonly children: TrackedChild[] = [];
  private shuttingDown = false;
  private readonly prefixLogs: boolean;
  private exitResolve: (() => void) | null = null;
  private readonly exitPromise: Promise<void>;

  constructor(options: ProcessManagerOptions = {}) {
    this.prefixLogs = options.prefixLogs !== false;
    this.exitPromise = new Promise((resolve) => {
      this.exitResolve = resolve;
    });
  }

  get childCount(): number {
    return this.children.length;
  }

  spawn(spec: ChildSpec): void {
    const env = {
      ...Bun.env,
      ...spec.env,
    } as Record<string, string | undefined>;

    const stdoutMode = this.prefixLogs
      ? ('pipe' as const)
      : ('inherit' as const);
    const stderrMode = this.prefixLogs
      ? ('pipe' as const)
      : ('inherit' as const);

    const proc = Bun.spawn(spec.cmd, {
      cwd: spec.cwd,
      env,
      stdin: 'inherit',
      stdout: stdoutMode,
      stderr: stderrMode,
    });

    this.children.push({
      name: spec.name,
      fatalOnExit: spec.fatalOnExit,
      proc,
    });

    if (this.prefixLogs) {
      void pipePrefixed(proc.stdout, spec.name, writeStdout);
      void pipePrefixed(proc.stderr, spec.name, writeStderr);
    }

    void proc.exited.then((code) => {
      if (this.shuttingDown) return;
      if (spec.fatalOnExit) {
        console.error(
          `[agentos] ${spec.name} exited with code ${code ?? 'null'}`,
        );
        this.shutdown(`${spec.name} exit`);
        return;
      }
      console.error(
        `[agentos] ${spec.name} exited with code ${code ?? 'null'} (other processes still running)`,
      );
    });
  }

  installSignalHandlers(): void {
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
  }

  shutdown(signal: string): void {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    console.log(`[agentos] shutting down (${signal})…`);
    for (const child of this.children) {
      try {
        child.proc.kill();
      } catch {
        // already exited
      }
    }
    this.exitResolve?.();
  }

  /** Resolves when shutdown is requested (or immediately if already shut down). */
  waitForShutdown(): Promise<void> {
    if (this.shuttingDown) return Promise.resolve();
    return this.exitPromise;
  }

  /**
   * Wait until the first child exits, then shut down if needed.
   * Used by the BFF-only escape hatch that has no long-lived parent work.
   */
  async waitUntilAnyExit(): Promise<void> {
    if (this.children.length === 0) return;
    await Promise.race([
      this.waitForShutdown(),
      ...this.children.map((c) => c.proc.exited),
    ]);
    if (!this.shuttingDown) {
      this.shutdown('child exit');
    }
  }
}
