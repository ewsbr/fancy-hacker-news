import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig(configEnv => mergeConfig(
  typeof viteConfig === 'function' ? viteConfig(configEnv) : viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      environmentOptions: {
        jsdom: {
          url: 'https://news.ycombinator.com/',
        },
      },
      include: ['test/**/*.test.ts'],
    },
  }),
));
