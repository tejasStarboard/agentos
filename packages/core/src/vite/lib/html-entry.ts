import type { UiViewName } from './types';

/** URL prefix for virtual iframe HTML entries. */
export const EXT_HTML_PREFIX = '/__agentos/ext';

/** Public virtual module id prefix for per-view JS bootstraps. */
export const VIRTUAL_EXT_ENTRY_PREFIX = 'virtual:agentos-ext-entry';

const VIEW_NAMES = new Set<UiViewName>(['page', 'sidebar', 'widget']);

export type ParsedExtHtmlPath = {
  extensionId: string;
  view: UiViewName;
};

/**
 * Parse `/__agentos/ext/<id>/<view>.html` (pathname only; query ignored).
 * Returns null when the path is not an AgentOS iframe entry.
 */
export function parseExtHtmlPath(pathname: string): ParsedExtHtmlPath | null {
  const path = pathname.split('?')[0] ?? pathname;
  const match = /^\/__agentos\/ext\/([^/]+)\/(page|sidebar|widget)\.html$/.exec(
    path,
  );
  if (!match) return null;
  const extensionId = match[1];
  const view = match[2] as UiViewName;
  if (!extensionId || !VIEW_NAMES.has(view)) return null;
  return { extensionId, view };
}

/** Public virtual module id for one extension view. */
export function virtualExtEntryId(
  extensionId: string,
  view: UiViewName,
): string {
  return `${VIRTUAL_EXT_ENTRY_PREFIX}/${extensionId}/${view}`;
}

/** Resolved id with Vite's `\0` virtual prefix. */
export function resolvedVirtualExtEntryId(
  extensionId: string,
  view: UiViewName,
): string {
  return `\0${virtualExtEntryId(extensionId, view)}`;
}

/**
 * Parse `virtual:agentos-ext-entry/<id>/<view>` (with or without `\0` prefix).
 */
export function parseVirtualExtEntryId(id: string): ParsedExtHtmlPath | null {
  const bare = id.startsWith('\0') ? id.slice(1) : id;
  const match =
    /^virtual:agentos-ext-entry\/([^/]+)\/(page|sidebar|widget)$/.exec(bare);
  if (!match) return null;
  const extensionId = match[1];
  const view = match[2] as UiViewName;
  if (!extensionId || !VIEW_NAMES.has(view)) return null;
  return { extensionId, view };
}

/** Dev/preview script URL that Vite serves for a virtual module id. */
export function virtualExtEntryScriptSrc(
  extensionId: string,
  view: UiViewName,
): string {
  return `/@id/${virtualExtEntryId(extensionId, view)}`;
}

/**
 * Minimal HTML shell that loads the virtual entry module.
 * `scriptSrc` is `/@id/virtual:...` in dev or the built chunk path in production.
 */
export function renderExtHtmlEntry(options: {
  extensionId: string;
  view: UiViewName;
  scriptSrc: string;
}): string {
  const { extensionId, view, scriptSrc } = options;
  const title = `${extensionId} ${view}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <script>
    (function () {
      try {
        var p = new URLSearchParams(location.search);
        var t = p.get('theme') || localStorage.getItem('agentos-theme') || 'dark';
        if (t === 'light' || t === 'dark') {
          document.documentElement.classList.add(t);
        }
      } catch (_) {}
    })();
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${escapeHtml(scriptSrc)}"></script>
</body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function isUiViewName(value: string): value is UiViewName {
  return VIEW_NAMES.has(value as UiViewName);
}
