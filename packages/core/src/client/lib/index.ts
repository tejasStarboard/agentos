/** @agentos/core/client — extension UI SDK (HostProvider + host hooks). */

export {
  HostProvider,
  type HostProviderProps,
} from '../components/host-provider';

export { useHostStorage } from './use-host-storage';
export { useHostAI } from './use-host-ai';
export { useHostHITL } from './use-host-hitl';
export { useHostNotifications } from './use-host-notifications';
export { useHostApi } from './use-host-api';

export type {
  AiGenerateOptions,
  AiGenerateResult,
  EventPayload,
  HostAPIClient,
  HostFetchInit,
  HostFetchResponse,
  HitlApprovalRequest,
  HitlApprovalResult,
  NotificationType,
  StorageValue,
} from '@agentos/core/sdk';
