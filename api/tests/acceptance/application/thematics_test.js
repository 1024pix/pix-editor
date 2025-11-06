import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';
import * as config from '../../../lib/config.js';

describe('Application | Route | Thematics', () => {
  let editorUser, readonlyUser, originalPixApiUrlValue;

  beforeEach(async function() {
    originalPixApiUrlValue = config.pixApi.baseUrl;
    delete config.pixApi.baseUrl;
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  afterEach(function() {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('GET /api/thematics/{thematicAirtableId}', () => {
    describe('when provided id has not the right format', function() {
      it('should respond with a status 400', async function() {
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/thematics/zouloulou',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when thematic does not exist', function() {
      it('should respond with a status 404', async function() {
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/thematics/thematic2',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    it('should respond with status 200 and thematic data', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 1, competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });
      databaseBuilder.factory.buildTube({ id: 'tube2', name: '@bar', thematicId: 'thematic1' });

      databaseBuilder.factory.buildTranslation({
        key: 'thematic.thematic1.name',
        locale: 'fr',
        value: 'Première thématique',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.thematic1.name',
        locale: 'en',
        value: 'First thematic',
      });

      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/thematics/thematic1',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({
        data: {
          type: 'themes',
          id: 'thematic1',
          attributes: {
            'pix-id': 'thematic1',
            name: 'Première thématique',
            'name-en-us': 'First thematic',
            index: 1,
          },
          relationships: {
            competence: {
              data: {
                id: 'competence1',
                type: 'competences',
              },
            },
            'raw-tubes': {
              data: [
                {
                  id: 'tube1',
                  type: 'tubes',
                },
                {
                  id: 'tube2',
                  type: 'tubes',
                },
              ],
            },
          },
        },
      });
    });
  });

  describe('GET /api/thematics', () => {
    describe('when using no filters', () => {
      it('should respond with status 200 and thematics data', async () => {
        // given
        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 1, competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@bar', thematicId: 'thematic1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic2', index: 2, competenceId: 'competence2' });
        databaseBuilder.factory.buildTube({ id: 'tube3', name: '@fizz', thematicId: 'thematic2' });
        databaseBuilder.factory.buildTube({ id: 'tube4', name: '@buzz', thematicId: 'thematic2' });

        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic1.name',
          locale: 'fr',
          value: 'Première thématique',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic1.name',
          locale: 'en',
          value: 'First thematic',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic2.name',
          locale: 'fr',
          value: 'Deuxième thématique',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic2.name',
          locale: 'en',
          value: 'Second thematic',
        });

        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/thematics',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'themes',
              id: 'thematic1',
              attributes: {
                'pix-id': 'thematic1',
                name: 'Première thématique',
                'name-en-us': 'First thematic',
                index: 1,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence1',
                    type: 'competences',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      id: 'tube1',
                      type: 'tubes',
                    },
                    {
                      id: 'tube2',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
            {
              type: 'themes',
              id: 'thematic2',
              attributes: {
                'pix-id': 'thematic2',
                name: 'Deuxième thématique',
                'name-en-us': 'Second thematic',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence2',
                    type: 'competences',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      id: 'tube3',
                      type: 'tubes',
                    },
                    {
                      id: 'tube4',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
          ],
        });
      });
    });

    describe('when filtering by ids', () => {
      it('should respond with status 200 and thematics data', async () => {
        // given
        databaseBuilder.factory.buildFramework({
          id: 'recFmk1',
          name: 'Fmk 1',
        });
        databaseBuilder.factory.buildArea({
          id: 'area1',
          code: '1',
          frameworkId: 'recFmk1',
        });
        databaseBuilder.factory.buildCompetence({
          id: 'competence1',
          index: '1.1',
          areaId: 'area1',
        });
        databaseBuilder.factory.buildThematic({
          id: 'thematic1',
          index: 1,
          competenceId: 'competence1',
        });
        databaseBuilder.factory.buildTube({
          id: 'tube1',
          name: '@foo',
          thematicId: 'thematic1',
        });
        databaseBuilder.factory.buildTube({
          id: 'tube2',
          name: '@bar',
          thematicId: 'thematic1',
        });
        databaseBuilder.factory.buildCompetence({
          id: 'competence2',
          index: '1.1',
          areaId: 'area1',
        });
        databaseBuilder.factory.buildThematic({
          id: 'thematic2',
          index: 2,
          competenceId: 'competence2',
        });
        databaseBuilder.factory.buildTube({
          id: 'tube3',
          name: '@fizz',
          thematicId: 'thematic2',
        });
        databaseBuilder.factory.buildTube({
          id: 'tube4',
          name: '@buzz',
          thematicId: 'thematic2',
        });

        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic1.name',
          locale: 'fr',
          value: 'Première thématique',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic1.name',
          locale: 'en',
          value: 'First thematic',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic2.name',
          locale: 'fr',
          value: 'Deuxième thématique',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic2.name',
          locale: 'en',
          value: 'Second thematic',
        });

        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/thematics?filter[ids][]=thematic1&filter[ids][]=thematic2',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'themes',
              id: 'thematic1',
              attributes: {
                'pix-id': 'thematic1',
                name: 'Première thématique',
                'name-en-us': 'First thematic',
                index: 1,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence1',
                    type: 'competences',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      id: 'tube1',
                      type: 'tubes',
                    },
                    {
                      id: 'tube2',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
            {
              type: 'themes',
              id: 'thematic2',
              attributes: {
                'pix-id': 'thematic2',
                name: 'Deuxième thématique',
                'name-en-us': 'Second thematic',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence2',
                    type: 'competences',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      id: 'tube3',
                      type: 'tubes',
                    },
                    {
                      id: 'tube4',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
          ],
        });
      });
    });
  });

  describe('POST /api/thematics', async () => {
    describe('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/thematics',
          payload: {
            data: {
              type: 'themes',
              attributes: {
                name: 'Troisième thématique',
                'name-en-us': 'Third thematic',
              },
              relationships: {
                competence: {
                  data: {
                    type: 'competences',
                    id: 'competence1',
                  },
                },
                'raw-tubes': { data: [] },
              },
            },
          },
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when payload is not formatted correctly', function() {
      it('should respond with status 400', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/thematics',
          payload: {
            data: {
              type: 'themeeeees',
              attributes: {
                name: 'Troisième thématique',
                'name-en-us': 'Third thematic',
              },
              relationships: {
                competence: {
                  data: {
                    type: 'competences',
                    id: 'competence1',
                  },
                },
                'raw-tubes': { data: [] },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('success', function() {
      let generateNewId;

      beforeEach(async () => {
        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 0, competenceId: 'competence1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic2', index: 1, competenceId: 'competence1' });
        await databaseBuilder.commit();

        generateNewId = vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('thematic3');
      });

      it('should respond with status 201 and created thematic', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/thematics',
          payload: {
            data: {
              type: 'themes',
              attributes: {
                name: 'Troisième thématique',
                'name-en-us': 'Third thematic',
              },
              relationships: {
                competence: {
                  data: {
                    type: 'competences',
                    id: 'competence1',
                  },
                },
                'raw-tubes': { data: [] },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(201);
        expect(response.result).toEqual({
          data: {
            type: 'themes',
            id: 'thematic3',
            attributes: {
              'pix-id': 'thematic3',
              name: 'Troisième thématique',
              'name-en-us': 'Third thematic',
              index: 2,
            },
            relationships: {
              competence: {
                data: {
                  id: 'competence1',
                  type: 'competences',
                },
              },
              'raw-tubes': { data: [] },
            },
          },
        });

        await expect(knex.select('*').from('thematics').orderBy('index')).resolves.toStrictEqual([
          {
            id: 'thematic1',
            index: 0,
            competenceId: 'competence1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          {
            id: 'thematic2',
            index: 1,
            competenceId: 'competence1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          {
            id: 'thematic3',
            index: 2,
            competenceId: 'competence1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);

        await expect(
          knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
        ).resolves.toStrictEqual([{ key: 'thematic.thematic3.name', locale: 'en', value: 'Third thematic' }, { key: 'thematic.thematic3.name', locale: 'fr', value: 'Troisième thématique' }]);

        expect(generateNewId).toHaveBeenCalledExactlyOnceWith('thematic');
      });
    });
  });

  describe('PATCH /api/thematics/{thematicAirtableId}', async () => {
    describe('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/thematics/thematic1',
          payload: {
            data: {
              type: 'themes',
              id: 'thematic1',
              attributes: {
                'pix-id': 'thematic1',
                name: '1ère thématique',
                'name-en-us': '1st thematic',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    type: 'competences',
                    id: 'competence1',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'tube1',
                    },
                    {
                      type: 'tubes',
                      id: 'tube2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when the payload is not formatted correctly', function() {
      it('should respond with status 400', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/thematics/thematic1',
          payload: {
            data: {
              type: 'themeeeeees',
              id: 'thematic1',
              attributes: {
                'pix-id': 'thematic1',
                name: '1ère thématique',
                'name-en-us': '1st thematic',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    type: 'competences',
                    id: 'competence1',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'tube1',
                    },
                    {
                      type: 'tubes',
                      id: 'tube2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when the thematic does not exist', function() {
      it('should respond with status 404', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/thematics/thematic1',
          payload: {
            data: {
              type: 'themes',
              id: 'thematic1',
              attributes: {
                'pix-id': 'thematic1',
                name: '1ère thématique',
                'name-en-us': '1st thematic',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    type: 'competences',
                    id: 'competence1',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'tube1',
                    },
                    {
                      type: 'tubes',
                      id: 'tube2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    describe('success', function() {
      beforeEach(async () => {
        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({
          id: 'thematic1',
          index: 1,
          competenceId: 'competence1',
          createdAt: '2025-09-29T13:20:25Z',
        });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@bar', thematicId: 'thematic1' });

        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic1.name',
          locale: 'fr',
          value: 'Première thématique',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic1.name',
          locale: 'en',
          value: 'First thematic',
        });

        await databaseBuilder.commit();
      });

      it('should respond with status 201 and created thematic', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/thematics/thematic1',
          payload: {
            data: {
              type: 'themes',
              id: 'thematic1',
              attributes: {
                'pix-id': 'thematic1',
                name: '1ère thématique',
                'name-en-us': '1st thematic',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    type: 'competences',
                    id: 'competence1',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'tube1',
                    },
                    {
                      type: 'tubes',
                      id: 'tube2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);
        expect(response.result).toEqual({
          data: {
            type: 'themes',
            id: 'thematic1',
            attributes: {
              'pix-id': 'thematic1',
              name: '1ère thématique',
              'name-en-us': '1st thematic',
              index: 2,
            },
            relationships: {
              competence: {
                data: {
                  type: 'competences',
                  id: 'competence1',
                },
              },
              'raw-tubes': {
                data: [
                  {
                    type: 'tubes',
                    id: 'tube1',
                  },
                  {
                    type: 'tubes',
                    id: 'tube2',
                  },
                ],
              },
            },
          },
        });

        await expect(knex.select('*').from('thematics')).resolves.toStrictEqual([
          {
            id: 'thematic1',
            index: 2,
            competenceId: 'competence1',
            createdAt: new Date('2025-09-29T13:20:25Z'),
            updatedAt: expect.any(Date),
          },
        ]);

        await expect(
          knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
        ).resolves.toStrictEqual([{ key: 'thematic.thematic1.name', locale: 'en', value: '1st thematic' }, { key: 'thematic.thematic1.name', locale: 'fr', value: '1ère thématique' }]);
      });
    });
  });
});
