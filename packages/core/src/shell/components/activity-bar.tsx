import {
  HandWavingIcon,
  HouseIcon,
  SquaresFourIcon,
  type Icon,
} from '@phosphor-icons/react';
import { useShellActiveView } from '@agentos/core/shell/hooks';
import {
  resolveExtensionIcon,
  useShellStore,
  type ShellView,
} from '@agentos/core/shell/lib';
import { Button } from '@agentos/ui/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@agentos/ui/components/tooltip';
import { cn } from '@agentos/ui/lib/utils';

type ActivityItem = {
  id: ShellView | 'extensions' | 'hitl';
  label: string;
  Icon: Icon;
  /** Opens Extension Manager instead of switching canvas view. */
  opensManager?: boolean;
  /** Opens HITL approvals inbox. */
  opensHitl?: boolean;
};

const FIXED_ITEMS: ActivityItem[] = [
  { id: 'home', label: 'Home', Icon: HouseIcon },
];

const MANAGER_ITEM: ActivityItem = {
  id: 'extensions',
  label: 'Extensions',
  Icon: SquaresFourIcon,
  opensManager: true,
};

const HITL_ITEM: ActivityItem = {
  id: 'hitl',
  label: 'Approvals',
  Icon: HandWavingIcon,
  opensHitl: true,
};

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

  const pageExtensionIds = new Set(
    contributions.filter((c) => c.view === 'page').map((c) => c.extensionId),
  );

  const extensionItems: ActivityItem[] = extensions
    .filter(
      (ext) => enabledById[ext.id] !== false && pageExtensionIds.has(ext.id),
    )
    .map((ext) => ({
      id: ext.id,
      label: ext.name,
      Icon: resolveExtensionIcon(ext.icon),
    }));

  const items = [...FIXED_ITEMS, ...extensionItems, HITL_ITEM, MANAGER_ITEM];

  return (
    <TooltipProvider>
      <nav
        className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-2"
        aria-label="Activity bar"
      >
        {items.map(({ id, label, Icon, opensManager, opensHitl }) => {
          const current = opensManager
            ? drawerOpen
            : opensHitl
              ? hitlInboxOpen
              : activeView === id;
          return (
            <Tooltip key={id}>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={label}
                    aria-current={current ? 'true' : undefined}
                    className={cn(
                      'text-muted-foreground',
                      current &&
                        'bg-sidebar-accent text-sidebar-accent-foreground',
                    )}
                    onClick={() => {
                      if (opensManager) {
                        setDrawerOpen(!drawerOpen);
                        return;
                      }
                      if (opensHitl) {
                        toggleHitlInbox();
                        return;
                      }
                      if (current) {
                        toggleSidebar();
                        return;
                      }
                      setActiveView(id);
                    }}
                  />
                }
              >
                <Icon
                  weight={current ? 'fill' : 'regular'}
                  className="size-4"
                />
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
