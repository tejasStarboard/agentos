/**
 * Append or replace `theme` on an iframe contribution URL.
 * Preserves existing query params and hash.
 */
export function withThemeQuery(src: string, theme: string): string {
  const url = new URL(src, 'http://agentos.local');
  url.searchParams.set('theme', theme);
  return `${url.pathname}${url.search}${url.hash}`;
}
