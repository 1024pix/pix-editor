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
        expect(response.result.data.map(({ id }) => id)).toStrictEqual([
          'localized-challenge-schema',
          'release-schema',
          'translation-schema',
          'translations-config-schema',
          'user-schema',
        ]);
        expect(response.result.data.find((schema) => schema.id === 'user-schema')).toStrictEqual({
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
                readonly: true,
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
                pattern: expect.any(String),
              },
              {
                key: 'apiKey',
                label: 'Clé API',
                type: 'secret',
                pattern: expect.any(String),
                sortable: false,
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

      describe('when sort query params are passed', () => {
        beforeEach(async function() {
          databaseBuilder.factory.buildRelease({
            id: 1,
            content: { name: 'release1' },
            createdAt: new Date('2026-01-01'),
          });
          databaseBuilder.factory.buildRelease({
            id: 2,
            content: { name: 'release2' },
            createdAt: new Date('2025-01-01'),
          });
          databaseBuilder.factory.buildRelease({
            id: 3,
            content: { name: 'release3' },
            createdAt: new Date('2024-01-01'),
          });
          await databaseBuilder.commit();
        });

        it('should return the list of entities sorted asc', async () => {
          // given
          const server = await createServer();
          const request = {
            method: 'GET',
            url: '/api/admin/entities/releases?sort=createdAt',
            headers: generateAuthorizationHeader(user),
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).toStrictEqual({
            meta: { page: 1, pageSize: 10, rowCount: 3, pageCount: 1 },
            data: [
              {
                id: expect.stringContaining('releases:3'),
                type: 'admin-entities',
                attributes: {
                  properties: {
                    createdAt: expect.any(Date),
                    id: 3,
                  },
                },
              },
              {
                id: expect.stringContaining('releases:2'),
                type: 'admin-entities',
                attributes: {
                  properties: {
                    createdAt: expect.any(Date),
                    id: 2,
                  },
                },
              },
              {
                id: expect.stringContaining('releases:1'),
                type: 'admin-entities',
                attributes: {
                  properties: {
                    createdAt: expect.any(Date),
                    id: 1,
                  },
                },
              },
            ],
          });
        });

        it('should return the list of entities sorted desc', async () => {
          // given
          const server = await createServer();
          const request = {
            method: 'GET',
            url: '/api/admin/entities/releases?sort=-createdAt',
            headers: generateAuthorizationHeader(user),
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).toStrictEqual({
            meta: { page: 1, pageSize: 10, rowCount: 3, pageCount: 1 },
            data: [
              {
                id: expect.stringContaining('releases:1'),
                type: 'admin-entities',
                attributes: {
                  properties: {
                    createdAt: expect.any(Date),
                    id: 1,
                  },
                },
              },
              {
                id: expect.stringContaining('releases:2'),
                type: 'admin-entities',
                attributes: {
                  properties: {
                    createdAt: expect.any(Date),
                    id: 2,
                  },
                },
              },
              {
                id: expect.stringContaining('releases:3'),
                type: 'admin-entities',
                attributes: {
                  properties: {
                    createdAt: expect.any(Date),
                    id: 3,
                  },
                },
              },
            ],
          });
        });

        describe('when given field is not sortable', () => {
          it('should return a 400', async () => {
            // given
            const server = await createServer();
            const request = {
              method: 'GET',
              url: '/api/admin/entities/users?sort=apiKey',
              headers: generateAuthorizationHeader(user),
            };

            // when
            const response = await server.inject(request);

            // then
            expect(response.statusCode).to.equal(400);
            expect(response.result.message).to.equal('Column apiKey is not sortable for entity users');
          });
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

      describe('when payload is missing properties', () => {
        it('should return a 400 error', async () => {
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
                  },
                },
              },
            },
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.message).to.equal('Missing value for "access" in payload');
        });
      });

      describe('when payload has some invalid properties', () => {
        it('should return a 400 error', async () => {
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
                    name: 'Fael',
                    trigram: 'FBA',
                    apiKey: 'NOT-A-UUID',
                  },
                },
              },
            },
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.message).to.equal('Invalid value "NOT-A-UUID" for property "apiKey"');
        });
      });

      describe('when payload has unknown properties', () => {
        it('should ignore extra properties and proceed', async () => {
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
                    pouet: 'POUET',
                    patate: 'DOUCE',
                    chocolat: 'FRAMBOISE',
                    apiKey: uuid,
                    access: 'admin',
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
          expect(users.at(-1)).toStrictEqual({
            id: expect.any(Number),
            name: 'Fael',
            trigram: 'FBA',
            apiKey: uuid,
            access: 'admin',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          });
        });
      });

      describe('when a database error occurs', () => {
        it('should return a 400 error', async () => {
          // given
          const uuid = crypto.randomUUID();
          databaseBuilder.factory.buildUser({ name: 'Dupe Licat', access: 'readonly', trigram: 'ZOW' });
          await databaseBuilder.commit();

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
                    name: 'SSL Legend',
                    trigram: 'ZOW',
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
          expect(response.statusCode).to.equal(400);
          expect(response.result.message).to.equal('Entity was unable to be saved');
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
