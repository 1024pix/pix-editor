import { PassThrough } from 'node:stream';
import { exportTranslations } from '../domain/usecases/export-translations.js';
import { importTranslations, InvalidFileError } from '../domain/usecases/import-translations.js';
import { Dispenser } from '@hapi/pez';
import Content from '@hapi/content';
import Boom from '@hapi/boom';

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
          multipart: false,
          output: 'stream',
          parse: false,
        },
        handler: async function(request, h) {
          const contentType = Content.type(request.headers['content-type']);
          try {
            await new Promise((resolve, reject) => {
              const stream = request.payload.pipe(new Dispenser({ boundary: contentType.boundary }));
              stream.on('part', async (partStream) => {
                try {
                  await importTranslations(partStream);
                } catch (error) {
                  reject(error);
                }
              });
              stream.on('error', reject);
              stream.on('end', resolve);
            });
          } catch (error) {
            if (error instanceof InvalidFileError) {
              return Boom.badRequest('Invalid CSV file');
            }
          }

          return h.response();
        }
      },
    },
  ]);
}

export const name = 'translations-api';

