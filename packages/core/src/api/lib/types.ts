/** HTTP methods supported by file-based route modules. */
export type HttpMethod =
  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/** Request helpers attached to `c.req` (Hono-shaped). */
export type AppRequest = Request & {
  param: (name: string) => string | undefined;
  json: <T = unknown>() => Promise<T>;
};

/** Per-request context passed to handlers and middleware. */
export type AppContext = {
  req: AppRequest;
  json: (data: unknown, init?: ResponseInit) => Response;
  /** Path params captured from `:param` / `[param]` segments. */
  params: Record<string, string>;
};

export type Handler = (c: AppContext) => Response | Promise<Response>;

export type Next = () => Promise<Response>;

export type Middleware = (
  c: AppContext,
  next: Next,
) => Response | Promise<Response | void | undefined>;

/** Named method exports on a route module (`export const POST = …`). */
export type RouteHandlers = Partial<Record<HttpMethod, Handler>>;

export type RouteModule = RouteHandlers & {
  middleware?: Middleware[];
};

export type RouteRegistration = {
  method: HttpMethod;
  pattern: string;
  handler: Handler;
  middleware: Middleware[];
};

export type App = {
  /** Register a single method + path pattern (e.g. `/contacts/:id`). */
  route: (
    method: HttpMethod,
    pattern: string,
    handler: Handler,
    middleware?: Middleware[],
  ) => void;
  /** `Bun.serve({ fetch: app.fetch })`. */
  fetch: (request: Request) => Promise<Response>;
};
