import path, { join, resolve } from 'path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Unocss from 'unocss/vite';

export default defineConfig({
  resolve: {
    alias: {
      '~/': join(__dirname, 'src'),
    },
  },

  plugins: [
    Vue(),
    Pages({
      pagesDir: 'src/pages',
    }),
    Components({
      dirs: ['src/components'],
      dts: join(__dirname, 'src', 'components.d.ts'),
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
    }),
    Icons(),
    Unocss(),
    AutoImport({
      dts: join(__dirname, 'src', 'auto-imports.d.ts'),
      imports: ['vue', 'vue-router', '@vueuse/core'],
    }),
  ],
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../webpack-plugin/client'),
    minify: true,
    emptyOutDir: true,
  },
});
