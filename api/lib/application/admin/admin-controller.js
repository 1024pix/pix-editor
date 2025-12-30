import { adminSchemaSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { adminSchemaRepository } from '../../infrastructure/repositories/index.js';

export function getSchemas() {
  const adminSchemas = adminSchemaRepository.list();

  return adminSchemaSerializer.serialize(adminSchemas);
}
