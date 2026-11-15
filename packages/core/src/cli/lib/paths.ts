import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** `@agentos/core` package root (`packages/core`). */
export function corePackageRoot(fromImportMetaUrl = import.meta.url): string {
  // src/cli/lib → ../../../ = packages/core
  return join(dirname(fileURLToPath(fromImportMetaUrl)), '../../..');
}

/** Monorepo root (parent of `packages/`). */
export function repoRoot(fromImportMetaUrl = import.meta.url): string {
  return join(corePackageRoot(fromImportMetaUrl), '../..');
}
