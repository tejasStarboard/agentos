declare module 'virtual:agentos-config' {
  /** Runtime subset of resolved `agentos.config.ts` (auth + branding + builtins). */
  export const config: {
    auth: {
      allowSignUp: boolean;
      allowPasswordReset: boolean;
      afterSignInPath: string;
    };
    branding: {
      appName: string;
      logoUrl?: string;
      faviconUrl?: string;
      fontSans?: string;
      fontHeading?: string;
    };
    builtins: Record<string, Record<string, unknown>>;
  };
}
