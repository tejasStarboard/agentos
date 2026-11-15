/**
 * @agentos/core/api/telemetry — thin event/span helpers (logging-backed v1).
 */

import { createLogger } from './logging';

const log = createLogger('telemetry');

export type TelemetryProps = Record<string, unknown>;

/** Record a named event (no vendor SDK in v1). */
export function track(event: string, props: TelemetryProps = {}): void {
  log.info(event, { kind: 'track', ...props });
}

/**
 * Time an async (or sync) function and emit start/end (or error) events.
 */
export async function span<T>(
  name: string,
  fn: () => T | Promise<T>,
  props: TelemetryProps = {},
): Promise<T> {
  const started = Date.now();
  log.info(name, { kind: 'span.start', ...props });
  try {
    const result = await fn();
    log.info(name, {
      kind: 'span.end',
      durationMs: Date.now() - started,
      ...props,
    });
    return result;
  } catch (error) {
    log.error(name, {
      kind: 'span.error',
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
      ...props,
    });
    throw error;
  }
}
