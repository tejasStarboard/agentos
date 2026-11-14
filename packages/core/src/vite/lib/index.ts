/** @agentos/core/vite — Vite plugin + filesystem scanner. */

export {
  agentos,
  VIRTUAL_REGISTRY_ID,
  RESOLVED_VIRTUAL_REGISTRY_ID,
  resolveCorePackageRoot,
} from './agentos-plugin';
export { scanExtensions } from './scan-extensions';
export type {
  AgentFileName,
  AgentosPluginOptions,
  ApiLanguage,
  ExtensionKind,
  ExtensionMeta,
  ExtensionMetaApi,
  RegistryModel,
  ScannedExtension,
  ScanExtensionsOptions,
  UiViewName,
} from './types';
