import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  HostProvider,
  useHostAI,
  useHostApi,
  useHostHITL,
  useHostNotifications,
  useHostStorage,
} from '@agentos/core/client';
import type { HostAPIClient } from '@agentos/core/sdk';
import { createStubHost } from './stub-host';

describe('useHost* hooks', () => {
  test('throw when used outside HostProvider', () => {
    function Bad() {
      useHostStorage();
      return null;
    }

    expect(() => renderToStaticMarkup(createElement(Bad))).toThrow(
      /HostProvider/,
    );
  });

  test('delegate to injected HostAPI namespaces', async () => {
    const calls: string[] = [];
    const store = new Map<string, string>();
    const host = createStubHost(store, calls);

    let storage!: HostAPIClient['storage'];
    let ai!: HostAPIClient['ai'];
    let hitl!: HostAPIClient['hitl'];
    let notifications!: HostAPIClient['notifications'];
    let api!: HostAPIClient['api'];

    function Capture() {
      storage = useHostStorage();
      ai = useHostAI();
      hitl = useHostHITL();
      notifications = useHostNotifications();
      api = useHostApi();
      return createElement('span', { 'data-captured': '1' });
    }

    const html = renderToStaticMarkup(
      createElement(HostProvider, {
        host,
        children: createElement(Capture),
      }),
    );
    expect(html).toContain('data-captured="1"');

    await storage.set('k', 'v');
    expect(await storage.get('k')).toBe('v');
    await storage.remove('k');
    expect(await storage.get('k')).toBeNull();

    expect(await ai.generateText('hi')).toEqual({ text: 'echo:hi' });
    expect(await hitl.requestApproval({ title: 'Approve?' })).toEqual({
      approved: true,
      id: 'hitl-1',
    });
    await notifications.show('done', 'success');
    expect(await api.fetch('/x')).toEqual({
      ok: true,
      status: 200,
      body: '{}',
    });

    expect(calls).toEqual([
      'storage.set:k',
      'storage.get:k',
      'storage.remove:k',
      'storage.get:k',
      'ai.generateText:hi',
      'hitl.requestApproval:Approve?',
      'notifications.show:success:done',
      'api.fetch:/x',
    ]);
  });
});
