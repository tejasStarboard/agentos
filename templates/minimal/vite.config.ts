import { agentos } from '@agentos/core/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [agentos(), tailwindcss()],
  resolve: {
    alias: {
      '@extensions': path.join(rootDir, 'extensions'),
    },
  },
  server: {
    port: 5173,
  },
});
