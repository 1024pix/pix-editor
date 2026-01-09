import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
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
        const request = {
          method: 'GET',
          url: '/api/admin/schemas',
          headers: generateAuthorizationHeader(user),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.map(({ id }) => id)).to.deep.equal([
          'localized-challenge-schema',
          'release-schema',
          'translation-schema',
          'user-schema',
        ]);
        expect(response.result.data.find((schema) => schema.id === 'user-schema')).to.deep.equal({
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
        const request = {
          method: 'GET',
          url: '/api/admin/schemas',
          headers: generateAuthorizationHeader(user),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET api/admin/entities/{entityName}', () => {
    let user;

    describe('when user is an admin', () => {
      beforeEach(async function() {
        user = databaseBuilder.factory.buildAdminUser();
        await databaseBuilder.commit();
      });

      it('should return the list of entities with the given name', async () => {
        // given
        const server = await createServer();
        const request = {
          method: 'GET',
          url: '/api/admin/entities/users',
          headers: generateAuthorizationHeader(user),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).toStrictEqual({
          meta: { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 },
          data: [
            {
              id: expect.stringContaining('users:1'),
              type: 'admin-entities',
              attributes: {
                properties: {
                  id: expect.any(Number),
                  name: 'User',
                  trigram: 'ADM',
                  access: 'admin',
                  apiKey: expect.any(String),
                },
              },
            },
          ],
        });
      });

      describe('when given entityName is not in the admin schemas list', () => {
        it('should return a 404', async () => {
          // given
          const server = await createServer();
          const request = {
            method: 'GET',
            url: '/api/admin/entities/potatoes',
            headers: generateAuthorizationHeader(user),
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.message).to.equal("Entity with name 'potatoes' not found in admin schemas list");
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
        const request = {
          method: 'GET',
          url: '/api/admin/entities/users',
          headers: generateAuthorizationHeader(user),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('POST api/admin/entities/{entityName}', () => {
    let user;

    describe('when user is an admin', () => {
      beforeEach(async function() {
        user = databaseBuilder.factory.buildAdminUser();
        await databaseBuilder.commit();
      });

      it('should create a new entity', async () => {
        // given
        const uuid = crypto.randomUUID();
        const server = await createServer();
        const request = {
          method: 'POST',
          url: '/api/admin/entities/users',
          headers: generateAuthorizationHeader(user),
          payload: {
            data: {
              type: 'admin-entities',
              attributes: {
                properties: {
                  name: 'Fael',
                  trigram: 'FBA',
                  apiKey: uuid,
                  access: 'readonly',
                },
              },
            },
          },
        };

        // when
        const response = await server.inject(request);
        const users = await knex.select('*').from('users');

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result).toStrictEqual({
          data: {
            id: expect.stringMatching(/^users:\d+$/),
            type: 'admin-entities',
            attributes: {
              properties: {
                id: expect.any(Number),
                name: 'Fael',
                trigram: 'FBA',
                access: 'readonly',
                apiKey: uuid,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
              },
            },
          },
        });
        expect(users.at(-1)).toStrictEqual({
          id: expect.any(Number),
          name: 'Fael',
          trigram: 'FBA',
          apiKey: uuid,
          access: 'readonly',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      describe('when payload is invalid', () => {
        it('should return a 403 error', async () => {
          // given
          const uuid = crypto.randomUUID();
          const server = await createServer();
          const request = {
            method: 'POST',
            url: '/api/admin/entities/users',
            headers: generateAuthorizationHeader(user),
            payload: {
              data: {
                type: 'admin-entities',
                attributes: {
                  properties: {
                    name: 'Fael',
                    pouet: 'POUET',
                    apiKey: uuid,
                    access: 'admin',
                  },
                },
              },
            },
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(403);
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
        const request = {
          method: 'POST',
          url: '/api/admin/entities/users',
          headers: generateAuthorizationHeader(user),
          payload: {
            data: {
              type: 'admin-entities',
              attributes: {
                properties: {
                  name: 'Iris',
                  trigram: 'IBM',
                  apiKey: crypto.randomUUID(),
                  access: 'readonly',
                },
              },
            },
          },
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
