/** Builtin vs customer extension (matches future virtual:agentos-registry). */
export type ExtensionKind = 'builtin' | 'customer';

/** One row in the Extension Manager list. */
export type ExtensionEntry = {
  id: string;
  name: string;
  kind: ExtensionKind;
  /** Builtins are never toggleable. */
  toggleable: boolean;
};

/**
 * Manager-facing lifecycle status for an extension.
 * Frame-level status stays `loading | active | crashed`; `disabled` is extension-level.
 */
export type ExtensionManagerStatus =
  'active' | 'disabled' | 'crashed' | 'loading';

/**
 * Stub catalog until ticket 11 (`virtual:agentos-registry`).
 * Builtins match `.project/docs/builtins.md` driving set.
 */
export const STUB_EXTENSION_CATALOG: ExtensionEntry[] = [
  { id: 'auth', name: 'Auth', kind: 'builtin', toggleable: false },
  { id: 'db-store', name: 'DB Store', kind: 'builtin', toggleable: false },
  {
    id: 'cache-store',
    name: 'Cache Store',
    kind: 'builtin',
    toggleable: false,
  },
  { id: 'ai', name: 'AI', kind: 'builtin', toggleable: false },
  { id: 'crm', name: 'CRM', kind: 'customer', toggleable: true },
  { id: 'invoices', name: 'Invoices', kind: 'customer', toggleable: true },
];

/** Default enable map: every catalog entry starts enabled. */
export function defaultEnabledById(
  extensions: ExtensionEntry[] = STUB_EXTENSION_CATALOG,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const ext of extensions) {
    out[ext.id] = true;
  }
  return out;
}

/**
 * Stub skills until the Vite scanner / registry (tickets 10–11) fills them.
 * Keys are extension ids from {@link STUB_EXTENSION_CATALOG}.
 */
export const STUB_SKILLS_BY_EXTENSION: Record<string, string[]> = {
  crm: ['search-contacts', 'create-contact'],
  invoices: ['list-invoices', 'create-invoice'],
};

/** Skills for currently enabled extensions (from stub map). */
export function defaultSkillsByExtension(
  enabledById: Record<string, boolean> = defaultEnabledById(),
  stubs: Record<string, string[]> = STUB_SKILLS_BY_EXTENSION,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [extensionId, skills] of Object.entries(stubs)) {
    if (enabledById[extensionId] !== false) {
      out[extensionId] = [...skills];
    }
  }
  return out;
}

export type PaletteSkill = {
  extensionId: string;
  extensionName: string;
  skill: string;
};

/** Flatten enabled-extension skills for the command palette. */
export function collectEnabledSkills(
  skillsByExtension: Record<string, string[]>,
  enabledById: Record<string, boolean>,
  extensions: ExtensionEntry[] = STUB_EXTENSION_CATALOG,
): PaletteSkill[] {
  const nameById = new Map(extensions.map((e) => [e.id, e.name]));
  const items: PaletteSkill[] = [];
  for (const [extensionId, skills] of Object.entries(skillsByExtension)) {
    if (enabledById[extensionId] === false) continue;
    const extensionName = nameById.get(extensionId) ?? extensionId;
    for (const skill of skills) {
      items.push({ extensionId, extensionName, skill });
    }
  }
  return items;
}
