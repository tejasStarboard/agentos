import { agentos } from '@agentos/core/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [agentos(), tailwindcss()],
  server: {
    port: 5173,
  },
});
