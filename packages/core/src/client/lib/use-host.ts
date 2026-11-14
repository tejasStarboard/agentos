import { useContext } from 'react';
import type { HostAPIClient } from '@agentos/core/sdk';
import { HostContext } from './host-context';

/**
 * Read the HostAPI client from context.
 * @throws when called outside `HostProvider`, or before the host is ready.
 */
export function useHost(): HostAPIClient {
  const host = useContext(HostContext);
  if (!host) {
    throw new Error(
      'Host API hooks require HostProvider. Import HostProvider from @agentos/core/client and wrap the extension UI tree.',
    );
  }
  return host;
}
