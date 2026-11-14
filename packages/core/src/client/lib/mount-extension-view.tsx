import {
  createElement,
  useLayoutEffect,
  type ComponentType,
  type ReactNode,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  AGENTOS_THEMES,
  type AgentosTheme,
} from '@agentos/ui/components/theme-provider';
import type { HostAPIClient } from '@agentos/core/sdk';
import { HostProvider } from '@agentos/core/client/components/host-provider';
import { createStandaloneHost, isShellIframe } from './standalone-host';
import '@agentos/ui/globals.css';

const THEME_SET = new Set<string>(AGENTOS_THEMES);

/** Resolve `?theme=` from a search string; defaults to `dark`. */
export function resolveThemeFromSearch(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): AgentosTheme {
  const raw = new URLSearchParams(
    search.startsWith('?') ? search : `?${search}`,
  ).get('theme');
  if (raw && THEME_SET.has(raw)) {
    return raw as AgentosTheme;
  }
  return 'dark';
}

/** Apply theme class on `<html>` (FOUC already handled in HTML shell). */
export function applyDocumentTheme(theme: AgentosTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const name of AGENTOS_THEMES) {
    root.classList.remove(name);
  }
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export type ExtensionViewAppProps = {
  View: ComponentType;
  /** Forced theme (`light` | `dark`). */
  theme?: AgentosTheme;
  /** Injected host skips iframe handshake (tests / standalone preview). */
  host?: HostAPIClient;
  children?: ReactNode;
};

/**
 * Framework iframe chrome: theme class + HostProvider around an FDE view.
 * Theme comes from `?theme=` (Shell), not next-themes (avoids inert script tags).
 * FDE `ui/*.tsx` files export only the view — they do not call this.
 */
export function ExtensionViewApp({
  View,
  theme = 'dark',
  host,
  children,
}: ExtensionViewAppProps) {
  useLayoutEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  return (
    <HostProvider host={host}>{children ?? createElement(View)}</HostProvider>
  );
}

export type MountExtensionViewOptions = {
  /** DOM node to mount into; defaults to `#root`. */
  container?: HTMLElement | null;
  /** Query string used for theme (`?theme=`). Defaults to `location.search`. */
  search?: string;
  /** Injected host for unit tests. */
  host?: HostAPIClient;
};

/**
 * Boot an extension view inside a sandboxed iframe document.
 * Called from the Vite-generated virtual entry — not by FDE code.
 *
 * Opening the HTML URL as a top-level browser tab uses a standalone stub host
 * so the view still paints; Comlink handshake only runs inside the Shell iframe.
 */
export function mountExtensionView(
  View: ComponentType,
  options: MountExtensionViewOptions = {},
): Root {
  const theme = resolveThemeFromSearch(options.search);
  applyDocumentTheme(theme);
  const container =
    options.container ??
    (typeof document !== 'undefined' ? document.getElementById('root') : null);
  if (!container) {
    throw new Error(
      'mountExtensionView: missing #root container (or options.container)',
    );
  }

  const host =
    options.host ?? (isShellIframe() ? undefined : createStandaloneHost());

  if (!options.host && !isShellIframe()) {
    console.info(
      '[agentos] Extension view opened outside Shell iframe — using standalone preview host. Open via the Shell for Comlink handshake.',
    );
  }

  const root = createRoot(container);
  root.render(
    createElement(ExtensionViewApp, {
      View,
      theme,
      host,
    }),
  );
  return root;
}
