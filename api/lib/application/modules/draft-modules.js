import Joi from 'joi';

import { createDraftModule, updateDraftModule, getDraftModuleById, getDraftModuleDiff, listPaginatedDraftModules, publishDraftModule, validateDraftModule } from '../../domain/usecases/index.js';
import { draftModuleDiffSerializer, draftModuleSerializer, moduleSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import * as Types from '../types.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/draft-modules',
      config: {
        validate: {
          query: Joi.object({
            'page[size]': Joi.number().min(1).max(100).optional(),
            'page[number]': Joi.number().min(1).optional(),
            sort: Joi.string().optional(),
          }),
        },
        handler: async (request) => {
          const { page, sort } = extractParameters(request.query, { page: { size: 10, number: 1 }, sort: [['visibility', 'desc'], ['internalTitle', 'asc']] });
          const { draftModules, meta } = await listPaginatedDraftModules({ page, sort });
          return draftModuleSerializer.serialize(draftModules, {
            attributes: [
              'internalTitle',
              'details',
              'hasBeenValidated',
              'module',
              'previewUrl',
            ], meta,
          });
        },
      },
    },
    {
      method: 'GET',
      path: '/api/draft-modules/{id}',
      config: {
        validate: { params: Joi.object({ id: Types.moduleId().required() }) },
        handler: async (request) => {
          const { id } = request.params;
          const draftModule = await getDraftModuleById(id);
          return draftModuleSerializer.serialize(draftModule);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/draft-modules/{id}/diff',
      config: {
        validate: { params: Joi.object({ id: Types.moduleId().required() }) },
        handler: async (request) => {
          const { id: draftModuleId } = request.params;
          const draftModuleDiff = await getDraftModuleDiff({ draftModuleId });
          return draftModuleDiffSerializer.serialize(draftModuleDiff);
        },
      },
    },
    {
      method: 'POST',
      path: '/api/draft-modules',
      config: {
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('draft-modules').required(),
              attributes: Joi.object({
                'internal-title': Joi.string().required(),
                title: Joi.string().required(),
                'is-beta': Joi.boolean().required(),
                slug: Joi.string().required(),
                visibility: Joi.string().required(),
                details: Joi.object().required(),
                sections: Joi.array().required(),
                glossary: Joi.array().required(),
              }).required(),
              relationships: Joi.object({
                module: Joi.object({
                  data: Joi.object({
                    id: Types.moduleId().required(),
                    type: Joi.string().valid('modules').required(),
                  }).empty(null).optional(),
                }).optional(),
              }).optional(),
            }).required(),
          }).required(),
        },
        handler: async (request, h) => {
          const module = await draftModuleSerializer.deserialize(request.payload);
          const savedModule = await createDraftModule(module);
          const validatedModule = await validateDraftModule(savedModule);
          return h.response(draftModuleSerializer.serialize(validatedModule)).code(201);
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/draft-modules/{id}',
      config: {
        handler: async (request, h) => {
          const draftModule = await draftModuleSerializer.deserialize(request.payload);
          const updatedModule = await updateDraftModule(draftModule);
          const validatedModule = await validateDraftModule(updatedModule);
          return h.response(draftModuleSerializer.serialize(validatedModule)).code(200);
        },
        validate: {
          params: Joi.object({ id: Types.moduleId().required() }).required(),
          payload: Joi.object({
            data: Joi.object({
              id: Types.moduleId().required(),
              type: Joi.string().valid('draft-modules').required(),
              attributes: Joi.object({
                'internal-title': Joi.string().required(),
                title: Joi.string().required(),
                'is-beta': Joi.boolean().required(),
                slug: Joi.string().required(),
                visibility: Joi.string().required(),
                details: Joi.object().required(),
                sections: Joi.array().required(),
                glossary: Joi.array().required(),
              }).required(),
              relationships: Joi.object({
                module: Joi.object({
                  data: Joi.object({
                    id: Types.moduleId().required(),
                    type: Joi.string().valid('modules').required(),
                  }).empty(null).optional(),
                }).optional(),
              }).optional(),
            }).required(),
          }).required(),
        },
      },
    },
    {
      method: 'POST',
      path: '/api/draft-modules/{id}/publish',
      config: {
        validate: { params: Joi.object({ id: Types.moduleId().required() }).required() },
        handler: async (request, h) => {
          const { id } = request.params;
          const publishedModule = await publishDraftModule({ draftModuleId: id });
          return h.response(moduleSerializer.serialize(publishedModule)).code(200);
        },
      },
    },
  ]);
}

export const name = 'draft-modules';
