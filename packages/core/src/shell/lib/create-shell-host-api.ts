import type {
  HostAPI,
  NotificationType,
  StorageValue,
} from '@agentos/core/sdk';
import { toast } from '@agentos/ui/components/toast';
import { useShellStore } from './store';

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

function showNotification(
  message: string,
  type: NotificationType = 'info',
): void {
  toast.add({
    title: message,
    type,
  });
  useShellStore.getState().setStatusText(message, type);
}

/**
 * Stub HostAPI for shell iframe hosting until builtins back these namespaces.
 * Storage is scoped per `extensionId`; notifications fan out to Shell toasts.
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
      show: async (message, type = 'info') => {
        showNotification(message, type);
      },
    },
    ai: {
      generateText: async () => ({ text: '' }),
    },
    hitl: {
      requestApproval: async () => ({ approved: false, id: 'stub' }),
    },
    api: {
      fetch: async (path, init) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        const url = `/api/ext/${encodeURIComponent(extensionId)}${normalized}`;
        const res = await fetch(url, {
          method: init?.method ?? 'GET',
          headers: init?.headers,
          body: init?.body,
          credentials: 'include',
        });
        return {
          ok: res.ok,
          status: res.status,
          body: await res.text(),
        };
      },
    },
    events: {
      publish: async () => {},
    },
  };
}
