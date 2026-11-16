import type { ReactNode } from 'react';
import {
  AGENTOS_THEMES,
  ThemeProvider,
} from '@agentos/ui/components/theme-provider';
import { cn } from '@agentos/ui/lib/utils';
import '@agentos/ui/globals.css';

export function AuthPublicLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="agentos-theme"
      themes={[...AGENTOS_THEMES]}
    >
      <div
        className={cn(
          'flex min-h-dvh w-full items-center justify-center bg-background px-4 py-10 text-foreground',
          className,
        )}
        data-agentos-auth-gate
      >
        <main className="mx-auto w-full max-w-sm md:max-w-4xl">{children}</main>
      </div>
    </ThemeProvider>
  );
}
