import { describe, expect, test } from 'bun:test';

import { buildEnabledAgentRegistry } from '@agentos/core/agent/lib/build-enabled-agent-registry';
import type {
  RegistryModel,
  ScannedExtension,
} from '@agentos/core/vite/lib/types';

function ext(
  partial: Pick<ScannedExtension, 'id' | 'kind' | 'toggleable'> &
    Partial<ScannedExtension>,
): ScannedExtension {
  return {
    driven: partial.kind === 'builtin',
    rootDir: `/tmp/${partial.id}`,
    name: partial.id,
    meta: {},
    ui: {},
    uiEntries: {},
    agent: {},
    agentDescriptors: { tools: [], skills: [] },
    ...partial,
  };
}

describe('buildEnabledAgentRegistry', () => {
  test('returns only enabled extensions with agent contributions', () => {
    const scannedAt = 1_700_000_000_000;
    const model: RegistryModel = {
      scannedAt,
      extensions: [
        ext({
          id: 'auth',
          kind: 'builtin',
          toggleable: false,
          name: 'Auth',
          agentDescriptors: { tools: [], skills: [] },
        }),
        ext({
          id: 'crm',
          kind: 'customer',
          toggleable: true,
          name: 'CRM',
          agentDescriptors: {
            tools: [{ name: 'search' }],
            skills: ['search-contacts'],
          },
        }),
        ext({
          id: 'invoices',
          kind: 'customer',
          toggleable: true,
          name: 'Invoices',
          agentDescriptors: {
            tools: [{ name: 'list' }],
            skills: ['payout'],
          },
        }),
      ],
    };

    const disabled = new Set(['invoices']);
    const result = buildEnabledAgentRegistry(
      model,
      (extension) => !disabled.has(extension.id),
    );

    expect(result.scannedAt).toBe(scannedAt);
    expect(result.extensions).toEqual([
      {
        id: 'auth',
        name: 'Auth',
        kind: 'builtin',
        driven: true,
        tools: [],
        skills: [],
        instructions: '',
      },
      {
        id: 'crm',
        name: 'CRM',
        kind: 'customer',
        driven: false,
        tools: [{ name: 'search' }],
        skills: ['search-contacts'],
        instructions: '',
      },
    ]);
  });

  test('includes instructions.md contents when present', () => {
    const instructionsPath = `${import.meta.dir}/../../vite/tests/fixtures/extensions/crm/agent/instructions.md`;
    const model: RegistryModel = {
      scannedAt: 1,
      extensions: [
        ext({
          id: 'crm',
          kind: 'customer',
          toggleable: true,
          name: 'CRM',
          agent: { instructions: instructionsPath },
        }),
      ],
    };

    const result = buildEnabledAgentRegistry(model, () => true);
    expect(result.extensions[0]?.instructions.length).toBeGreaterThan(0);
  });
});
