import type { HostAPIClient } from '@agentos/core/sdk';
import { useHost } from './use-host';

/** Host human-in-the-loop approval surface. */
export function useHostHITL(): HostAPIClient['hitl'] {
  return useHost().hitl;
}
