import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';

import {
  serializeRegistryModule,
  skillsBindingName,
} from '@agentos/core/vite/lib/serialize-registry';
import type { RegistryModel } from '@agentos/core/vite/lib/types';

describe('serializeRegistryModule', () => {
  test('skillsBindingName sanitizes ids', () => {
    expect(skillsBindingName('crm')).toBe('__agentos_skills_crm');
    expect(skillsBindingName('db-store')).toBe('__agentos_skills_db_store');
  });

  test('emits skills imports and registry export', () => {
    const skillsPath = join('/tmp', 'crm', 'agent', 'skills.ts');
    const model: RegistryModel = {
      scannedAt: 42,
      extensions: [
        {
          id: 'crm',
          kind: 'customer',
          driven: false,
          toggleable: true,
          rootDir: '/tmp/crm',
          name: 'CRM',
          meta: {},
          ui: { page: '/tmp/crm/ui/page.tsx' },
          uiEntries: { page: '/__agentos/ext/crm/page.html' },
          agent: { skills: skillsPath, tools: '/tmp/crm/agent/tools.json' },
          agentDescriptors: {
            tools: [{ name: 'search_contacts' }],
            skills: [],
          },
        },
        {
          id: 'auth',
          kind: 'builtin',
          driven: true,
          toggleable: false,
          rootDir: '/tmp/auth',
          name: 'Auth',
          meta: {},
          ui: {},
          uiEntries: {},
          agent: {},
          agentDescriptors: { tools: [], skills: [] },
        },
      ],
    };

    const source = serializeRegistryModule(model);
    expect(source).toContain(
      `import { skills as __agentos_skills_crm } from ${JSON.stringify(skillsPath)};`,
    );
    expect(source).toContain('export const registry =');
    expect(source).toContain('"id": "crm"');
    expect(source).toContain('"driven": false');
    expect(source).toContain('"toggleable": true');
    expect(source).toContain('"driven": true');
    expect(source).toContain('"/__agentos/ext/crm/page.html"');
    expect(source).toContain('"name": "search_contacts"');
    // Skills binding (not a JSON string) after placeholder replacement
    expect(source).toMatch(/"skills":\s*__agentos_skills_crm/);
    expect(source).not.toContain('__AGENTOS_SKILLS__');
  });
});
