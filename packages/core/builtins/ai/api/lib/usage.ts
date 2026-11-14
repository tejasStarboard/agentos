/** Shared mock usage blob for AI SDK v7 mock models. */
export const MOCK_USAGE = {
  inputTokens: {
    total: 10,
    noCache: 10,
    cacheRead: undefined as number | undefined,
    cacheWrite: undefined as number | undefined,
  },
  outputTokens: {
    total: 20,
    text: 20,
    reasoning: undefined as number | undefined,
  },
} as const;
