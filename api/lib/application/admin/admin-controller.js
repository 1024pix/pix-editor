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
  if (!schema) return Boom.notFound(`Entity with name '${entityName}' not found in admin schemas list`);
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
    return h.response().code(500);
  }
}

export async function getEntities(request) {
  const { entityName } = request.params;
  const entitySchema = adminSchemaRepository.getByEntityName(entityName);
  if (!entitySchema) {
    return Boom.notFound(`Entity with name '${entityName}' not found in admin schemas list`);
  }

  const defaultSort = [entitySchema.defaultSort.field, entitySchema.defaultSort.direction];
  const { page, sort: [[sortField, sortDirection]] } = extractParameters(request.query, { page: { size: 10, number: 1 }, sort: [defaultSort] });

  const sortableFields = entitySchema.fields.filter((field) => field.sortable !== false).map((field) => field.key);
  if (!sortableFields.includes(sortField)) {
    return Boom.badRequest(`Column ${sortField} is not sortable for entity ${entityName}`);
  }

  const sort = {
    field: sortField,
    direction: sortDirection,
  };
  const fields = entitySchema.fields.map((field) => field.key);
  const { entities, meta } = await adminEntityRepository.listByEntityName(entityName, fields, page, sort);

  return adminEntitySerializer.serialize(entityName, entities, meta);
}

export async function destroy(request, h) {
  const { entityName, entityId } = request.params;

  try {
    const schema = adminSchemaRepository.getByEntityName(entityName);

    if (!schema) return Boom.notFound(`Entity with name '${entityName}' not found in admin schemas list`);
    if (!schema.deletable) return Boom.forbidden(`Schema '${entityName}' is not deletable`);

    const elementToDelete = await adminEntityRepository.get(schema.entityName, schema.primaryKey, entityId);
    if (!elementToDelete) return Boom.notFound();

    await adminEntityRepository.destroy(schema.entityName, schema.primaryKey, entityId);

    return h.response().code(204);
  } catch (err) {
    logger.error({ err, data: { entityName, entityId } });
    return h.response().code(500);
  }
}
