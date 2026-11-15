import { readPackageName, resolveConsumerRoot } from './resolve-consumer';

export type BuildOptions = {
  cwd?: string;
};

/**
 * Build workspace dependencies (via Turbo filter) then the consumer Vite app.
 */
export async function runBuild(options: BuildOptions = {}): Promise<void> {
  const consumerRoot = resolveConsumerRoot(options.cwd);
  const packageName = readPackageName(consumerRoot);

  if (packageName) {
    // `^...` = dependencies only (core, ui, …); consumer Vite build runs next.
    console.log(
      `[agentos] building workspace dependencies for ${packageName}…`,
    );
    const turbo = Bun.spawn(
      ['pnpm', 'exec', 'turbo', 'run', 'build', `--filter=${packageName}^...`],
      {
        cwd: consumerRoot,
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
        env: Bun.env,
      },
    );
    const turboCode = await turbo.exited;
    if (turboCode !== 0) {
      throw new Error(`agentos build: turbo exited with code ${turboCode}`);
    }
  } else {
    console.warn(
      '[agentos] no package.json name; skipping turbo workspace build',
    );
  }

  console.log(`[agentos] vite build in ${consumerRoot}…`);
  const vite = Bun.spawn(['bunx', '--bun', 'vite', 'build'], {
    cwd: consumerRoot,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
    env: Bun.env,
  });
  const viteCode = await vite.exited;
  if (viteCode !== 0) {
    throw new Error(`agentos build: vite build exited with code ${viteCode}`);
  }

  console.log('[agentos] build complete');
}
