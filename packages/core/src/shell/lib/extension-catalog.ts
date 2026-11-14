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
