import type { HostAPIClient } from '@agentos/core/sdk';
import { useHost } from './use-host';

/** Host AI generateText surface. */
export function useHostAI(): HostAPIClient['ai'] {
  return useHost().ai;
}
