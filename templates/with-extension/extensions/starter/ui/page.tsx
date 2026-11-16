import { Badge } from '@agentos/ui/components/badge';

/** Stub extension page — replace with product UI. */
export default function Page() {
  return (
    <div
      className="flex h-full flex-col gap-3 bg-background p-6 text-foreground"
      data-starter-page
    >
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Starter</h1>
        <Badge variant="secondary">Bun API</Badge>
      </div>
      <p className="max-w-prose text-sm text-muted-foreground">
        Stub extension from the <code className="text-foreground">with-extension</code>{' '}
        template. Edit <code className="text-foreground">ui/page.tsx</code> and{' '}
        <code className="text-foreground">api/routes</code>.
      </p>
    </div>
  );
}
