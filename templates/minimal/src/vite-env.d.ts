/// <reference types="vite/client" />

declare module 'virtual:agentos-registry' {
  import type { RegistryModel } from '@agentos/core/vite';

  export const registry: RegistryModel;
}
