import { useShellStore } from '@agentos/core/shell/lib';

/** Whether the HITL approvals inbox sheet is open. */
export function useShellHitlInboxOpen(): boolean {
  return useShellStore((s) => s.hitlInboxOpen);
}
