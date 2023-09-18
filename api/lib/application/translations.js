import { PassThrough } from 'node:stream';
import { exportTranslations } from '../domain/usecases/export-translations.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/translations.csv',
      config: {
        handler: function(_, h) {
          const stream = new PassThrough();
          exportTranslations(stream);
          return h.response(stream).header('Content-type', 'text/csv');
        }
      },
    },
  ]);
}

export const name = 'translations-api';

