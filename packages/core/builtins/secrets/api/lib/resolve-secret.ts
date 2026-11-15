/**
 * Resolve a secret by key from:
 * 1. `AGENT_OS_EXT_SECRETS_MAP` JSON object
 * 2. `AGENT_OS_EXT_SECRETS_<KEY>` env (key uppercased, hyphens → underscores)
 */
export function resolveSecret(
  key: string,
  runtimeEnv: Record<string, string | undefined> = Bun.env,
): string | null {
  const trimmed = key.trim();
  if (!trimmed) return null;

  const mapRaw = runtimeEnv.AGENT_OS_EXT_SECRETS_MAP;
  if (mapRaw) {
    try {
      const parsed = JSON.parse(mapRaw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const value = (parsed as Record<string, unknown>)[trimmed];
        if (typeof value === 'string') return value;
      }
    } catch {
      // ignore invalid map; fall through to per-key env
    }
  }

  const envKey = `AGENT_OS_EXT_SECRETS_${trimmed
    .toUpperCase()
    .replace(/-/g, '_')}`;
  // Avoid treating the map / port keys as secret values.
  if (
    envKey === 'AGENT_OS_EXT_SECRETS_MAP' ||
    envKey === 'AGENT_OS_EXT_SECRETS_PORT'
  ) {
    return null;
  }
  const value = runtimeEnv[envKey];
  return typeof value === 'string' && value.length > 0 ? value : null;
}
