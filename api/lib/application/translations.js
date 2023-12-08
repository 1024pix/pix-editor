import { PassThrough } from 'node:stream';
import fs from 'node:fs';
import Boom from '@hapi/boom';
import { exportTranslations } from '../domain/usecases/export-translations.js';
import { importTranslations, InvalidFileError } from '../domain/usecases/import-translations.js';
import { logger } from '../infrastructure/logger.js';
import { releaseRepository, localizedChallengeRepository } from '../infrastructure/repositories/index.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/translations.csv',
      config: {
        handler: function(request, h) {
          const stream = new PassThrough();
          const url = new URL(request.url);
          const baseUrl = `${url.protocol}//${url.host}`;
          exportTranslations(stream, { releaseRepository, localizedChallengeRepository, baseUrl });
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
        handler: importTranslationsHandler
      },
    },
  ]);
}

export async function importTranslationsHandler(request, h) {
  if (Array.isArray(request.payload.file)) {
    return Boom.badRequest('Too many files');
  }
  if (!request.payload.file) {
    return Boom.badRequest('No file provided');
  }
  try {
    const stream = fs.createReadStream(request.payload.file.path);
    await importTranslations(stream);
  } catch (error) {
    if (error instanceof InvalidFileError) {
      logger.error(error);
      return Boom.badRequest('Invalid CSV file');
    }
    throw error;
  }
  return h.response();
}

export const name = 'translations-api';

