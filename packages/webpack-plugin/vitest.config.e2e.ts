import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const timeout = process.env.CI ? 50000 : 30000;

export default defineConfig({
  resolve: {
    alias: {
      '~utils': resolve(__dirname, './examples/test-utils'),
    },
  },
  test: {
    include: ['./playground/**/*.test.[tj]s'],
    setupFiles: ['./playground/vitestSetup.ts'],
    globalSetup: ['./playground/vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    globals: true,
    reporters: 'dot',
  },
  esbuild: {
    target: 'node14',
  },
});
