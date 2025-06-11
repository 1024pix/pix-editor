import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Types from './types.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import { thematicRepository } from '../infrastructure/repositories/index.js';
import { thematicSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';
import { createThematic, listThematics, updateThematic } from '../domain/usecases/index.js';

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
          const thematic = await thematicRepository.getByAirtableId(request.params.thematicAirtableId);
          if (!thematic) return Boom.notFound('unknown thematic id');
          return thematicSerializer.serialize(thematic);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/thematics',
      config: {
        validate: {
          query: Joi.object({
            'filter[ids][]': [Types.thematicId(), Joi.array().items(Types.thematicId())],
          }),
        },
        handler: async function(request) {
          const params = extractParameters(request.query);
          const thematics = await listThematics(params);
          return thematicSerializer.serialize(thematics);
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
          const thematic = await thematicSerializer.deserialize(request.payload);
          const createdThematic = await createThematic(thematic);
          return h.response(thematicSerializer.serialize(createdThematic)).code(201);
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/thematics/{thematicAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            thematicAirtableId: Types.thematicId(),
          }),
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().required().equal('themes'),
              id: Types.thematicId().required(),
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
        handler: async function(request) {
          const { thematicAirtableId } = request.params;
          const thematicUpdates = await thematicSerializer.deserialize(request.payload);
          const updatedThematic = await updateThematic(thematicAirtableId, thematicUpdates);
          return thematicSerializer.serialize(updatedThematic);
        },
      },
    },
  ]);
}

export const name = 'thematics';
