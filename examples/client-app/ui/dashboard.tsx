import { Separator } from '@agentos/ui/components/separator';

/** App-level Home surface (`ui/dashboard.tsx`) — not an extension contribution. */
export default function Dashboard() {
  return (
    <div
      className="flex min-h-full flex-col gap-4 bg-background p-6 text-foreground"
      data-app-dashboard
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="text-sm text-muted-foreground">
          Default AgentOS home surface for this app.
        </p>
      </div>
      <Separator />
      <p className="max-w-prose text-sm text-muted-foreground">
        Extension cards from{' '}
        <code className="text-foreground">ui/widget.tsx</code> appear below when
        contributed. Open an extension from the Activity Bar to work in its
        page.
      </p>
    </div>
  );
}
