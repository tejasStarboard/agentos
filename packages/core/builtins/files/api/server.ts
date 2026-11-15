import { keys } from './env';
import { createBlobStore } from './lib/blob-store';
import { FILES_PORT } from './lib/constants';
import { handleFilesRequest } from './lib/handle-request';

const env = keys();

const port = env.AGENT_OS_EXT_FILES_PORT ?? FILES_PORT;

const store = await createBlobStore(env.AGENT_OS_EXT_FILES_PATH);

const server = Bun.serve({
  port,
  async fetch(request) {
    return handleFilesRequest(store, request);
  },
});

console.log(
  `[agentos files] listening on http://127.0.0.1:${server.port} (proxy /api/ext/files/*) root=${store.rootDir}`,
);
