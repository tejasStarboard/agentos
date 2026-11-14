import type { HostAPIClient } from '@agentos/core/sdk';
import { useHost } from './use-host';

/** Host-backed key/value storage for the current extension. */
export function useHostStorage(): HostAPIClient['storage'] {
  return useHost().storage;
}
