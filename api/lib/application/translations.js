import { PassThrough } from 'node:stream';
import fs from 'node:fs';
import { exportTranslations } from '../domain/usecases/export-translations.js';
import { importTranslations } from '../domain/usecases/import-translations.js';

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
    {
      method: 'PATCH',
      path: '/api/translations.csv',
      config: {
        payload: {
          multipart: true,
          output: 'file',
        },
        handler: async function(request, h) {
          const file = fs.readFileSync(request.payload.file.path, { encoding: 'utf8' });
          await importTranslations(file);
          return h.response();
        }
      },
    },
  ]);
}

export const name = 'translations-api';

