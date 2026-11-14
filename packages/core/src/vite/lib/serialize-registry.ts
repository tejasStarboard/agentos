import type { RegistryModel, ScannedExtension } from './types';

/** Safe JS identifier fragment from an extension id (`db-store` → `db_store`). */
export function skillsBindingName(extensionId: string): string {
  const safe = extensionId.replace(/[^a-zA-Z0-9_]/g, '_');
  return `__agentos_skills_${safe}`;
}

function skillsPlaceholder(extensionId: string): string {
  return `__AGENTOS_SKILLS__${extensionId}__`;
}

/**
 * Emit the virtual module source for `virtual:agentos-registry`.
 * Skills files are statically imported so Vite can resolve `export const skills`.
 */
export function serializeRegistryModule(model: RegistryModel): string {
  const imports: string[] = [];
  const skillsByExt = new Map<string, string>();

  for (const ext of model.extensions) {
    const skillsPath = ext.agent.skills;
    if (!skillsPath) continue;
    const binding = skillsBindingName(ext.id);
    skillsByExt.set(ext.id, binding);
    imports.push(
      `import { skills as ${binding} } from ${JSON.stringify(skillsPath)};`,
    );
  }

  const payload = {
    scannedAt: model.scannedAt,
    extensions: model.extensions.map((ext) =>
      extensionForJson(ext, skillsByExt.get(ext.id)),
    ),
  };

  let body = JSON.stringify(payload, null, 2);
  for (const [extensionId, binding] of skillsByExt) {
    body = body.replaceAll(
      JSON.stringify(skillsPlaceholder(extensionId)),
      binding,
    );
  }

  const lines = [...imports];
  if (imports.length > 0) lines.push('');
  lines.push(`export const registry = ${body};`, '');
  return lines.join('\n');
}

/** JSON-serializable extension; skills may be a placeholder string. */
function extensionForJson(
  ext: ScannedExtension,
  skillsBinding: string | undefined,
): Record<string, unknown> {
  return {
    ...ext,
    agentDescriptors: {
      tools: ext.agentDescriptors.tools,
      // Placeholder string → import binding after stringify.
      skills: skillsBinding ? skillsPlaceholder(ext.id) : [],
    },
  };
}
