import { LockSimpleIcon } from '@phosphor-icons/react';
import {
  useShellDrawerOpen,
  useShellExtensions,
} from '@agentos/core/shell/hooks';
import {
  deriveExtensionManagerStatus,
  useShellStore,
  type ContributionRuntimeStatus,
  type ExtensionEntry,
  type ExtensionManagerStatus,
  type UiContribution,
} from '@agentos/core/shell/lib';
import { Badge } from '@agentos/ui/components/badge';
import { ScrollArea } from '@agentos/ui/components/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@agentos/ui/components/sheet';
import { Switch } from '@agentos/ui/components/switch';
import { cn } from '@agentos/ui/lib/utils';

const STATUS_VARIANT: Record<
  ExtensionManagerStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  loading: 'secondary',
  disabled: 'outline',
  crashed: 'destructive',
};

export type ExtensionManagerListProps = {
  /** Override catalog (tests / controlled hosts). */
  extensions?: ExtensionEntry[];
  enabledById?: Record<string, boolean>;
  contributions?: UiContribution[];
  runtimeStatus?: Record<string, ContributionRuntimeStatus>;
  onSetEnabled?: (extensionId: string, enabled: boolean) => void;
};

function ExtensionRow({
  entry,
  enabled,
  contributions,
  runtimeStatus,
  onSetEnabled,
}: {
  entry: ExtensionEntry;
  enabled: boolean;
  contributions: UiContribution[];
  runtimeStatus: Record<string, ContributionRuntimeStatus>;
  onSetEnabled: (extensionId: string, enabled: boolean) => void;
}) {
  const status = deriveExtensionManagerStatus(
    entry.id,
    enabled,
    contributions,
    runtimeStatus,
  );
  const locked = !entry.toggleable;

  return (
    <li
      className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
      data-extension-id={entry.id}
      data-kind={entry.kind}
      data-status={status}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">
            {entry.name}
          </span>
          {locked ? (
            <LockSimpleIcon
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-label="Locked"
            />
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {entry.kind}
          <span className="mx-1 text-border">·</span>
          {entry.id}
        </p>
      </div>
      <Badge
        variant={STATUS_VARIANT[status]}
        className={cn('shrink-0 capitalize')}
      >
        {status}
      </Badge>
      <Switch
        size="sm"
        checked={enabled}
        disabled={locked}
        aria-label={
          locked
            ? `${entry.name} is always on`
            : `${enabled ? 'Disable' : 'Enable'} ${entry.name}`
        }
        onCheckedChange={(checked) => {
          onSetEnabled(entry.id, checked);
        }}
      />
    </li>
  );
}

/** Presentational list (accepts overrides for SSR-friendly tests). */
export function ExtensionManagerList(props: ExtensionManagerListProps = {}) {
  const storeExtensions = useShellExtensions();
  const storeEnabledById = useShellStore((s) => s.enabledById);
  const storeContributions = useShellStore((s) => s.contributions);
  const storeRuntimeStatus = useShellStore((s) => s.runtimeStatus);
  const setExtensionEnabled = useShellStore((s) => s.setExtensionEnabled);

  const extensions = props.extensions ?? storeExtensions;
  const enabledById = props.enabledById ?? storeEnabledById;
  const contributions = props.contributions ?? storeContributions;
  const runtimeStatus = props.runtimeStatus ?? storeRuntimeStatus;
  const onSetEnabled = props.onSetEnabled ?? setExtensionEnabled;

  return (
    <ul
      className="list-none p-0"
      aria-label="Extension list"
      data-slot="extension-manager-list"
    >
      {extensions.map((entry) => (
        <ExtensionRow
          key={entry.id}
          entry={entry}
          enabled={enabledById[entry.id] !== false}
          contributions={contributions}
          runtimeStatus={runtimeStatus}
          onSetEnabled={onSetEnabled}
        />
      ))}
    </ul>
  );
}

/** Right-side Extension Manager: list, lock builtins, toggle customers. */
export function ExtensionManagerDrawer() {
  const open = useShellDrawerOpen();
  const setDrawerOpen = useShellStore((s) => s.setDrawerOpen);

  return (
    <Sheet open={open} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-md"
        data-slot="extension-manager"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>Extensions</SheetTitle>
          <SheetDescription>
            Toggle customer extensions. Builtins stay on.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <ExtensionManagerList />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
