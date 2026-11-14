import { toError, type CatchValue } from './contracts';
import { ExtensionRpcTimeoutError } from './types';

const DEFAULT_RPC_TIMEOUT_MS = 10_000;

/**
 * Rejects if `promise` does not settle within `timeoutMs`.
 * Used by the shell around extension RPC (e.g. `onActivate`).
 */
export function withRpcTimeout<T>(
  extensionId: string,
  method: string,
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_RPC_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ExtensionRpcTimeoutError(extensionId, method, timeoutMs));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (reason: CatchValue) => {
        clearTimeout(timer);
        reject(toError(reason));
      },
    );
  });
}
