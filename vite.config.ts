import { copyFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** The app uses clean paths (/plan, /week-3). GitHub Pages serves 404.html for any path without a file, so shipping the
    app shell there makes deep links and refreshes work. (vite preview and most other hosts already fall back to index.html.) */
const spaFallback = (): Plugin => ({ name: 'spa-404-fallback', apply: 'build', closeBundle() { copyFileSync('dist/index.html', 'dist/404.html'); } });

export default defineConfig({ plugins: [react(), spaFallback()], base: '/', build: { chunkSizeWarningLimit: 900 } });
