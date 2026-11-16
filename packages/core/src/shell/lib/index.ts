export {
  ACTIVITY_BAR_STORAGE_KEY,
  readStoredActivity,
  restoreStoredActivity,
  writeStoredActivity,
  type StoredActivitySelection,
} from './activity-bar-persistence';
export { applyBranding, isFontUrl } from './apply-branding';
export {
  AUTH_API_BASE,
  fetchAuthSession,
  requestPasswordReset,
  resetPasswordWithToken,
  signInWithEmail,
  signOutSession,
  signUpWithEmail,
  type AuthSessionOk,
  type AuthSessionView,
} from './auth-api';
export {
  isPublicAuthPath,
  loginPathWithNext,
  matchPublicAuthRoute,
  navigateApp,
  normalizePathname,
  readNextParam,
  readResetToken,
  type AuthRouteFlags,
  type PublicAuthRoute,
} from './auth-routes';
export {
  applyRegistry,
  mapRegistry,
  type AppliedRegistry,
} from './apply-registry';
export {
  buildActivityBarSections,
  type ActivityBarItem,
  type ActivityBarSections,
  type ActivityBarShellPanel,
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
  type SidebarPanel,
} from './store';
export { withThemeQuery } from './with-theme-query';
