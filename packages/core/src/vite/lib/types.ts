/** Builtin vs customer extension (matches Shell / virtual:agentos-registry). */
export type ExtensionKind = 'builtin' | 'customer';

/** API language from meta.json. */
export type ApiLanguage = 'bun' | 'python';

/** Parsed `meta.json` api block. */
export type ExtensionMetaApi = {
  language: ApiLanguage;
  port: number;
  routesDir?: string;
  /** Python service root, relative to the extension directory. */
  root?: string;
  health?: string;
};

/** Parsed `meta.json` (tolerant subset). */
export type ExtensionMeta = {
  name?: string;
  api?: ExtensionMetaApi;
};

export type UiViewName = 'page' | 'sidebar' | 'widget';
export type AgentFileName = 'tools' | 'skills' | 'instructions';

/** One discovered extension after a filesystem scan. */
export type ScannedExtension = {
  id: string;
  kind: ExtensionKind;
  /** Absolute path to the extension root. */
  rootDir: string;
  /** Display name from meta.json, falling back to folder id. */
  name: string;
  /** Absolute path to meta.json when present. */
  metaPath?: string;
  meta: ExtensionMeta;
  /** Absolute paths to discovered UI entry files. */
  ui: Partial<Record<UiViewName, string>>;
  /** Absolute paths to discovered agent declaration files. */
  agent: Partial<Record<AgentFileName, string>>;
  /** Absolute path to `api/routes` when present. */
  apiRoutesDir?: string;
  /** Resolved Python service link when `meta.api.language === 'python'`. */
  service?: {
    root: string;
    resolvedRoot: string;
    port: number;
    health?: string;
  };
};

/** In-memory registry model produced by the scanner. */
export type RegistryModel = {
  extensions: ScannedExtension[];
  scannedAt: number;
};

/** Options for {@link scanExtensions}. */
export type ScanExtensionsOptions = {
  /** Absolute path to customer extensions root (e.g. `<viteRoot>/extensions`). */
  extensionsDir: string;
  /** Absolute path to builtin extensions root (`packages/core/builtins`). */
  builtinsDir: string;
};

/** Options for the `agentos()` Vite plugin. */
export type AgentosPluginOptions = {
  /**
   * Customer extensions directory, relative to Vite `root`.
   * @default 'extensions'
   */
  extensionsDir?: string;
  /**
   * Absolute path to builtins. Defaults to `@agentos/core` package `builtins/`.
   */
  builtinsDir?: string;
};
