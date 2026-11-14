/** @agentos/core/vite — Vite plugin + filesystem scanner. */

export {
  agentos,
  VIRTUAL_REGISTRY_ID,
  RESOLVED_VIRTUAL_REGISTRY_ID,
  EXT_HTML_PREFIX,
  VIRTUAL_EXT_ENTRY_PREFIX,
  parseExtHtmlPath,
  parseVirtualExtEntryId,
  renderExtHtmlEntry,
  resolvedVirtualExtEntryId,
  resolveCorePackageRoot,
  virtualExtEntryId,
  virtualExtEntryScriptSrc,
} from './agentos-plugin';
export { serializeExtEntryModule } from './ext-entry-module';
export { enrichExtension, enrichRegistry, uiEntryUrl } from './enrich-registry';
export { scanExtensions } from './scan-extensions';
export {
  serializeRegistryModule,
  skillsBindingName,
} from './serialize-registry';
export type {
  AgentDescriptors,
  AgentFileName,
  AgentosPluginOptions,
  ApiLanguage,
  ExtensionKind,
  ExtensionMeta,
  ExtensionMetaApi,
  RegistryModel,
  ScannedExtension,
  ScanExtensionsOptions,
  ToolDescriptor,
  UiViewName,
} from './types';
