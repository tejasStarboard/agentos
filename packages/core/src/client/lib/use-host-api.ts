import type { HostAPIClient } from '@agentos/core/sdk';
import { useHost } from './use-host';

/** Host-proxied HTTP fetch into the extension API gateway. */
export function useHostApi(): HostAPIClient['api'] {
  return useHost().api;
}
