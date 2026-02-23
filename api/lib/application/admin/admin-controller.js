import Boom from '@hapi/boom';
import { adminEntitySerializer, adminSchemaSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { adminEntityRepository, adminSchemaRepository } from '../../infrastructure/repositories/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { logger } from '../../infrastructure/logger.js';

export function getSchemas() {
  const adminSchemas = adminSchemaRepository.list();

  return adminSchemaSerializer.serialize(adminSchemas);
}

export async function save(request, h) {
  const entityToDeserialize = request.payload;
  const { entityName } = request.params;
  const entityPayload = await adminEntitySerializer.deserialize(entityToDeserialize);

  const schema = adminSchemaRepository.getByEntityName(entityName);
  if (!schema.creatable) return Boom.forbidden(`Schema "${entityName}" is not creatable`);

  const entityToSave = {};
  const fillableFields = schema.fields.filter(({ readonly }) => !readonly);
  for (const field of fillableFields) {
    const value = entityPayload[field.key];

    const isEmpty = value === undefined || value === null || value.toString().trim() === '';
    if (isEmpty) {
      return Boom.badRequest(`Missing value for "${field.key}" in payload`);
    }

    if (field.pattern && !new RegExp(field.pattern).test(value)) {
      return Boom.badRequest(`Invalid value "${value}" for property "${field.key}"`);
    }

    entityToSave[field.key] = value;
  }

  try {
    const newEntity = await adminEntityRepository.save(entityName, entityToSave);

    return h.response(adminEntitySerializer.serialize(entityName, newEntity)).created();
  } catch (err) {
    logger.error({ err, data: { entityName, entityToSave, entityPayload } });
    return Boom.badRequest('Entity was unable to be saved');
  }
}

export async function getEntities(request) {
  const { entityName } = request.params;
  const query = extractParameters(request.query, { page: { size: 10, number: 1 } });

  const entitySchema = adminSchemaRepository.getByEntityName(entityName);
  if (!entitySchema) {
    return Boom.notFound(`Entity with name '${entityName}' not found in admin schemas list`);
  }
  const fields = entitySchema.fields.map((field) => field.key);

  const { entities, meta } = await adminEntityRepository.listByEntityName(entityName, fields, query.page, entitySchema.defaultSort);

  return adminEntitySerializer.serialize(entityName, entities, meta);
}
