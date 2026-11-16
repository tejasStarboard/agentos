/// <reference types="vite/client" />

declare module 'virtual:agentos-registry' {
  import type { RegistryModel } from '@agentos/core/vite';

  export const registry: RegistryModel;
}

declare module 'virtual:agentos-config' {
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
