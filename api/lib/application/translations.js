import { PassThrough } from 'node:stream';
import fs from 'node:fs';
import Boom from '@hapi/boom';
import Joi from 'joi';

import { exportTranslations, importTranslations } from '../domain/usecases/index.js';
import { logger } from '../infrastructure/logger.js';
import { releaseRepository, localizedChallengeRepository, frameworkRepository } from '../infrastructure/repositories/index.js';
import * as config from '../config.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import { parseTranslationsCsvStream, InvalidFileError } from '../domain/services/parse-translations-csv-stream.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/translations.csv',
      config: {
        validate: { query: Joi.object({ frameworkName: Joi.string().required() }).required() },
        handler: async function(request, h) {
          const stream = new PassThrough();
          const baseUrl = config.lcms.baseUrl;
          const release = await releaseRepository.getLatestRelease();
          const frameworks = await frameworkRepository.list();

          const framework = frameworks.find((framework) => framework.name === request.query.frameworkName);
          if (!framework) {
            return Boom.badRequest('Unknown framework name');
          }

          await exportTranslations(
            stream,
            { frameworkId: framework.id, locale: 'fr' },
            {
              localizedChallengeRepository,
              release,
              baseUrl,
            },
          );

          return h.response(stream).header('Content-type', 'text/csv');
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/translations.csv',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        payload: {
          multipart: true,
          output: 'file',
          maxBytes: config.importTranslationsFileMaxSize,
        },
        handler: importTranslationsHandler,
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
    const translations = await parseTranslationsCsvStream(stream);
    await importTranslations(translations);
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
