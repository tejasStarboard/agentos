import { useEffect, useMemo, useState } from 'react';
import {
  collectEnabledSkills,
  useShellStore,
  type PaletteSkill,
} from '@agentos/core/shell/lib';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@agentos/ui/components/command';
import { toast } from '@agentos/ui/components/toast';

/** True when the event is ⌘K / Ctrl+K (case-insensitive). */
export function isCommandPaletteHotkey(
  event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey'>,
): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
}

export function groupPaletteSkills(
  skills: PaletteSkill[],
): Map<string, PaletteSkill[]> {
  const map = new Map<string, PaletteSkill[]>();
  for (const item of skills) {
    const list = map.get(item.extensionId) ?? [];
    list.push(item);
    map.set(item.extensionId, list);
  }
  return map;
}

export type CommandPaletteProps = {
  /** Controlled open state (tests / hosts). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override skills (SSR / tests — Dialog portal skips children in SSR). */
  skills?: PaletteSkill[];
};

/** Skill list body — testable without Dialog portal. */
export function CommandPaletteSkills({
  skills,
  onSelect,
}: {
  skills: PaletteSkill[];
  onSelect?: (extensionId: string, skill: string) => void;
}) {
  const grouped = useMemo(() => groupPaletteSkills(skills), [skills]);

  return (
    <Command data-slot="command-palette-root">
      <CommandInput placeholder="Search skills…" />
      <CommandList>
        <CommandEmpty>No skills found.</CommandEmpty>
        {[...grouped.entries()].map(([extensionId, items]) => (
          <CommandGroup
            key={extensionId}
            heading={items[0]?.extensionName ?? extensionId}
          >
            {items.map((item) => (
              <CommandItem
                key={`${item.extensionId}:${item.skill}`}
                value={`${item.extensionName} ${item.skill}`}
                onSelect={() => onSelect?.(item.extensionId, item.skill)}
              >
                {item.skill}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}

export function CommandPalette(props: CommandPaletteProps = {}) {
  const { open: openProp, onOpenChange, skills: skillsProp } = props;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const skillsByExtension = useShellStore((s) => s.skillsByExtension);
  const enabledById = useShellStore((s) => s.enabledById);
  const extensions = useShellStore((s) => s.extensions);
  const setStatusText = useShellStore((s) => s.setStatusText);

  const skills = useMemo(() => {
    if (skillsProp) return skillsProp;
    return collectEnabledSkills(skillsByExtension, enabledById, extensions);
  }, [skillsProp, skillsByExtension, enabledById, extensions]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isCommandPaletteHotkey(event)) return;
      event.preventDefault();
      setOpen(!open);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  const runSkill = (extensionId: string, skill: string) => {
    const message = `Skill: ${extensionId}/${skill}`;
    toast.add({ title: message, type: 'info' });
    setStatusText(message, 'info');
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandPaletteSkills skills={skills} onSelect={runSkill} />
    </CommandDialog>
  );
}
