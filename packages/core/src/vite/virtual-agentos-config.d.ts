declare module 'virtual:agentos-config' {
  /** Runtime subset of resolved `agentos.config.ts` (auth + builtins). */
  export const config: {
    auth: {
      allowSignUp: boolean;
      allowPasswordReset: boolean;
      afterSignInPath: string;
    };
    builtins: Record<string, Record<string, unknown>>;
  };
}
