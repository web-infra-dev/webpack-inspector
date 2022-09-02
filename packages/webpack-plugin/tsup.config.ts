import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    loader: './src/loader.ts',
  },
  clean: true,
  splitting: true,
});
