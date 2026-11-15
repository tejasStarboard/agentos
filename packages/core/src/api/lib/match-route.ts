/**
 * Match a pathname against a pattern like `/contacts/:id`.
 * Returns captured params or `null` when the path does not match.
 */
export function matchRoute(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  const patternParts = splitPath(pattern);
  const pathParts = splitPath(pathname);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const expected = patternParts[i]!;
    const actual = pathParts[i]!;

    if (expected.startsWith(':')) {
      const name = expected.slice(1);
      if (!name) return null;
      params[name] = decodeURIComponent(actual);
      continue;
    }

    if (expected !== actual) {
      return null;
    }
  }

  return params;
}

/**
 * Convert a routes-dir relative folder path to a URL pattern.
 * `contacts/[id]` → `/contacts/:id`
 */
export function folderPathToPattern(relativeFolder: string): string {
  const segments = relativeFolder
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      const dynamic = /^\[(.+)\]$/.exec(segment);
      if (dynamic) {
        return `:${dynamic[1]}`;
      }
      return segment;
    });

  return `/${segments.join('/')}`;
}

function splitPath(path: string): string[] {
  const normalized = path.replace(/\/+$/, '') || '/';
  if (normalized === '/') return [];
  return normalized.replace(/^\//, '').split('/');
}
