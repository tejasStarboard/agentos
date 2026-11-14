import { describe, expect, test } from 'bun:test';

import { createAiModels } from '../api/lib/create-model';
import { handleAiRequest } from '../api/lib/handle-request';

describe('builtin ai server', () => {
  const models = createAiModels();
  const gatewayUrl = 'http://127.0.0.1:5173';

  test('health OK', async () => {
    const res = await handleAiRequest(
      { models, gatewayUrl },
      new Request('http://127.0.0.1:6113/health'),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, mode: 'mock' });
  });

  test('generate-text returns mock text', async () => {
    const res = await handleAiRequest(
      { models, gatewayUrl },
      new Request('http://127.0.0.1:6113/generate-text', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'hello' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { text: string };
    expect(body.text).toContain('hello');
  });

  test('generate-image returns mock image payload', async () => {
    const res = await handleAiRequest(
      { models, gatewayUrl },
      new Request('http://127.0.0.1:6113/generate-image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'a cat' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      stub: boolean;
      base64: string | null;
    };
    expect(body.stub).toBe(true);
    expect(typeof body.base64).toBe('string');
    expect((body.base64 ?? '').length).toBeGreaterThan(0);
  });

  test('embed returns mock embedding', async () => {
    const res = await handleAiRequest(
      { models, gatewayUrl },
      new Request('http://127.0.0.1:6113/embed', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value: 'hello' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      embedding: number[];
      stub: boolean;
    };
    expect(body.stub).toBe(true);
    expect(body.embedding.length).toBeGreaterThan(0);
  });

  test('chat composes instructions and generates text', async () => {
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/api/agent/registry')) {
        return new Response(
          JSON.stringify({
            scannedAt: 1,
            extensions: [
              {
                id: 'crm',
                name: 'CRM',
                instructions: 'Prefer concise CRM answers.',
                tools: [],
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      return new Response('not found', { status: 404 });
    };

    const res = await handleAiRequest(
      { models, gatewayUrl, fetchImpl },
      new Request('http://127.0.0.1:6113/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'status?' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { text: string };
    expect(body.text).toContain('Prefer concise CRM answers');
    expect(body.text).toContain('status?');
  });

  test('chat runs tools through gateway', async () => {
    const toolCalls: string[] = [];
    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/agent/registry')) {
        return new Response(
          JSON.stringify({
            scannedAt: 1,
            extensions: [
              {
                id: 'crm',
                tools: [{ name: 'search_contacts', method: 'POST' }],
                instructions: '',
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      if (url.includes('/api/ext/crm/tools/search_contacts')) {
        toolCalls.push(url);
        return new Response(JSON.stringify({ contacts: [{ name: 'Ada' }] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(`unexpected ${url} ${init?.method}`, { status: 500 });
    };

    const res = await handleAiRequest(
      { models, gatewayUrl, fetchImpl },
      new Request('http://127.0.0.1:6113/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt: '/tool crm.search_contacts {"q":"Ada"}',
        }),
      }),
    );
    expect(res.status).toBe(200);
    expect(toolCalls).toEqual([
      'http://127.0.0.1:5173/api/ext/crm/tools/search_contacts',
    ]);
    const body = (await res.json()) as { text: string };
    expect(body.text).toContain('Ada');
  });
});
