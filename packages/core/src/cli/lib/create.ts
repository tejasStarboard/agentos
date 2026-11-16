import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  appNameFromTarget,
  applyAppIdentity,
  copyTemplateTree,
} from './copy-template';
import {
  DEFAULT_TEMPLATE,
  isTemplateId,
  resolveTemplateDir,
  type TemplateId,
} from './template-paths';

export type CreateOptions = {
  /** Destination directory (relative to cwd or absolute). */
  target: string;
  /** Template id (default `minimal`). */
  template?: string;
  /** Working directory used to resolve relative targets. */
  cwd?: string;
};

export type CreateResult = {
  targetDir: string;
  appName: string;
  template: TemplateId;
};

/**
 * Copy `templates/<id>` into a new consumer app directory and rewrite identity.
 */
export function runCreate(options: CreateOptions): CreateResult {
  const templateRaw = options.template ?? DEFAULT_TEMPLATE;
  if (!isTemplateId(templateRaw)) {
    throw new Error(
      `Unknown template "${templateRaw}". Use: minimal, with-extension, with-service`,
    );
  }
  const template = templateRaw;

  const baseCwd = options.cwd ?? process.cwd();
  const targetDir = resolve(baseCwd, options.target);
  if (existsSync(targetDir)) {
    throw new Error(`Target already exists: ${targetDir}`);
  }

  const appName = appNameFromTarget(targetDir);
  const templateDir = resolveTemplateDir(template);
  if (!existsSync(templateDir)) {
    throw new Error(`Template directory missing: ${templateDir}`);
  }

  copyTemplateTree(templateDir, targetDir);
  applyAppIdentity(targetDir, appName);

  return { targetDir, appName, template };
}

export function formatCreateNextSteps(result: CreateResult): string {
  const { targetDir, appName, template } = result;
  return [
    `Created ${appName} from template "${template}"`,
    `  → ${targetDir}`,
    '',
    'Next steps (monorepo):',
    '  1. Ensure the app path is under examples/ (or listed in pnpm-workspace.yaml)',
    '  2. From the repo root: pnpm install',
    `  3. cd ${targetDir}`,
    '  4. agentos dev',
  ].join('\n');
}
