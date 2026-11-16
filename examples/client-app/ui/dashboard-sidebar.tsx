import { Separator } from '@agentos/ui/components/separator';

/** App-level Home sidebar (`ui/dashboard-sidebar.tsx`) — in-process, not an extension iframe. */
export default function DashboardSidebar() {
  return (
    <div
      className="flex h-full min-h-full flex-col gap-3 bg-sidebar p-4 text-sidebar-foreground"
      data-app-dashboard-sidebar
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold tracking-tight">Home</h2>
        <p className="text-xs text-muted-foreground">
          App sidebar for the Home surface.
        </p>
      </div>
      <Separator />
      <p className="text-xs text-muted-foreground">
        Provided via{' '}
        <code className="text-sidebar-foreground">
          mountShell dashboardSidebar
        </code>
        . Extension sidebars use{' '}
        <code className="text-sidebar-foreground">ui/sidebar.tsx</code>.
      </p>
    </div>
  );
}
