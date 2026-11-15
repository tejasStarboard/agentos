import { mkdir } from 'node:fs/promises';
import { join, normalize, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';

export class BlobStoreError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'BlobStoreError';
  }
}

function defaultRoot(): string {
  return join(tmpdir(), 'agentos-files');
}

/** Resolve a blob key under root; reject path traversal. */
export function resolveBlobPath(rootDir: string, key: string): string {
  const trimmed = key.replace(/^\/+/, '').trim();
  if (!trimmed || trimmed.includes('\0')) {
    throw new BlobStoreError('invalid key', 400);
  }
  const root = resolve(rootDir);
  const target = resolve(root, normalize(trimmed));
  if (target !== root && !target.startsWith(root + sep)) {
    throw new BlobStoreError('path traversal rejected', 400);
  }
  return target;
}

export type BlobStore = {
  rootDir: string;
  put: (key: string, bytes: Uint8Array) => Promise<void>;
  get: (key: string) => Promise<Uint8Array | null>;
};

export async function createBlobStore(
  rootDir: string = defaultRoot(),
): Promise<BlobStore> {
  const root = resolve(rootDir);
  await mkdir(root, { recursive: true });

  return {
    rootDir: root,
    async put(key, bytes) {
      const path = resolveBlobPath(root, key);
      await mkdir(join(path, '..'), { recursive: true });
      await Bun.write(path, bytes);
    },
    async get(key) {
      const path = resolveBlobPath(root, key);
      const file = Bun.file(path);
      if (!(await file.exists())) return null;
      return new Uint8Array(await file.arrayBuffer());
    },
  };
}
