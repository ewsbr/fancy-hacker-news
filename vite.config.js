import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

/**
 * Each entry (content script, background) is built as a standalone IIFE so it
 * works as a classic browser-extension script without a module loader.
 *
 * Build both:
 *   pnpm build              → runs content then background
 *   pnpm build:content      → content script only
 *   pnpm build:background   → background/service-worker only
 */
const TARGET = process.env.BUILD_TARGET ?? 'content';

const entries = {
  content: {
    entry: resolve(import.meta.dirname, 'src/content/main.ts'),
    libName: 'HNContent',
    fileName: () => 'content.js',
    outDir: 'dist/content',
    emptyOutDir: true,
  },
  background: {
    entry: resolve(import.meta.dirname, 'src/background/background.js'),
    libName: 'HNBackground',
    fileName: () => 'background.js',
    outDir: 'dist/background',
    emptyOutDir: false,
  },
};

const cfg = entries[TARGET];

export default defineConfig(({ mode }) => {
  const isFirefox = mode === 'firefox';

  return {
    plugins: [vue(), tailwindcss()],

    define: {
      // Replace Node.js globals so the IIFE bundle works in browser extensions.
      'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
    },

    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },

    build: {
      outDir: cfg.outDir,
      emptyOutDir: cfg.emptyOutDir,
      sourcemap: true,
      target: ['chrome88', isFirefox ? 'firefox109' : 'chrome88'],

      lib: {
        entry: cfg.entry,
        name: cfg.libName,
        formats: ['iife'],
        fileName: cfg.fileName,
      },
    },
  };
});
