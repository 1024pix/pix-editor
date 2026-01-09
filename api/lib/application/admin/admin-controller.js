import Boom from '@hapi/boom';
import { adminEntitySerializer, adminSchemaSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { adminEntityRepository, adminSchemaRepository } from '../../infrastructure/repositories/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';

export function getSchemas() {
  const adminSchemas = adminSchemaRepository.list();

  return adminSchemaSerializer.serialize(adminSchemas);
}

export async function save(request, h) {
  const entityToDeserialize = request.payload;
  const { entityName } = request.params;
  const entityToSave = await adminEntitySerializer.deserialize(entityToDeserialize);

  const schema = adminSchemaRepository.getByEntityName(entityName);
  if (!schema.creatable) return Boom.forbidden();

  const allowedProperties = schema.fields.map((field) => field.key);
  for (const property of Object.keys(entityToSave)) {
    if (!allowedProperties.includes(property)) return Boom.forbidden();
  }

  const newEntity = await adminEntityRepository.save(entityName, entityToSave);

  return h.response(adminEntitySerializer.serialize({ ...newEntity, entityName })).created();
}

export async function getEntities(request) {
  const { entityName } = request.params;
  const query = extractParameters(request.query, { page: { size: 10, number: 1 } });

  const entitySchema = adminSchemaRepository.getByEntityName(entityName);
  if (!entitySchema) {
    return Boom.notFound(`Entity with name '${entityName}' not found in admin schemas list`);
  }
  const fields = entitySchema.fields.map((field) => field.key);

  const { entities, meta } = await adminEntityRepository.listByEntityName(entityName, fields, query.page);

  return adminEntitySerializer.serialize(entities, meta);
}
