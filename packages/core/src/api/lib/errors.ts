/**
 * @agentos/core/api/errors — consistent JSON error helpers for route handlers.
 */

import type { AppContext } from './types';

export class HttpError extends Error {
  readonly status: number;
  readonly body: Record<string, unknown>;

  constructor(
    status: number,
    message: string,
    extra: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = { error: message, ...extra };
  }
}

export function isHttpError(value: unknown): value is HttpError {
  return value instanceof HttpError;
}

/** Build a JSON error Response via AppContext. */
export function jsonError(
  c: AppContext,
  status: number,
  message: string,
  extra: Record<string, unknown> = {},
): Response {
  return c.json({ error: message, ...extra }, { status });
}

export function badRequest(
  c: AppContext,
  message = 'bad request',
  extra?: Record<string, unknown>,
): Response {
  return jsonError(c, 400, message, extra);
}

export function unauthorized(
  c: AppContext,
  message = 'unauthenticated',
  extra?: Record<string, unknown>,
): Response {
  return jsonError(c, 401, message, extra);
}

export function forbidden(
  c: AppContext,
  message = 'forbidden',
  extra?: Record<string, unknown>,
): Response {
  return jsonError(c, 403, message, extra);
}

export function notFound(
  c: AppContext,
  message = 'not found',
  extra?: Record<string, unknown>,
): Response {
  return jsonError(c, 404, message, extra);
}

/** Convert thrown HttpError (or unknown) into a Response. */
export function toErrorResponse(c: AppContext, error: unknown): Response {
  if (isHttpError(error)) {
    return c.json(error.body, { status: error.status });
  }
  const message = error instanceof Error ? error.message : String(error);
  return jsonError(c, 500, message);
}
