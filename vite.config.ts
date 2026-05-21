import { posix, resolve } from 'node:path';
import process from 'node:process';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

/**
 * Each entry (content script, background) is built as a standalone IIFE so it
 * works as a classic browser-extension script without a module loader.
 *
 * Production builds target both Firefox and Chromium from the same output.
 *
 * Core commands:
 *   pnpm build              → runs content then background
 *   pnpm build:content      → content script only
 *   pnpm build:background   → background/service-worker only
 */
const entries = {
  content: {
    entry: resolve(import.meta.dirname, 'src/content/main.ts'),
    libName: 'HNContent',
    fileName: () => 'content.js',
    outDir: 'dist/content',
    emptyOutDir: false,
  },
  antiFouc: {
    entry: resolve(import.meta.dirname, 'src/content/anti-fouc.ts'),
    libName: 'HNAntiFouc',
    fileName: () => 'anti-fouc.js',
    outDir: 'dist/content',
    emptyOutDir: false,
  },
  background: {
    entry: resolve(import.meta.dirname, 'src/background/background.js'),
    libName: 'HNBackground',
    fileName: () => 'background.js',
    outDir: 'dist/background',
    emptyOutDir: false,
  },
};

type BuildTarget = keyof typeof entries;
interface RenderBuiltUrlContext {
  hostType: 'js' | 'css' | 'html';
  type: 'asset' | 'public';
}

const TARGET: BuildTarget = process.env.BUILD_TARGET === 'background'
  ? 'background'
  : process.env.BUILD_TARGET === 'anti-fouc'
    ? 'antiFouc'
    : 'content';
const cfg = entries[TARGET];

function renderExtensionAssetUrl(filename: string, { hostType, type }: RenderBuiltUrlContext) {
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
  return {
    base: '',
    plugins: [
      vue(),
      Icons({
        compiler: 'vue3',
      }),
    ],

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
      target: ['chrome88', 'firefox109'],
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
