import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Types from './types.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import { tubeRepository } from '../infrastructure/repositories/index.js';
import { tubeSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { createTube, listTubes, updateTube } from '../domain/usecases/index.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/tubes/{tubeAirtableId}',
      config: {
        validate: { params: Joi.object({ tubeAirtableId: Types.tubeId().required() }) },
        handler: async function(request) {
          const tube = await tubeRepository.getByAirtableId(request.params.tubeAirtableId);
          if (!tube) return Boom.notFound('unknown tube id');
          return tubeSerializer.serialize(tube);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/tubes',
      config: {
        validate: { query: Joi.object({ 'filter[ids][]': [Types.tubeId(), Joi.array().items(Types.tubeId())] }) },
        handler: async function(request) {
          const params = extractParameters(request.query);
          const tubes = await listTubes(params);
          return tubeSerializer.serialize(tubes);
        },
      },
    },
    {
      method: 'POST',
      path: '/api/tubes',
      config: {
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().required().equal('tubes'),
              attributes: Joi.object({
                name: Joi.string().required().pattern(/^@.+$/),
                'practical-title-fr': Joi.string().allow(null),
                'practical-title-en': Joi.string().allow(null),
                'practical-description-fr': Joi.string().allow(null),
                'practical-description-en': Joi.string().allow(null),
              }).unknown(true),
              relationships: Joi.object({
                competence: Types.competenceRelationship({ allow: [null] }),
                theme: Types.thematicRelationship(),
                'raw-skills': Types.skillsRelationship(),
              }),
            }),
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const tube = await tubeSerializer.deserialize(request.payload);
          const createdTube = await createTube(tube);
          return h.response(tubeSerializer.serialize(createdTube)).code(201);
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/tubes/{tubeAirtableId}',
      config: {
        validate: {
          params: Joi.object({ tubeAirtableId: Types.tubeId() }),
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().required().equal('tubes'),
              id: Types.tubeId().required(),
              attributes: Joi.object({
                name: Joi.string().required().pattern(/^@.+$/),
                index: Joi.number(),
                'practical-title-fr': Joi.string().allow(null),
                'practical-title-en': Joi.string().allow(null),
                'practical-description-fr': Joi.string().allow(null),
                'practical-description-en': Joi.string().allow(null),
              }).unknown(true),
              relationships: Joi.object({
                competence: Types.competenceRelationship(),
                theme: Types.thematicRelationship(),
                'raw-skills': Types.skillsRelationship(),
              }),
            }),
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request) {
          const tube = await tubeSerializer.deserialize(request.payload);
          const updatedTube = await updateTube(request.params.tubeAirtableId, tube);
          return tubeSerializer.serialize(updatedTube);
        },
      },
    },
  ]);
}

export const name = 'tubes';
