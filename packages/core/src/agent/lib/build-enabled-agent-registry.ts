import { readFileSync } from 'node:fs';

import type {
  RegistryModel,
  ScannedExtension,
  ToolDescriptor,
} from '@agentos/core/vite/lib/types';

/** One enabled extension's agent contributions for the control-plane registry. */
export type AgentRegistryExtension = {
  id: string;
  name: string;
  kind: ScannedExtension['kind'];
  driven: boolean;
  tools: ToolDescriptor[];
  skills: string[];
  /** Contents of `agent/instructions.md` when present. */
  instructions: string;
};

/** Payload for `GET /api/agent/registry`. */
export type EnabledAgentRegistry = {
  scannedAt: number;
  extensions: AgentRegistryExtension[];
};

function readInstructions(path: string | undefined): string {
  if (!path) return '';
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.warn(
      `[agentos] failed to read instructions.md: ${path} (${detail})`,
    );
    return '';
  }
}

/**
 * Project the filesystem registry to agent contributions for currently
 * enabled extensions only (no UI paths / rootDir).
 */
export function buildEnabledAgentRegistry(
  model: RegistryModel,
  isEnabled: (extension: ScannedExtension) => boolean,
): EnabledAgentRegistry {
  return {
    scannedAt: model.scannedAt,
    extensions: model.extensions
      .filter((ext) => isEnabled(ext))
      .map((ext) => ({
        id: ext.id,
        name: ext.name,
        kind: ext.kind,
        driven: ext.driven,
        tools: ext.agentDescriptors.tools,
        skills: ext.agentDescriptors.skills,
        instructions: readInstructions(ext.agent.instructions),
      })),
  };
}
