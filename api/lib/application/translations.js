import { PassThrough } from 'node:stream';
import { exportTranslations } from '../domain/usecases/export-translations.js';
import { importTranslations, InvalidFileError } from '../domain/usecases/import-translations.js';
import Boom from '@hapi/boom';
import fs from "node:fs";

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
          if (Array.isArray(request.payload.file)) {
            return Boom.badRequest('Too many files');
          }
          try {
            const stream = fs.createReadStream(request.payload.file.path);
            await importTranslations(stream);
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

