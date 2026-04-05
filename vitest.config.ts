import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv) => mergeConfig(
  typeof viteConfig === 'function' ? viteConfig(configEnv) : viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['test/**/*.test.ts'],
    },
  }),
));
