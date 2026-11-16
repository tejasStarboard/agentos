import type { ComponentType } from 'react';
import { useShellContributions } from '@agentos/core/shell/hooks';
import { contributionKey, type UiContribution } from '@agentos/core/shell/lib';
import { ExtensionFrame } from './extension-frame';

export type HomeDashboardProps = {
  /** App-owned Home page (`ui/dashboard.tsx`), rendered in-process — not an extension iframe. */
  dashboard?: ComponentType;
  contributions?: UiContribution[];
};

/** Home surface: app `ui/dashboard.tsx` + optional extension `ui/widget.tsx` cards. */
export function HomeDashboard({
  dashboard: Dashboard,
  contributions: contributionsProp,
}: HomeDashboardProps) {
  const widgets = useShellContributions({
    contributions: contributionsProp,
    view: 'widget',
  });

  return (
    <section
      className="flex h-full w-full flex-col bg-background"
      aria-label="Home dashboard"
    >
      <div className="min-h-0 flex-1 overflow-auto" data-slot="dashboard">
        {Dashboard ? (
          <Dashboard />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center p-4 text-sm text-muted-foreground">
            No dashboard
          </div>
        )}
      </div>
      {widgets.length > 0 ? (
        <div
          className="grid shrink-0 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 border-t border-border p-4"
          data-slot="widgets"
        >
          {widgets.map((contribution) => (
            <div
              key={contributionKey(contribution.extensionId, contribution.view)}
              className="min-h-40 overflow-hidden rounded-xl border border-border"
            >
              <ExtensionFrame contribution={contribution} visible />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
