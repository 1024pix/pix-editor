import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { NodePackageImporter } from 'sass-embedded';
import url from 'postcss-url';

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
              return null;
            },
          },
        ],
      },
    },
    postcss: {
      plugins: [
        url({
          url: (asset) => {
            if (asset.url.startsWith('../@1024pix/')) {
              // Pix UI static files are referenced by url starting with "../"
              // but vite is bunlding those files in root asset folder
              // so we need to remove the "../" prefix
              // ../@1024pix/pix-ui/fonts/Nunito/Nunito-Bold.woff2
              return asset.url.replace('..', '');
            }
            return undefined;
          },
        }),
      ],
    },
  },
});
