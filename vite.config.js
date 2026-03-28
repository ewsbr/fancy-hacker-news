import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'path';

const COMPONENT_STYLE_PLACEHOLDER = '__HN_COMPONENT_STYLES__';

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

function escapeForTemplateLiteral(value) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${');
}

function inlineComponentStyles() {
  return {
    name: 'inline-component-styles',
    enforce: 'post',

    resolveId(id) {
      if (id === 'virtual:component-styles') {
        return '\0virtual:component-styles';
      }
    },

    load(id) {
      if (id === '\0virtual:component-styles') {
        return `export default ${JSON.stringify(COMPONENT_STYLE_PLACEHOLDER)};`;
      }
    },

    writeBundle(options, bundle) {
      if (TARGET !== 'content') {
        return;
      }

      const outDir = options.dir ?? cfg.outDir;
      const cssAssets = Object.values(bundle).filter((output) => {
        return output.type === 'asset' && output.fileName.endsWith('.css');
      });

      const combinedCss = cssAssets
        .map((asset) => readFileSync(resolve(outDir, asset.fileName), 'utf8'))
        .join('\n');

      for (const output of Object.values(bundle)) {
        if (output.type === 'chunk' && output.fileName.endsWith('.js')) {
          const filePath = resolve(outDir, output.fileName);
          const code = readFileSync(filePath, 'utf8').replaceAll(
            COMPONENT_STYLE_PLACEHOLDER,
            escapeForTemplateLiteral(combinedCss),
          );

          writeFileSync(filePath, code);
        }
      }

      for (const asset of cssAssets) {
        rmSync(resolve(outDir, asset.fileName), { force: true });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isFirefox = mode === 'firefox';

  return {
    plugins: [vue(), inlineComponentStyles()],

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
