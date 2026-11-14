import { createContext } from 'react';
import type { HostAPIClient } from '@agentos/core/sdk';

/** React context for the live HostAPI client inside an extension iframe. */
export const HostContext = createContext<HostAPIClient | null>(null);
