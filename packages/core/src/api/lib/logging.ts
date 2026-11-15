/**
 * @agentos/core/api/logging — structured JSON line logger for Bun API routes.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

export type Logger = {
  debug: (message: string, fields?: LogFields) => void;
  info: (message: string, fields?: LogFields) => void;
  warn: (message: string, fields?: LogFields) => void;
  error: (message: string, fields?: LogFields) => void;
};

function write(
  level: LogLevel,
  scope: string,
  message: string,
  fields?: LogFields,
): void {
  const line = JSON.stringify({
    level,
    scope,
    message,
    at: new Date().toISOString(),
    ...fields,
  });
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

/** Create a scoped structured logger (JSON lines on console). */
export function createLogger(scope: string): Logger {
  return {
    debug: (message, fields) => write('debug', scope, message, fields),
    info: (message, fields) => write('info', scope, message, fields),
    warn: (message, fields) => write('warn', scope, message, fields),
    error: (message, fields) => write('error', scope, message, fields),
  };
}
