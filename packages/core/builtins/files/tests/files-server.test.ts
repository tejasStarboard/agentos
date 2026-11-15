import { describe, expect, test } from 'bun:test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createBlobStore } from '@agentos/core/builtins/files/api/lib/blob-store';
import { handleFilesRequest } from '@agentos/core/builtins/files/api/lib/handle-request';

describe('builtin files server', () => {
  test('put → get binary and json; reject traversal', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-files-test-'));
    const store = await createBlobStore(root);

    const health = await handleFilesRequest(
      store,
      new Request('http://127.0.0.1:6116/health'),
    );
    expect(health.status).toBe(200);

    const put = await handleFilesRequest(
      store,
      new Request('http://127.0.0.1:6116/blobs/notes/hello.txt', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ base64: btoa('hello') }),
      }),
    );
    expect(put.status).toBe(200);

    const get = await handleFilesRequest(
      store,
      new Request('http://127.0.0.1:6116/blobs/notes/hello.txt'),
    );
    expect(get.status).toBe(200);
    expect(await get.text()).toBe('hello');

    const getJson = await handleFilesRequest(
      store,
      new Request('http://127.0.0.1:6116/blobs/notes/hello.txt?format=json'),
    );
    expect(getJson.status).toBe(200);
    expect(await getJson.json()).toMatchObject({
      key: 'notes/hello.txt',
      base64: btoa('hello'),
    });

    // Encoded `../` so the URL parser does not normalize the key away.
    const traversal = await handleFilesRequest(
      store,
      new Request(
        `http://127.0.0.1:6116/blobs/${encodeURIComponent('../etc/passwd')}`,
        {
          method: 'PUT',
          body: 'x',
        },
      ),
    );
    expect(traversal.status).toBe(400);

    const missing = await handleFilesRequest(
      store,
      new Request('http://127.0.0.1:6116/blobs/missing.bin'),
    );
    expect(missing.status).toBe(404);
  });
});
