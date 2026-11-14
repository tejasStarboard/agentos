import { useExtensionHost } from '@agentos/core/shell/hooks';
import type { UiContribution } from '@agentos/core/shell/lib';
import { cn } from '@agentos/ui/lib/utils';

export type ExtensionFrameProps = {
  contribution: UiContribution;
  /** When false, frame stays mounted but visually parked. */
  visible?: boolean;
  handshakeTimeoutMs?: number;
  rpcTimeoutMs?: number;
};

/**
 * Sandboxed extension iframe with Comlink host lifecycle (ADR 005).
 */
export function ExtensionFrame({
  contribution,
  visible = true,
  handshakeTimeoutMs,
  rpcTimeoutMs,
}: ExtensionFrameProps) {
  const { extensionId, view, src } = contribution;
  const iframeRef = useExtensionHost(contribution, {
    handshakeTimeoutMs,
    rpcTimeoutMs,
  });

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={`${extensionId} ${view}`}
      sandbox="allow-scripts allow-same-origin"
      data-extension-id={extensionId}
      data-view={view}
      data-visible={visible ? 'true' : 'false'}
      className={cn(
        'h-full w-full border-0 bg-background',
        !visible && 'hidden',
      )}
      hidden={!visible}
    />
  );
}
