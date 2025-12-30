import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | admin', () => {
  describe('GET api/admin/schemas', () => {
    let user;

    describe('when user is an admin', () => {
      beforeEach(async function() {
        user = databaseBuilder.factory.buildAdminUser();
        await databaseBuilder.commit();
      });

      it('should return the list of entity schemas', async () => {
        // given
        const server = await createServer();
        const getConfigOptions = {
          method: 'GET',
          url: '/api/admin/schemas',
          headers: generateAuthorizationHeader(user),
        };

        // when
        const response = await server.inject(getConfigOptions);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              id: 'user-schema',
              type: 'admin-schemas',
              attributes: {
                label: 'Utilisateurs',
                'entity-name': 'users',
                editable: true,
                deletable: true,
                creatable: true,
                fields: [
                  {
                    key: 'id',
                    label: 'Identifiant',
                    type: 'number',
                  },
                  {
                    key: 'name',
                    label: 'Nom',
                    type: 'string',
                  },
                  {
                    key: 'trigram',
                    label: 'Trigramme',
                    type: 'string',
                  },
                  {
                    key: 'apiKey',
                    label: 'Clé API',
                    type: 'secret',
                  },
                  {
                    key: 'access',
                    label: 'Niveau d\'accès',
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
                        label: 'Lecture Pix',
                      },
                      {
                        value: 'replicator',
                        label: 'Déclinateur',
                      },
                    ],
                  },
                ],
              },
            },
          ],
        });
      });
    });

    describe('when user is not an admin', () => {
      beforeEach(async function() {
        user = databaseBuilder.factory.buildEditorUser();
        await databaseBuilder.commit();
      });

      it('should return a 403', async () => {
        // given
        const server = await createServer();
        const getConfigOptions = {
          method: 'GET',
          url: '/api/admin/schemas',
          headers: generateAuthorizationHeader(user),
        };

        // when
        const response = await server.inject(getConfigOptions);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
