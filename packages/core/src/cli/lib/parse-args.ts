/** Parse `agentos` CLI argv into a command + options. */

export type CliCommand = 'dev' | 'build' | 'help';

export type ParsedArgs = {
  command: CliCommand | null;
  cwd: string | undefined;
  unknown: string[];
  helpRequested: boolean;
};

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  let command: CliCommand | null = null;
  let cwd: string | undefined;
  const unknown: string[] = [];
  let helpRequested = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--help' || arg === '-h') {
      helpRequested = true;
      continue;
    }
    if (arg === '--cwd') {
      const value = args[++i];
      if (!value) {
        unknown.push('--cwd');
        continue;
      }
      cwd = value;
      continue;
    }
    if (arg.startsWith('--cwd=')) {
      cwd = arg.slice('--cwd='.length) || undefined;
      continue;
    }
    if (arg === 'dev' || arg === 'build' || arg === 'help') {
      if (command === null) {
        command = arg;
      } else {
        unknown.push(arg);
      }
      continue;
    }
    unknown.push(arg);
  }

  if (helpRequested && command === null) {
    command = 'help';
  }

  return { command, cwd, unknown, helpRequested };
}

export function usage(): string {
  return `Usage: agentos <command> [options]

Commands:
  dev     Start Vite Shell, builtin APIs, customer Bun APIs, and Python services
  build   Build the consumer app and required workspace packages
  help    Show this message

Options:
  --cwd <path>   Consumer app root (default: current working directory)
  -h, --help     Show this message
`;
}
