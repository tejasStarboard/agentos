import { createContext } from './create-context';
import { matchRoute } from './match-route';
import type {
  App,
  AppContext,
  Handler,
  HttpMethod,
  Middleware,
  RouteRegistration,
} from './types';

const METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
];

/**
 * Bun-native app factory with a built-in `GET /health` → `{ ok: true }`.
 * File routes registered later via `loadRoutes` (or `app.route`) can override health.
 */
export function createApp(): App {
  const routes: RouteRegistration[] = [];

  const app: App = {
    route(method, pattern, handler, middleware = []) {
      const normalized = normalizePattern(pattern);
      // Later registrations win (e.g. file route overrides built-in health).
      const existing = routes.findIndex(
        (r) => r.method === method && r.pattern === normalized,
      );
      const entry: RouteRegistration = {
        method,
        pattern: normalized,
        handler,
        middleware,
      };
      if (existing >= 0) {
        routes[existing] = entry;
      } else {
        routes.push(entry);
      }
    },

    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const pathname = url.pathname.replace(/\/+$/, '') || '/';
      const method = request.method.toUpperCase() as HttpMethod;

      if (!METHODS.includes(method)) {
        return new Response('Method Not Allowed', { status: 405 });
      }

      let matched: RouteRegistration | undefined;
      let params: Record<string, string> = {};
      let pathMatchedWithoutMethod = false;

      for (const route of routes) {
        const found = matchRoute(route.pattern, pathname);
        if (found === null) continue;
        pathMatchedWithoutMethod = true;
        if (route.method === method) {
          matched = route;
          params = found;
          break;
        }
      }

      if (!matched) {
        if (pathMatchedWithoutMethod) {
          return new Response('Method Not Allowed', { status: 405 });
        }
        return new Response('Not Found', { status: 404 });
      }

      const c = createContext(request, params);
      return runMiddleware(matched.middleware, c, () => matched!.handler(c));
    },
  };

  app.route('GET', '/health', (c) => c.json({ ok: true }));

  return app;
}

async function runMiddleware(
  middleware: Middleware[],
  c: AppContext,
  handler: () => Response | Promise<Response>,
): Promise<Response> {
  let index = -1;

  const dispatch = async (i: number): Promise<Response> => {
    if (i <= index) {
      throw new Error('next() called multiple times');
    }
    index = i;
    if (i === middleware.length) {
      return handler();
    }

    const fn = middleware[i]!;
    let nextCalled = false;
    let nextResponse: Response | undefined;

    const next = async (): Promise<Response> => {
      nextCalled = true;
      nextResponse = await dispatch(i + 1);
      return nextResponse;
    };

    const result = await fn(c, next);
    if (result instanceof Response) {
      return result;
    }
    if (!nextCalled) {
      return dispatch(i + 1);
    }
    return nextResponse!;
  };

  return dispatch(0);
}

function normalizePattern(pattern: string): string {
  if (!pattern.startsWith('/')) {
    pattern = `/${pattern}`;
  }
  return pattern.replace(/\/+$/, '') || '/';
}

/** @internal — re-export for convenience. */
export type { Handler, Middleware };
