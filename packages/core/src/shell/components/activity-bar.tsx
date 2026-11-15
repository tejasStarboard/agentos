import { useShellActiveView } from '@agentos/core/shell/hooks';
import {
  buildActivityBarSections,
  useShellStore,
  type ActivityBarItem,
} from '@agentos/core/shell/lib';
import { Button } from '@agentos/ui/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@agentos/ui/components/tooltip';
import { cn } from '@agentos/ui/lib/utils';

function ActivityIconButton({
  item,
  current,
  onActivate,
}: {
  item: ActivityBarItem;
  current: boolean;
  onActivate: () => void;
}) {
  const { id, label, Icon } = item;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-activity-id={id}
            aria-label={label}
            aria-current={current ? 'true' : undefined}
            className={cn(
              'text-muted-foreground',
              current && 'bg-sidebar-accent text-sidebar-accent-foreground',
            )}
            onClick={onActivate}
          />
        }
      >
        <Icon weight={current ? 'fill' : 'regular'} className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function ActivityBar() {
  const activeView = useShellActiveView();
  const drawerOpen = useShellStore((s) => s.drawerOpen);
  const hitlInboxOpen = useShellStore((s) => s.hitlInboxOpen);
  const setActiveView = useShellStore((s) => s.setActiveView);
  const setDrawerOpen = useShellStore((s) => s.setDrawerOpen);
  const toggleHitlInbox = useShellStore((s) => s.toggleHitlInbox);
  const toggleSidebar = useShellStore((s) => s.toggleSidebar);
  const extensions = useShellStore((s) => s.extensions);
  const enabledById = useShellStore((s) => s.enabledById);
  const contributions = useShellStore((s) => s.contributions);

  const { primary: primaryItems, secondary: secondaryItems } =
    buildActivityBarSections({ extensions, enabledById, contributions });

  function currentFor(item: ActivityBarItem): boolean {
    if (item.opensManager) return drawerOpen;
    if (item.opensHitl) return hitlInboxOpen;
    return activeView === item.id;
  }

  function activate(item: ActivityBarItem) {
    if (item.opensManager) {
      setDrawerOpen(!drawerOpen);
      return;
    }
    if (item.opensHitl) {
      toggleHitlInbox();
      return;
    }
    if (activeView === item.id) {
      toggleSidebar();
      return;
    }
    setActiveView(item.id);
  }

  return (
    <TooltipProvider>
      <nav
        className="flex h-full min-h-0 w-12 shrink-0 flex-col items-center overflow-hidden border-r border-border bg-sidebar py-2"
        aria-label="Activity bar"
      >
        <div
          data-slot="activity-bar-primary"
          className="flex w-full flex-col items-center gap-1"
        >
          {primaryItems.map((item) => (
            <ActivityIconButton
              key={item.id}
              item={item}
              current={currentFor(item)}
              onActivate={() => activate(item)}
            />
          ))}
        </div>
        <div
          data-slot="activity-bar-secondary"
          className="mt-auto flex w-full flex-col-reverse items-center gap-1"
        >
          {secondaryItems.map((item) => (
            <ActivityIconButton
              key={item.id}
              item={item}
              current={currentFor(item)}
              onActivate={() => activate(item)}
            />
          ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}
