import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { posix, resolve } from 'path';

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

function renderExtensionAssetUrl(filename, { hostType, type }) {
  if (TARGET !== 'content') {
    return undefined;
  }

  if (hostType !== 'js') {
    return { relative: true };
  }

  const assetPath = type === 'asset'
    ? posix.join(cfg.outDir, filename)
    : filename;

  return {
    // Content scripts execute against the host page, so JS asset URLs must be
    // rebound to the extension origin instead of the page origin.
    runtime: `chrome.runtime.getURL(${JSON.stringify(assetPath)})`,
  };
}

export default defineConfig(({ mode }) => {
  const isFirefox = mode === 'firefox';

  return {
    base: '',
    plugins: [vue()],

    define: {
      // Replace Node.js globals so the IIFE bundle works in browser extensions.
      'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
    },

    experimental: {
      renderBuiltUrl: renderExtensionAssetUrl,
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
      assetsInlineLimit: 0, // Prevent Vite from inlining fonts as base64 data URIs
      cssCodeSplit: false,

      rollupOptions: {
        input: cfg.entry,
        output: {
          format: 'iife',
          entryFileNames: cfg.fileName(),
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  };
});
