import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { NodePackageImporter } from 'sass-embedded';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
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
        importers: [
          new NodePackageImporter(),
          {
            findFileUrl(url) {
              if (url.startsWith('pix-design-token')) {
                return new URL(`file://${process.cwd()}/node_modules/@1024pix/pix-ui/addon/styles/${url}`);
              }
              if (url.endsWith('easymde.min.css')) {
                return new URL(`file://${process.cwd()}/node_modules/easymde/dist/easymde.min.css`);
              }
              return null;
            },
          },
        ],
      },
    },
  },
});
