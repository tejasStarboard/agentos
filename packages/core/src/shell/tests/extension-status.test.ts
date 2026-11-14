import { describe, expect, test } from 'bun:test';
import {
  contributionKey,
  deriveExtensionManagerStatus,
} from '@agentos/core/shell/lib';

describe('deriveExtensionManagerStatus', () => {
  const contributions = [
    { extensionId: 'crm', view: 'page' as const, src: '/crm.html' },
    { extensionId: 'crm', view: 'sidebar' as const, src: '/crm-side.html' },
  ];

  test('disabled wins over frame status', () => {
    expect(
      deriveExtensionManagerStatus('crm', false, contributions, {
        [contributionKey('crm', 'page')]: 'active',
      }),
    ).toBe('disabled');
  });

  test('crashed if any frame crashed', () => {
    expect(
      deriveExtensionManagerStatus('crm', true, contributions, {
        [contributionKey('crm', 'page')]: 'active',
        [contributionKey('crm', 'sidebar')]: 'crashed',
      }),
    ).toBe('crashed');
  });

  test('loading if any frame loading or missing status', () => {
    expect(
      deriveExtensionManagerStatus('crm', true, contributions, {
        [contributionKey('crm', 'page')]: 'loading',
        [contributionKey('crm', 'sidebar')]: 'active',
      }),
    ).toBe('loading');

    expect(
      deriveExtensionManagerStatus('crm', true, contributions, {
        [contributionKey('crm', 'page')]: 'active',
      }),
    ).toBe('loading');
  });

  test('active when all frames active', () => {
    expect(
      deriveExtensionManagerStatus('crm', true, contributions, {
        [contributionKey('crm', 'page')]: 'active',
        [contributionKey('crm', 'sidebar')]: 'active',
      }),
    ).toBe('active');
  });

  test('active with no frames when enabled', () => {
    expect(deriveExtensionManagerStatus('auth', true, [], {})).toBe('active');
  });
});
