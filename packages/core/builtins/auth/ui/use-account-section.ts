import { useCallback, useEffect, useState } from 'react';
import { useHostStorage } from '@agentos/core/client';

import {
  ACCOUNT_SECTION_CHANNEL,
  ACCOUNT_SECTION_STORAGE_KEY,
  DEFAULT_ACCOUNT_SECTION,
  parseAccountSection,
  type AccountSection,
} from './account-section';

/**
 * Shared account section selection across Auth page + sidebar iframes.
 * Persists via host storage; live-syncs with BroadcastChannel.
 */
export function useAccountSection(): [
  AccountSection,
  (section: AccountSection) => Promise<void>,
] {
  const storage = useHostStorage();
  const [section, setSection] = useState<AccountSection>(
    DEFAULT_ACCOUNT_SECTION,
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await storage.get(ACCOUNT_SECTION_STORAGE_KEY);
      if (!cancelled) {
        setSection(parseAccountSection(stored));
      }
    })();

    const channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(ACCOUNT_SECTION_CHANNEL)
        : null;

    if (channel) {
      channel.onmessage = (event: MessageEvent) => {
        setSection(parseAccountSection(event.data));
      };
    }

    return () => {
      cancelled = true;
      channel?.close();
    };
  }, [storage]);

  const selectSection = useCallback(
    async (next: AccountSection) => {
      setSection(next);
      await storage.set(ACCOUNT_SECTION_STORAGE_KEY, next);
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(ACCOUNT_SECTION_CHANNEL);
        channel.postMessage(next);
        channel.close();
      }
    },
    [storage],
  );

  return [section, selectSection];
}
