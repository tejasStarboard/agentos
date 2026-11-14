/**
 * Client call to the future gateway enable/disable API.
 * Stub: resolves OK until tickets 10–13 land a real endpoint.
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
    // Gateway not available yet — UI state already updated locally.
  }
}
