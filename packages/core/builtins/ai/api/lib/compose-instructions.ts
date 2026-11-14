export type InstructionSource = {
  id: string;
  instructions?: string;
};

/**
 * Compose enabled extensions' `instructions.md` into a single system prompt.
 */
export function composeInstructions(sources: InstructionSource[]): string {
  const sections: string[] = [];
  for (const source of sources) {
    const text = source.instructions?.trim();
    if (!text) continue;
    sections.push(`## ${source.id}\n\n${text}`);
  }
  if (sections.length === 0) {
    return 'You are the AgentOS platform assistant.';
  }
  return [
    'You are the AgentOS platform assistant.',
    'Follow these extension instructions:',
    '',
    ...sections,
  ].join('\n');
}
