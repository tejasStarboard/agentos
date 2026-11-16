import { Badge } from '@agentos/ui/components/badge';

/** Stub extension page — Python service backs `/api/ext/starter/*`. */
export default function Page() {
  return (
    <div
      className="flex h-full flex-col gap-3 bg-background p-6 text-foreground"
      data-starter-page
    >
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Starter</h1>
        <Badge variant="secondary">Python service</Badge>
      </div>
      <p className="max-w-prose text-sm text-muted-foreground">
        Stub from the <code className="text-foreground">with-service</code>{' '}
        template. UI lives here; API is{' '}
        <code className="text-foreground">services/starter</code>.
      </p>
    </div>
  );
}
