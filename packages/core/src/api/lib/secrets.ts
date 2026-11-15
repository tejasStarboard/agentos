/**
 * @agentos/core/api/secrets — HTTP client for builtin `secrets` (ticket 23).
 */

import { getJson, resolveExtApiBase, type EnvMap } from './http';

/** Resolve builtin secrets API base (`…/api/ext/secrets` or test override). */
export function resolveSecretsApiBase(env: EnvMap = Bun.env): string {
  return resolveExtApiBase('secrets', 'AGENT_OS_SECRETS_API_BASE', env);
}

export type SecretValue = { key: string; value: string };

/** Fetch a secret by key from the secrets builtin (env-backed). */
export async function getSecret(
  key: string,
  env?: EnvMap,
): Promise<SecretValue> {
  const base = resolveSecretsApiBase(env ?? Bun.env);
  return getJson<SecretValue>(
    `${base}/secrets/${encodeURIComponent(key)}`,
    'secrets getSecret',
  );
}
