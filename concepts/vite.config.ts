import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(import.meta.dirname),
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@concepts': resolve(import.meta.dirname, 'src'),
      '@app': resolve(import.meta.dirname, '../src'),
    },
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
  },
});