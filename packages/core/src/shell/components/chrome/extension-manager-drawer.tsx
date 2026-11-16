import {
  FunnelIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import { useShellExtensions } from '@agentos/core/shell/hooks';
import {
  deriveExtensionManagerStatus,
  resolveExtensionIcon,
  useShellStore,
  type ContributionRuntimeStatus,
  type ExtensionEntry,
  type UiContribution,
} from '@agentos/core/shell/lib';
import { Button } from '@agentos/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@agentos/ui/components/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@agentos/ui/components/input-group';
import { ScrollArea } from '@agentos/ui/components/scroll-area';
import { Switch } from '@agentos/ui/components/switch';
import { useMemo, useState } from 'react';

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
  const ExtIcon = resolveExtensionIcon(entry.icon);

  return (
    <li
      className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0"
      data-extension-id={entry.id}
      data-kind={entry.kind}
      data-status={status}
      data-icon={entry.icon ?? 'Cube'}
    >
      <ExtIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
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

  const [searchQuery, setSearchQuery] = useState('');
  /** When false (default), builtins are hidden from the manager list. */
  const [showBuiltin, setShowBuiltin] = useState(false);

  const filteredExtensions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return extensions.filter((entry) => {
      if (!showBuiltin && entry.kind === 'builtin') return false;
      if (q === '') return true;
      return (
        entry.name.toLowerCase().includes(q) ||
        entry.id.toLowerCase().includes(q)
      );
    });
  }, [extensions, searchQuery, showBuiltin]);

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      data-slot="extension-manager-list"
    >
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-2">
        <InputGroup className="min-w-0 flex-1">
          <InputGroupInput
            placeholder="Search extensions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search extensions"
          />
          <InputGroupAddon>
            <MagnifyingGlassIcon
              className="size-4 shrink-0 opacity-50"
              aria-hidden
            />
          </InputGroupAddon>
        </InputGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Filter extensions"
                data-slot="extension-manager-filter"
                data-show-builtin={showBuiltin ? 'true' : 'false'}
              />
            }
          >
            <FunnelIcon
              className="size-4"
              weight={showBuiltin ? 'fill' : 'regular'}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>View Selected</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showBuiltin}
                onCheckedChange={(checked) => setShowBuiltin(checked === true)}
              >
                builtin
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="list-none p-0" aria-label="Extension list">
          {filteredExtensions.map((entry) => (
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
      </ScrollArea>
    </div>
  );
}

/** Left-sidebar Extension Manager panel (no Sheet overlay). */
export function ExtensionManagerPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col" data-slot="extension-manager">
      <p className="shrink-0 px-2 pt-2 text-xs text-muted-foreground">
        Extensions
      </p>
      <div className="min-h-0 flex-1">
        <ExtensionManagerList />
      </div>
    </div>
  );
}

/** @deprecated Prefer ExtensionManagerPanel — kept for export stability. */
export const ExtensionManagerDrawer = ExtensionManagerPanel;
