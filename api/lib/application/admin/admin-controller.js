import Boom from '@hapi/boom';
import { adminEntitySerializer, adminSchemaSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { adminEntityRepository, adminSchemaRepository } from '../../infrastructure/repositories/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';

export function getSchemas() {
  const adminSchemas = adminSchemaRepository.list();

  return adminSchemaSerializer.serialize(adminSchemas);
}

export async function getEntities(request) {
  const { entityName } = request.params;
  const query = extractParameters(request.query, { page: { size: 10, number: 1 } });

  const entitySchema = adminSchemaRepository.list().find((schema) => schema.entityName === entityName);
  if (!entitySchema) {
    return Boom.notFound(`Entity with name '${entityName}' not found in admin schemas list`);
  }
  const fields = entitySchema.fields.map((field) => field.key);

  const { entities, meta } = await adminEntityRepository.getByEntityName(entityName, fields, query.page);

  return adminEntitySerializer.serialize(entities, meta);
}
