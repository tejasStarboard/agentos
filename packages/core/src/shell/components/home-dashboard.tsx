import { useShellContributions } from '@agentos/core/shell/hooks';
import { contributionKey, type UiContribution } from '@agentos/core/shell/lib';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agentos/ui/components/card';
import { ExtensionFrame } from './extension-frame';

export type HomeDashboardProps = {
  contributions?: UiContribution[];
};

/** Home dashboard widget slot (`ui/widget.tsx`). */
export function HomeDashboard({
  contributions: contributionsProp,
}: HomeDashboardProps) {
  const widgets = useShellContributions({
    contributions: contributionsProp,
    view: 'widget',
  });

  return (
    <section
      className="h-full w-full bg-background"
      aria-label="Home dashboard"
    >
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 p-4"
        data-slot="widgets"
      >
        {widgets.length === 0 ? (
          <Card size="sm">
            <CardHeader>
              <CardTitle>Widgets</CardTitle>
              <CardDescription>
                Widgets slot — extension cards land here later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          widgets.map((contribution) => (
            <div
              key={contributionKey(contribution.extensionId, contribution.view)}
              className="min-h-40 overflow-hidden rounded-xl border border-border"
            >
              <ExtensionFrame contribution={contribution} visible />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
