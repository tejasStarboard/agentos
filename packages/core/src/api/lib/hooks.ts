/**
 * @agentos/core/api/hooks — in-process lifecycle hooks for createApp.
 *
 * onRequest / onResponse / onError are invoked automatically from createApp.fetch.
 * onStart is not auto-fired (createApp has no server lifecycle) — call
 * `await runStartHooks()` from api/server.ts before Bun.serve.
 */

import type { AppContext } from './types';

export type StartHook = () => void | Promise<void>;
export type RequestHook = (
  request: Request,
) => void | Response | Promise<void | Response>;
export type ResponseHook = (
  request: Request,
  response: Response,
  c: AppContext,
) => void | Response | Promise<void | Response>;
export type ErrorHook = (
  error: unknown,
  request: Request,
  c: AppContext | null,
) => void | Response | Promise<void | Response>;

const startHooks: StartHook[] = [];
const requestHooks: RequestHook[] = [];
const responseHooks: ResponseHook[] = [];
const errorHooks: ErrorHook[] = [];

/** Register a hook that runs when `runStartHooks()` is awaited (typically before Bun.serve). */
export function onStart(fn: StartHook): void {
  startHooks.push(fn);
}

/** Register a hook that runs at the start of each `app.fetch` (before routing). */
export function onRequest(fn: RequestHook): void {
  requestHooks.push(fn);
}

/** Register a hook that runs after a successful response is produced. */
export function onResponse(fn: ResponseHook): void {
  responseHooks.push(fn);
}

/** Register a hook that runs when a handler/middleware throws. */
export function onError(fn: ErrorHook): void {
  errorHooks.push(fn);
}

/** Clear all hooks (tests). */
export function clearHooks(): void {
  startHooks.length = 0;
  requestHooks.length = 0;
  responseHooks.length = 0;
  errorHooks.length = 0;
}

/** Run registered onStart hooks in order. Call from api/server.ts before Bun.serve. */
export async function runStartHooks(): Promise<void> {
  for (const fn of startHooks) {
    await fn();
  }
}

/** @internal — used by createApp.fetch */
export async function runRequestHooks(
  request: Request,
): Promise<Response | undefined> {
  for (const fn of requestHooks) {
    const result = await fn(request);
    if (result instanceof Response) {
      return result;
    }
  }
  return undefined;
}

/** @internal — used by createApp.fetch */
export async function runResponseHooks(
  request: Request,
  response: Response,
  c: AppContext,
): Promise<Response> {
  let current = response;
  for (const fn of responseHooks) {
    const result = await fn(request, current, c);
    if (result instanceof Response) {
      current = result;
    }
  }
  return current;
}

/** @internal — used by createApp.fetch */
export async function runErrorHooks(
  error: unknown,
  request: Request,
  c: AppContext | null,
): Promise<Response | undefined> {
  for (const fn of errorHooks) {
    const result = await fn(error, request, c);
    if (result instanceof Response) {
      return result;
    }
  }
  return undefined;
}
