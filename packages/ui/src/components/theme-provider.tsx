import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

/** Shared theme provider — add theme names here as the product grows. */
export const AGENTOS_THEMES = ['light', 'dark'] as const;

export type AgentosTheme = (typeof AGENTOS_THEMES)[number];

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme };
