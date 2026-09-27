import { defineConfig } from 'vite';

// Relative base so the static build works from any path (GitHub Pages, Netlify, a sub-folder…).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
  server: { host: true },
});
