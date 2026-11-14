/** Minimal fetch shape for gateway calls (avoids Bun `fetch.preconnect` typing). */
export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;
