import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import * as securityPreHandlers from './security-pre-handlers.js';
import { logger } from '../infrastructure/logger.js';
import { DomainError } from '../domain/errors.js';
import { ConflictError } from '../infrastructure/errors.js';
import * as tagSerializer from '../infrastructure/serializers/jsonapi/tag-serializer.js';
import { tagRepository } from '../infrastructure/repositories/index.js';
import { createTag } from '../domain/usecases/index.js';
import * as Types from './types.js';

export function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/tags',
      config: {
        pre: [{
          method: (request, h) => {
            return securityPreHandlers.checkUserHasWriteAccess(request, h);
          }
        }],
        validate: {
          payload: Joi.object({
            data: {
              type: Joi.string().required().equal('tags'),
              attributes: {
                'name': Joi.string().required(),
              },
            },
          }),
        },
        handler: async function(request, h) {
          try {
            const tag = await tagSerializer.deserialize(request.payload);
            const createdTag = await createTag(tag, { tagRepository, ConflictError });
            return h.response(tagSerializer.serialize(createdTag)).code(201);
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
      method: 'GET',
      path: '/api/tags/{tagAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            tagAirtableId: Types.tagId().required(),
          }),
        },
        handler: async function(request) {
          try {
            const tag = await tagRepository.getByAirtableId(request.params.tagAirtableId);
            if (!tag) return Boom.notFound('unknown tag id');
            return tagSerializer.serialize(tag);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
  ]);
}

export const name = 'tags';
