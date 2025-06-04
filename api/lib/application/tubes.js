import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../infrastructure/logger.js';
import * as Types from './types.js';
import { tubeRepository } from '../infrastructure/repositories/index.js';
import { tubeSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { listTubes } from '../domain/usecases/index.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/tubes/{tubeAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            tubeAirtableId: Types.tubeId().required(),
          }),
        },
        handler: async function(request) {
          try {
            const tube = await tubeRepository.getByAirtableId(request.params.tubeAirtableId);
            if (!tube) return Boom.notFound('unknown tube id');
            return tubeSerializer.serialize(tube);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
    {
      method: 'GET',
      path: '/api/tubes',
      config: {
        validate: {
          query: Joi.object({
            'filter[ids][]': [Types.tubeId(), Joi.array().items(Types.tubeId())],
          }),
        },
        handler: async function(request) {
          try {
            const params = extractParameters(request.query);
            const tubes = await listTubes(params);
            return tubeSerializer.serialize(tubes);
          } catch (err) {
            if (err instanceof DomainError) throw err;
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
  ]);
}

export const name = 'tubes';
