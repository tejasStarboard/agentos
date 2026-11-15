/**
 * @agentos/core/api/events — HTTP client for builtin `events` (ticket 23).
 */

import { postJson, resolveExtApiBase, type EnvMap } from './http';

/** Resolve builtin events API base (`…/api/ext/events` or test override). */
export function resolveEventsApiBase(env: EnvMap = Bun.env): string {
  return resolveExtApiBase('events', 'AGENT_OS_EVENTS_API_BASE', env);
}

export type EventMessage = {
  topic: string;
  payload: unknown;
  at: string;
};

export type PublishResult = {
  ok: true;
  event: EventMessage;
};

export async function publish(
  topic: string,
  payload: unknown = null,
  env?: EnvMap,
): Promise<PublishResult> {
  const base = resolveEventsApiBase(env ?? Bun.env);
  return postJson<PublishResult>(
    `${base}/publish`,
    { topic, payload },
    'events publish',
  );
}

/**
 * Build SSE subscribe URL (long-lived connection left to the caller).
 * Pass one topic string or multiple via `topics`.
 */
export function subscribeUrl(topics: string | string[], env?: EnvMap): string {
  const base = resolveEventsApiBase(env ?? Bun.env);
  const list = Array.isArray(topics) ? topics : [topics];
  const params = new URLSearchParams();
  if (list.length === 1 && list[0]) {
    params.set('topic', list[0]);
  } else {
    for (const t of list) {
      params.append('topics', t);
    }
  }
  return `${base}/subscribe?${params.toString()}`;
}
