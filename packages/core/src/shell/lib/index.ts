export {
  applyRegistry,
  mapRegistry,
  type AppliedRegistry,
} from './apply-registry';
export {
  buildActivityBarSections,
  type ActivityBarItem,
  type ActivityBarSections,
} from './build-activity-bar-items';
export {
  contributionKey,
  type ContributionRuntimeStatus,
  type ExtensionView,
  type UiContribution,
} from './contribution';
export {
  createShellHostApi,
  resetShellHostApiStorage,
} from './create-shell-host-api';
export {
  collectEnabledSkills,
  defaultEnabledById,
  defaultSkillsByExtension,
  resolveActivityBarSection,
  STUB_EXTENSION_CATALOG,
  STUB_SKILLS_BY_EXTENSION,
  type ActivityBarSection,
  type ExtensionEntry,
  type ExtensionKind,
  type ExtensionManagerStatus,
  type PaletteSkill,
} from './extension-catalog';
export { requestExtensionEnable } from './extension-enable';
export {
  activateFrame,
  deactivateFrame,
  listenForReady,
  type ActivatedFrame,
  type ActivateFrameOptions,
} from './extension-runtime';
export { deriveExtensionManagerStatus } from './extension-status';
export {
  DEFAULT_EXTENSION_ICON,
  EXTENSION_ICON_MAP,
  normalizeExtensionIconName,
  resolveExtensionIcon,
  type ExtensionIconName,
} from './resolve-extension-icon';
export {
  useShellStore,
  type ChatMessage,
  type ShellUiState,
  type ShellView,
} from './store';
export { withThemeQuery } from './with-theme-query';
