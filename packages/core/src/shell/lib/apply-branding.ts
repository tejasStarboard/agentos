import type { ResolvedAgentosBranding } from '@agentos/core/config';

const STYLE_ID = 'agentos-branding-fonts';
const FAVICON_ATTR = 'data-agentos-branding-favicon';

/** True when a branding font value should load as `@font-face` from a URL. */
export function isFontUrl(value: string): boolean {
  return (
    value.startsWith('/_public/') ||
    value.startsWith('https://') ||
    value.startsWith('http://')
  );
}

function fontFormat(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.woff2')) return 'woff2';
  if (lower.endsWith('.woff')) return 'woff';
  if (lower.endsWith('.otf')) return 'opentype';
  if (lower.endsWith('.ttf')) return 'truetype';
  return 'woff2';
}

function familyNameForUrl(url: string, role: 'sans' | 'heading'): string {
  const base =
    url
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '') ?? role;
  const safe = base.replace(/[^a-zA-Z0-9_-]/g, '-') || role;
  return `AgentOS ${role === 'sans' ? 'Sans' : 'Heading'} (${safe})`;
}

function buildFontCss(branding: ResolvedAgentosBranding): string {
  const faces: string[] = [];
  const rootVars: string[] = [];

  const applyFont = (
    value: string | undefined,
    cssVar: '--font-sans' | '--font-heading',
    role: 'sans' | 'heading',
  ) => {
    if (!value) return;
    if (isFontUrl(value)) {
      const family = familyNameForUrl(value, role);
      faces.push(
        `@font-face{font-family:${JSON.stringify(family)};src:url(${JSON.stringify(value)}) format(${JSON.stringify(fontFormat(value))});font-display:swap;}`,
      );
      rootVars.push(`${cssVar}:${JSON.stringify(family)},system-ui,sans-serif`);
      return;
    }
    rootVars.push(`${cssVar}:${value}`);
  };

  applyFont(branding.fontSans, '--font-sans', 'sans');
  applyFont(branding.fontHeading, '--font-heading', 'heading');

  if (faces.length === 0 && rootVars.length === 0) return '';
  const rootBlock = rootVars.length > 0 ? `:root{${rootVars.join(';')}}` : '';
  return `${faces.join('')}${rootBlock}`;
}

/**
 * Apply resolved branding to the document: title, favicon, font CSS variables.
 * Safe to call repeatedly (idempotent DOM updates).
 */
export function applyBranding(branding: ResolvedAgentosBranding): void {
  if (typeof document === 'undefined') return;

  if (branding.appName) {
    document.title = branding.appName;
  }

  if (branding.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>(
      `link[rel="icon"][${FAVICON_ATTR}]`,
    );
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.setAttribute(FAVICON_ATTR, '');
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }

  const css = buildFontCss(branding);
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!css) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
}
