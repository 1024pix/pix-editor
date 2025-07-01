import { adminSchemaSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export function getSchemas() {
  const adminSchema =   [
    {
      id: 'user-schema-id',
      label: 'Utilisateurs',
      entityName: 'user',
      editable: true,
      deletable: true,
      creatable: true,
    },
  ];

  return adminSchemaSerializer.serialize(adminSchema);
}
