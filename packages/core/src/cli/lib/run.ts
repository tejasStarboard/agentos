import { runBuild } from './build';
import { runDev } from './dev';
import { parseArgs, usage } from './parse-args';

export async function main(argv: string[] = Bun.argv): Promise<number> {
  const parsed = parseArgs(argv);

  if (parsed.unknown.length > 0) {
    console.error(`agentos: unknown argument(s): ${parsed.unknown.join(' ')}`);
    console.error(usage());
    return 1;
  }

  if (parsed.command === null) {
    console.error('agentos: missing command');
    console.error(usage());
    return 1;
  }

  if (parsed.command === 'help' || parsed.helpRequested) {
    console.log(usage());
    return 0;
  }

  try {
    if (parsed.command === 'dev') {
      await runDev({ cwd: parsed.cwd });
      return 0;
    }
    if (parsed.command === 'build') {
      await runBuild({ cwd: parsed.cwd });
      return 0;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    return 1;
  }

  console.error(usage());
  return 1;
}
