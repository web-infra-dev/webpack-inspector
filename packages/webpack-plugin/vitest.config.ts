import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.test.[tj]s'],
    exclude: ['./playground/**/*.test.[tj]s'],
  },
  resolve: {
    alias: {
      '@/': path.join(__dirname, './src/'),
    },
  },
});
