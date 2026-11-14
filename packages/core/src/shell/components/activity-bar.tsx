import { HouseIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { useShellActiveView } from '@agentos/core/shell/hooks';
import { useShellStore, type ShellView } from '@agentos/core/shell/lib';
import { Button } from '@agentos/ui/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@agentos/ui/components/tooltip';
import { cn } from '@agentos/ui/lib/utils';

const ITEMS: {
  id: ShellView;
  label: string;
  Icon: typeof HouseIcon;
}[] = [
  { id: 'home', label: 'Home', Icon: HouseIcon },
  { id: 'ext-placeholder', label: 'Extensions', Icon: SquaresFourIcon },
];

export function ActivityBar() {
  const activeView = useShellActiveView();
  const setActiveView = useShellStore((s) => s.setActiveView);
  const toggleSidebar = useShellStore((s) => s.toggleSidebar);

  return (
    <TooltipProvider>
      <nav
        className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-2"
        aria-label="Activity bar"
      >
        {ITEMS.map(({ id, label, Icon }) => {
          const current = activeView === id;
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
