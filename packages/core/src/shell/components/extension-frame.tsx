import { useExtensionHost } from '@agentos/core/shell/hooks';
import { withThemeQuery, type UiContribution } from '@agentos/core/shell/lib';
import { useTheme } from '@agentos/ui/components/theme-provider';
import { cn } from '@agentos/ui/lib/utils';

export type ExtensionFrameProps = {
  contribution: UiContribution;
  /** When false, frame stays mounted but visually parked. */
  visible?: boolean;
  handshakeTimeoutMs?: number;
  rpcTimeoutMs?: number;
  /**
   * Override theme query param. Defaults to Shell `resolvedTheme`, then `dark`.
   * Useful in unit tests without a ThemeProvider.
   */
  theme?: string;
};

/**
 * Sandboxed extension iframe with Comlink host lifecycle (ADR 005).
 */
export function ExtensionFrame({
  contribution,
  visible = true,
  handshakeTimeoutMs,
  rpcTimeoutMs,
  theme: themeProp,
}: ExtensionFrameProps) {
  const { extensionId, view, src } = contribution;
  const { resolvedTheme } = useTheme();
  const theme = themeProp ?? resolvedTheme ?? 'dark';
  const themedSrc = withThemeQuery(src, theme);
  const iframeRef = useExtensionHost(
    { ...contribution, src: themedSrc },
    {
      handshakeTimeoutMs,
      rpcTimeoutMs,
    },
  );

  return (
    <iframe
      ref={iframeRef}
      src={themedSrc}
      title={`${extensionId} ${view}`}
      sandbox="allow-scripts allow-same-origin allow-forms"
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
