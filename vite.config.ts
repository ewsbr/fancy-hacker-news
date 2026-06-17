import { posix, resolve } from 'node:path';
import process from 'node:process';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

const projectRoot = import.meta.dirname;
const settingsRoot = resolve(projectRoot, 'src/settings');

/**
 * Each entry is built as a standalone IIFE so it
 * works as a classic browser-extension script without a module loader.
 *
 * Production builds target both Firefox and Chromium from the same output.
 *
 * Core commands:
 *   pnpm build              → builds content, anti-FOUC, settings, and background assets
 *   pnpm build:content      → content and anti-FOUC scripts only
 */
const entries = {
  content: {
    kind: 'script',
    entry: resolve(projectRoot, 'src/content/main.ts'),
    libName: 'HNContent',
    fileName: () => 'content.js',
    outDir: 'dist/content',
    emptyOutDir: false,
  },
  antiFouc: {
    kind: 'script',
    entry: resolve(projectRoot, 'src/content/anti-fouc.ts'),
    libName: 'HNAntiFouc',
    fileName: () => 'anti-fouc.js',
    outDir: 'dist/content',
    emptyOutDir: false,
  },
  settings: {
    kind: 'html',
    entry: resolve(settingsRoot, 'settings.html'),
    outDir: resolve(projectRoot, 'dist'),
    emptyOutDir: false,
  },
  background: {
    kind: 'script',
    entry: resolve(projectRoot, 'src/background/main.ts'),
    libName: 'HNBackground',
    fileName: () => 'background.js',
    outDir: 'dist/background',
    emptyOutDir: true,
  },
} as const;

type BuildTarget = keyof typeof entries;
interface RenderBuiltUrlContext {
  hostType: 'js' | 'css' | 'html';
  type: 'asset' | 'public';
}

const TARGET: BuildTarget = process.env.BUILD_TARGET === 'anti-fouc'
  ? 'antiFouc'
  : process.env.BUILD_TARGET === 'settings'
    ? 'settings'
    : process.env.BUILD_TARGET === 'background'
      ? 'background'
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
  const isScriptTarget = cfg.kind === 'script';

  return {
    root: isScriptTarget ? projectRoot : settingsRoot,
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
        '@': resolve(projectRoot, 'src'),
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
        output: isScriptTarget
          ? {
              format: 'iife',
              entryFileNames: cfg.fileName(),
              assetFileNames: 'assets/[name].[ext]',
            }
          : {
              entryFileNames: 'settings/assets/[name].js',
              assetFileNames: 'settings/assets/[name].[ext]',
            },
      },
    },
  };
});
