import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from './paths';

export const TEMPLATE_IDS = [
  'minimal',
  'with-extension',
  'with-service',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const DEFAULT_TEMPLATE: TemplateId = 'minimal';

export function isTemplateId(value: string): value is TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(value);
}

/** Absolute path to `templates/<id>` under the monorepo root. */
export function resolveTemplateDir(
  id: TemplateId,
  fromImportMetaUrl = import.meta.url,
): string {
  return join(repoRoot(fromImportMetaUrl), 'templates', id);
}

/** List template ids that exist on disk under `templates/`. */
export function listAvailableTemplates(
  fromImportMetaUrl = import.meta.url,
): TemplateId[] {
  const root = join(repoRoot(fromImportMetaUrl), 'templates');
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    return [];
  }
  return readdirSync(root).filter(
    (name): name is TemplateId =>
      isTemplateId(name) &&
      existsSync(join(root, name)) &&
      statSync(join(root, name)).isDirectory(),
  );
}
