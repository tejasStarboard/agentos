import { NOTIFICATIONS_MAX } from './constants';

export type NotificationType = 'info' | 'success' | 'error';

export type NotificationEntry = {
  id: string;
  message: string;
  type: NotificationType;
  at: string;
};

export function createNotifyStore(max = NOTIFICATIONS_MAX) {
  const entries: NotificationEntry[] = [];

  return {
    add(message: string, type: NotificationType = 'info'): NotificationEntry {
      const entry: NotificationEntry = {
        id: crypto.randomUUID(),
        message,
        type,
        at: new Date().toISOString(),
      };
      entries.unshift(entry);
      if (entries.length > max) entries.length = max;
      return entry;
    },
    list(): NotificationEntry[] {
      return [...entries];
    },
  };
}

export type NotifyStore = ReturnType<typeof createNotifyStore>;
