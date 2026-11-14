declare module 'virtual:agentos-registry' {
  import type { RegistryModel } from './lib/types';

  /** Filesystem-scanned extension registry (Vite virtual module). */
  export const registry: RegistryModel;
}
