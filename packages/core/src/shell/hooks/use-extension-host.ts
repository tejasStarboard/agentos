import { useEffect, useRef, type RefObject } from 'react';
import {
  activateFrame,
  createShellHostApi,
  deactivateFrame,
  useShellStore,
  type ActivatedFrame,
  type UiContribution,
} from '@agentos/core/shell/lib';

export type UseExtensionHostOptions = {
  handshakeTimeoutMs?: number;
  rpcTimeoutMs?: number;
};

/**
 * Owns the sandboxed iframe Comlink lifecycle (READY → activate → deactivate).
 * Returns a ref to attach to the `<iframe>` element.
 */
export function useExtensionHost(
  contribution: UiContribution,
  options: UseExtensionHostOptions = {},
): RefObject<HTMLIFrameElement | null> {
  const { extensionId, view, src } = contribution;
  const { handshakeTimeoutMs, rpcTimeoutMs } = options;
  const setRuntimeStatus = useShellStore((s) => s.setRuntimeStatus);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activatedRef = useRef<ActivatedFrame | null>(null);

  useEffect(() => {
    const contentWindow = iframeRef.current?.contentWindow;
    if (!contentWindow) return;

    let cancelled = false;
    setRuntimeStatus(extensionId, view, 'loading');

    void (async () => {
      try {
        const activated = await activateFrame({
          extensionId,
          contentWindow,
          hostApi: createShellHostApi(extensionId),
          handshakeTimeoutMs,
          rpcTimeoutMs,
        });
        if (cancelled) {
          await deactivateFrame(
            extensionId,
            activated.remote,
            activated.dispose,
            rpcTimeoutMs,
          );
          return;
        }
        activatedRef.current = activated;
        setRuntimeStatus(extensionId, view, 'active');
      } catch {
        if (!cancelled) {
          setRuntimeStatus(extensionId, view, 'crashed');
        }
      }
    })();

    return () => {
      cancelled = true;
      const current = activatedRef.current;
      activatedRef.current = null;
      void (async () => {
        const result = await deactivateFrame(
          extensionId,
          current?.remote ?? null,
          current?.dispose ?? null,
          rpcTimeoutMs,
        );
        if (!result.ok) {
          setRuntimeStatus(extensionId, view, 'crashed');
        }
      })();
    };
  }, [
    extensionId,
    view,
    src,
    handshakeTimeoutMs,
    rpcTimeoutMs,
    setRuntimeStatus,
  ]);

  return iframeRef;
}
