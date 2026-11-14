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
};

/** Payload for `GET /api/agent/registry`. */
export type EnabledAgentRegistry = {
  scannedAt: number;
  extensions: AgentRegistryExtension[];
};

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
      })),
  };
}
