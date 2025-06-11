import Joi from 'joi';
import * as securityPreHandlers from './security-pre-handlers.js';
import * as tagSerializer from '../infrastructure/serializers/jsonapi/tag-serializer.js';
import { tagRepository } from '../infrastructure/repositories/index.js';
import { createTag, searchTags } from '../domain/usecases/index.js';
import * as Types from './types.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';
import { NotFoundError } from '../domain/errors.js';

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
                'title': Joi.string().required(),
                'notes': Joi.string().allow(null),
              },
            },
          }),
        },
        handler: async function(request, h) {
          const tag = await tagSerializer.deserialize(request.payload);
          const createdTag = await createTag(tag, { tagRepository });
          return h.response(tagSerializer.serialize(createdTag)).code(201);
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
          const tag = await tagRepository.getByAirtableId(request.params.tagAirtableId);
          if (!tag) return new NotFoundError('unknown tag id');
          return tagSerializer.serialize(tag);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/tags',
      config: {
        validate: {
          query: Joi.object({
            'filter[title]': Joi.string(),
            'filter[ids][]': [Joi.string(), Joi.array().items(Joi.string())],
          })
            .xor('filter[title]', 'filter[ids][]')
        },
        handler: async function(request) {
          const params = extractParameters(request.query);
          const tags = await searchTags(params, { tagRepository });
          return tagSerializer.serialize(tags);
        },
      },
    },
  ]);
}

export const name = 'tags';
