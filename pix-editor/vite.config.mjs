import { loadTranslations } from '@ember-intl/vite';
import { classicEmberSupport, ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import sassEmbedded, { NodePackageImporter } from 'sass-embedded';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    loadTranslations(),
  ],
  server: {
    port: 4300,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        xfwd: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        implementation: sassEmbedded,
        loadPaths: ['node_modules/@1024pix/nebulix-ember/dist/styles'],
        importers: [new NodePackageImporter()],
      },
    },
  },
});
