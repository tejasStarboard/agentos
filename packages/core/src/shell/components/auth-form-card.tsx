import type { ReactNode } from 'react';
import { Card, CardContent } from '@agentos/ui/components/card';
import { FieldDescription } from '@agentos/ui/components/field';
import { cn } from '@agentos/ui/lib/utils';

export type AuthFormCardProps = {
  children: ReactNode;
  /** Optional caption under the card (terms, etc.). */
  footer?: ReactNode;
  className?: string;
  /** Product name for the brand panel. @default 'AgentOS' */
  appName?: string;
  /** Optional logo URL (`/_public/...` or https). */
  logoUrl?: string;
};

/**
 * Shared two-column auth chrome: form on the left, brand panel on the right (md+).
 */
export function AuthFormCard({
  children,
  footer,
  className,
  appName = 'AgentOS',
  logoUrl,
}: AuthFormCardProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {children}
          <div
            className="relative hidden min-h-80 overflow-hidden bg-muted md:block"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.45_0.06_250_/_0.45),transparent_55%),linear-gradient(160deg,oklch(0.22_0.02_260),oklch(0.16_0.01_260))]" />
            <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-0 flex flex-col justify-end gap-2 p-8 text-card-foreground">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="mb-2 h-8 w-auto max-w-[10rem] object-contain object-left"
                />
              ) : null}
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {appName}
              </p>
              <p className="max-w-xs text-sm text-balance text-foreground/90">
                Sign in to your workspace — extensions, agents, and tools in one
                shell.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {footer ? (
        <FieldDescription className="px-6 text-center">
          {footer}
        </FieldDescription>
      ) : null}
    </div>
  );
}

export function AuthFormPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col justify-center p-6 md:p-8', className)}>
      {children}
    </div>
  );
}
