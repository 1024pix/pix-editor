import { adminSchemaSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { adminEntitySerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { adminEntityRepository } from '../../infrastructure/repositories/index.js';

export function getSchemas() {
  const adminSchema = [
    {
      id: 'users',
      label: 'Utilisateurs',
      editable: true,
      deletable: true,
      creatable: true,
      fields: [
        {
          key: 'id',
          name: 'Identifiant',
          type: 'number',
        },
        {
          key: 'name',
          name: 'Nom',
          type: 'string',
        },
        {
          key: 'trigram',
          name: 'Trigramme',
          type: 'string',
        },
        {
          key: 'apiKey',
          name: 'Clé API',
          type: 'string',
        },
        {
          key: 'access',
          name: 'Niveau d\'accès',
          type: 'enum',
          options: [
            {
              value: 'admin',
              label: 'Administrateur',
            },
            {
              value: 'editor',
              label: 'Éditeur',
            },
            {
              value: 'readonly',
              label: 'Lecture seule',
            },
            {
              value: 'readpixonly',
              label: 'Lecture Pix'
            },
            {
              value: 'replicator',
              label: 'Déclinateur',
            },
          ],
        }
      ],
    },
  ];

  return adminSchemaSerializer.serialize(adminSchema);
}

export async function getEntities(req) {
  const type = req.query['filter[id]'];
  const entities = await adminEntityRepository.getByType(type);

  return adminEntitySerializer.serialize(entities);
}
