import type { HostAPIClient } from '@agentos/core/sdk';
import { useHost } from './use-host';

/** Host toast / notification surface. */
export function useHostNotifications(): HostAPIClient['notifications'] {
  return useHost().notifications;
}
