export type PublicAuthRoute =
  'login' | 'register' | 'forgot-password' | 'reset-password';

export type AuthRouteFlags = {
  allowSignUp: boolean;
  allowPasswordReset: boolean;
};

const PUBLIC_PATHS: Record<string, PublicAuthRoute> = {
  '/login': 'login',
  '/register': 'register',
  '/forgot-password': 'forgot-password',
  '/reset-password': 'reset-password',
};

/** Normalize pathname (strip trailing slash except root). */
export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return pathname || '/';
  return pathname.replace(/\/+$/, '') || '/';
}

/**
 * Match a public auth route, respecting config flags.
 * Returns null when path is not a public auth route or the route is disabled.
 */
export function matchPublicAuthRoute(
  pathname: string,
  flags: AuthRouteFlags,
): PublicAuthRoute | null {
  const path = normalizePathname(pathname);
  const route = PUBLIC_PATHS[path];
  if (!route) return null;
  if (route === 'register' && !flags.allowSignUp) return null;
  if (
    (route === 'forgot-password' || route === 'reset-password') &&
    !flags.allowPasswordReset
  ) {
    return null;
  }
  return route;
}

export function isPublicAuthPath(
  pathname: string,
  flags: AuthRouteFlags,
): boolean {
  return matchPublicAuthRoute(pathname, flags) != null;
}

/** Client navigation that keeps AuthGate in sync via popstate. */
export function navigateApp(to: string): void {
  const url = new URL(to, window.location.origin);
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return;
  }
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function loginPathWithNext(nextPath?: string | null): string {
  if (
    !nextPath ||
    nextPath === '/' ||
    matchPublicAuthRoute(nextPath, {
      allowSignUp: true,
      allowPasswordReset: true,
    })
  ) {
    return '/login';
  }
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export function readNextParam(search: string): string | null {
  const params = new URLSearchParams(search);
  const next = params.get('next');
  return next && next.startsWith('/') ? next : null;
}

export function readResetToken(search: string): string | null {
  const params = new URLSearchParams(search);
  const token = params.get('token');
  return token && token.length > 0 ? token : null;
}
