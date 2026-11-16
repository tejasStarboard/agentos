/**
 * Client call to the Vite gateway enable/disable API
 * (`POST /api/extensions/:id/enable`, ticket 13).
 */
export async function requestExtensionEnable(
  extensionId: string,
  enabled: boolean,
): Promise<void> {
  try {
    await fetch(`/api/extensions/${encodeURIComponent(extensionId)}/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  } catch {
    // Gateway not available (e.g. unit tests) — UI state already updated locally.
  }
}
