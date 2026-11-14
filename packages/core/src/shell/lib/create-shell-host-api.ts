import type { HostAPI, StorageValue } from '@agentos/core/sdk';

/** In-memory storage shared across stub HostAPI instances (keyed by extension). */
const storageByExtension = new Map<string, Map<string, StorageValue>>();

function storageFor(extensionId: string): Map<string, StorageValue> {
  let store = storageByExtension.get(extensionId);
  if (!store) {
    store = new Map();
    storageByExtension.set(extensionId, store);
  }
  return store;
}

/** Clears stub storage (tests only). */
export function resetShellHostApiStorage(): void {
  storageByExtension.clear();
}

/**
 * Stub HostAPI for shell iframe hosting until builtins back these namespaces.
 * Storage is scoped per `extensionId`; other methods are no-ops / stubs.
 */
export function createShellHostApi(extensionId: string): HostAPI {
  const store = storageFor(extensionId);

  return {
    storage: {
      get: async <T extends StorageValue>(key: string) => {
        const value = store.get(key);
        return (value as T | undefined) ?? null;
      },
      set: async (key, value) => {
        store.set(key, value);
      },
      remove: async (key) => {
        store.delete(key);
      },
    },
    notifications: {
      show: async () => {},
    },
    ai: {
      generateText: async () => ({ text: '' }),
    },
    hitl: {
      requestApproval: async () => ({ approved: false, id: 'stub' }),
    },
    api: {
      fetch: async () => ({ ok: false, status: 501, body: '' }),
    },
    events: {
      publish: async () => {},
    },
  };
}
