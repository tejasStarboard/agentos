import {
  useShellActiveView,
  useShellContributions,
} from '@agentos/core/shell/hooks';
import {
  contributionKey,
  type ShellView,
  type UiContribution,
} from '@agentos/core/shell/lib';
import { cn } from '@agentos/ui/lib/utils';
import { ExtensionFrame } from '../ui-contribs/extension-frame';

export type MainCanvasProps = {
  /** Override store contributions (tests / controlled hosts). */
  contributions?: UiContribution[];
  /** Override store active view. */
  activeView?: ShellView;
};

/** Main extension page slot — all pages stay mounted; inactive are parked hidden. */
export function MainCanvas({
  contributions: contributionsProp,
  activeView: activeViewProp,
}: MainCanvasProps) {
  const activeView = useShellActiveView(activeViewProp);
  const pages = useShellContributions({
    contributions: contributionsProp,
    view: 'page',
  });

  return (
    <section
      className="relative h-full w-full bg-background"
      data-slot="main"
      aria-label="Main canvas"
    >
      {pages.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          Main canvas slot
        </div>
      ) : (
        pages.map((contribution) => {
          const active = activeView === contribution.extensionId;
          return (
            <div
              key={contributionKey(contribution.extensionId, contribution.view)}
              className={cn('h-full w-full', !active && 'hidden')}
              hidden={!active}
              aria-hidden={!active}
            >
              <ExtensionFrame contribution={contribution} visible={active} />
            </div>
          );
        })
      )}
    </section>
  );
}
