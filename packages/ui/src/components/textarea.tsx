import * as React from 'react';
import { cn } from '@agentos/ui/lib/utils';

function Textarea({
  className,
  minRows = 3,
  rows,
  ...props
}: React.ComponentProps<'textarea'> & {
  /** Minimum visible rows; defaults to 3. Overridden by `rows` when set. */
  minRows?: number;
}) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows ?? minRows}
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
