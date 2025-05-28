import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../infrastructure/logger.js';
import * as Types from './types.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import { thematicRepository } from '../infrastructure/repositories/index.js';
import { thematicSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';
import { createThematic, listThematics } from '../domain/usecases/index.js';
import { DomainError } from '../domain/errors.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/thematics/{thematicAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            thematicAirtableId: Types.thematicId().required(),
          }),
        },
        handler: async function(request) {
          try {
            const thematic = await thematicRepository.getByAirtableId(request.params.thematicAirtableId);
            if (!thematic) return Boom.notFound('unknown thematic id');
            return thematicSerializer.serialize(thematic);
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
      path: '/api/thematics',
      config: {
        validate: {
          query: Joi.object({
            'filter[ids][]': Joi.array().items(Types.thematicId()),
          }),
        },
        handler: async function(request) {
          try {
            const params = extractParameters(request.query);
            const thematics = await listThematics(params);
            return thematicSerializer.serialize(thematics);
          } catch (err) {
            if (err instanceof DomainError) throw err;
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
    {
      method: 'POST',
      path: '/api/thematics',
      config: {
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().required().equal('themes'),
              attributes: Joi.object({
                'name': Joi.string().allow(null),
                'name-en-us': Joi.string().allow(null),
                'index': Joi.number().allow(null),
              }).unknown(true),
              relationships: Joi.object({
                'competence': Types.competenceRelationship(),
                'raw-tubes': Types.tubesRelationship(),
              }),
            }),
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          try {
            const thematic = await thematicSerializer.deserialize(request.payload);
            const createdThematic = await createThematic(thematic);
            return h.response(thematicSerializer.serialize(createdThematic)).code(201);
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

export const name = 'thematics';
