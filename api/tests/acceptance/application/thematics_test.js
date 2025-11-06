import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';

import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { thematicDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
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
    let airtableThematicScope;

    context('when provided id has not the right format', function() {
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

    context('when thematic does not exist', function() {
      it('should respond with a status 404', async function() {
        const server = await createServer();
        airtableThematicScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques/recThematic2')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/thematics/recThematic2',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
        expect(airtableThematicScope.isDone()).toBe(true);
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

      const airtableThematic = airtableBuilder.factory.buildThematic(
        domainBuilder.buildThematicDatasourceObject({
          id: 'thematic1',
          airtableId: 'recThematic1',
          index: 1,
          competenceAirtableId: 'recCompetence1',
          competenceId: 'competence1',
          tubeAirtableIds: ['recTube1', 'recTube2'],
          tubeIds: ['tube1', 'tube2'],
        }),
      );

      airtableThematicScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques/recThematic1')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableThematic);

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
        url: '/api/thematics/recThematic1',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({
        data: {
          type: 'themes',
          id: 'recThematic1',
          attributes: {
            'pix-id': 'thematic1',
            name: 'Première thématique',
            'name-en-us': 'First thematic',
            index: 1,
          },
          relationships: {
            competence: {
              data: {
                id: 'recCompetence1',
                type: 'competences',
              },
            },
            'raw-tubes': {
              data: [
                {
                  id: 'recTube1',
                  type: 'tubes',
                },
                {
                  id: 'recTube2',
                  type: 'tubes',
                },
              ],
            },
          },
        },
      });
      expect(airtableThematicScope.isDone()).toBe(true);
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

        const airtableThematics = [
          airtableBuilder.factory.buildThematic(
            domainBuilder.buildThematicDatasourceObject({
              id: 'thematic1',
              airtableId: 'recThematic1',
              index: 1,
              competenceAirtableId: 'recCompetence1',
              competenceId: 'competence1',
              tubeAirtableIds: ['recTube1', 'recTube2'],
              tubeIds: ['tube1', 'tube2'],
            }),
          ),
          airtableBuilder.factory.buildThematic(
            domainBuilder.buildThematicDatasourceObject({
              id: 'thematic2',
              airtableId: 'recThematic2',
              index: 2,
              competenceAirtableId: 'recCompetence2',
              competenceId: 'competence2',
              tubeAirtableIds: ['recTube3', 'recTube4'],
              tubeIds: ['tube3', 'tube4'],
            }),
          ),
        ];

        const airtableThematicsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques')
          .query({
            fields: { '': thematicDatasource.usedFields },
            sort: [{ field: thematicDatasource.sortField, direction: 'asc' }],
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableThematics });

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
              id: 'recThematic1',
              attributes: {
                'pix-id': 'thematic1',
                name: 'Première thématique',
                'name-en-us': 'First thematic',
                index: 1,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'recCompetence1',
                    type: 'competences',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      id: 'recTube1',
                      type: 'tubes',
                    },
                    {
                      id: 'recTube2',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
            {
              type: 'themes',
              id: 'recThematic2',
              attributes: {
                'pix-id': 'thematic2',
                name: 'Deuxième thématique',
                'name-en-us': 'Second thematic',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'recCompetence2',
                    type: 'competences',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      id: 'recTube3',
                      type: 'tubes',
                    },
                    {
                      id: 'recTube4',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
          ],
        });

        expect(airtableThematicsScope.isDone()).toBe(true);
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

        const airtableThematics = [
          airtableBuilder.factory.buildThematic(
            domainBuilder.buildThematicDatasourceObject({
              id: 'thematic1',
              airtableId: 'recThematic1',
              competenceId: 'competence1',
              tubeIds: ['tube1', 'tube2'],
              index: 1,
              competenceAirtableId: 'recCompetence1',
              tubeAirtableIds: ['recTube1', 'recTube2'],
            }),
          ),
          airtableBuilder.factory.buildThematic(
            domainBuilder.buildThematicDatasourceObject({
              id: 'thematic2',
              airtableId: 'recThematic2',
              competenceId: 'competence2',
              tubeIds: ['tube3', 'tube4'],
              index: 2,
              competenceAirtableId: 'recCompetence2',
              tubeAirtableIds: ['recTube3', 'recTube4'],
            }),
          ),
        ];

        const airtableThematicsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques')
          .query({
            filterByFormula: 'OR(RECORD_ID() = "recThematic1", RECORD_ID() = "recThematic2")',
            fields: { '': thematicDatasource.usedFields },
            sort: [{ field: thematicDatasource.sortField, direction: 'asc' }],
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableThematics });

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
          url: '/api/thematics?filter[ids][]=recThematic1&filter[ids][]=recThematic2',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'themes',
              id: 'recThematic1',
              attributes: {
                'pix-id': 'thematic1',
                name: 'Première thématique',
                'name-en-us': 'First thematic',
                index: 1,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'recCompetence1',
                    type: 'competences',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      id: 'recTube1',
                      type: 'tubes',
                    },
                    {
                      id: 'recTube2',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
            {
              type: 'themes',
              id: 'recThematic2',
              attributes: {
                'pix-id': 'thematic2',
                name: 'Deuxième thématique',
                'name-en-us': 'Second thematic',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'recCompetence2',
                    type: 'competences',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      id: 'recTube3',
                      type: 'tubes',
                    },
                    {
                      id: 'recTube4',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
          ],
        });

        expect(airtableThematicsScope.isDone()).toBe(true);
      });
    });
  });

  describe('POST /api/thematics', async () => {
    let airtableCreateThematicScope, airtableThematicsScope;

    context('when user has not the right to do the operation', function() {
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
                    id: 'recCompetence1',
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

    context('when payload is not formatted correctly', function() {
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
                    id: 'recCompetence1',
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

    context('success', function() {
      beforeEach(async () => {
        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 0, competenceId: 'competence1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic2', index: 1, competenceId: 'competence1' });
        await databaseBuilder.commit();

        const airtableThematics = [
          airtableBuilder.factory.buildThematic(
            domainBuilder.buildThematicDatasourceObject({
              id: 'thematic1',
              airtableId: 'recThematic1',
              index: 0,
              competenceAirtableId: 'recCompetence1',
              competenceId: 'competence1',
              tubeIds: [],
            }),
          ),
          airtableBuilder.factory.buildThematic(
            domainBuilder.buildThematicDatasourceObject({
              id: 'thematic2',
              airtableId: 'recThematic2',
              index: 1,
              competenceAirtableId: 'recCompetence1',
              competenceId: 'competence1',
              tubeIds: [],
            }),
          ),
        ];

        airtableThematicsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques')
          .query({
            filterByFormula: 'Competence = "recCompetence1"',
            fields: { '': thematicDatasource.usedFields },
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableThematics });

        const createdAirtableThematic = airtableBuilder.factory.buildThematic(
          domainBuilder.buildThematicDatasourceObject({
            id: 'thematic3',
            airtableId: 'recThematic3',
            index: 2,
            competenceAirtableId: 'recCompetence1',
            competenceId: 'competence1',
            tubeAirtableIds: [],
            tubeIds: [],
          }),
        );

        airtableCreateThematicScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Thematiques/', {
            records: [
              {
                fields: {
                  'id persistant': createdAirtableThematic.fields['id persistant'],
                  Index: 2,
                  Competence: ['recCompetence1'],
                },
              },
            ],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [createdAirtableThematic] });

        vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('thematic3');
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
                    id: 'recCompetence1',
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
            id: 'recThematic3',
            attributes: {
              'pix-id': 'thematic3',
              name: 'Troisième thématique',
              'name-en-us': 'Third thematic',
              index: 2,
            },
            relationships: {
              competence: {
                data: {
                  id: 'recCompetence1',
                  type: 'competences',
                },
              },
              'raw-tubes': { data: [] },
            },
          },
        });

        expect(airtableCreateThematicScope.isDone()).toBe(true);
        expect(airtableThematicsScope.isDone()).toBe(true);

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
      });
    });
  });

  describe('PATCH /api/thematics/{thematicAirtableId}', async () => {
    let airtableUpdateThematicScope, airtableThematicScope;

    context('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/thematics/recThematic1',
          payload: {
            data: {
              type: 'themes',
              id: 'recThematic1',
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
                    id: 'recCompetence1',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'recTube1',
                    },
                    {
                      type: 'tubes',
                      id: 'recTube2',
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

    context('when the payload is not formatted correctly', function() {
      it('should respond with status 400', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/thematics/recThematic1',
          payload: {
            data: {
              type: 'themeeeeees',
              id: 'recThematic1',
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
                    id: 'recCompetence1',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'recTube1',
                    },
                    {
                      type: 'tubes',
                      id: 'recTube2',
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

    context('when the thematic does not exist', function() {
      it('should respond with status 404', async () => {
        // given
        const server = await createServer();
        airtableThematicScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques/recThematic1')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/thematics/recThematic1',
          payload: {
            data: {
              type: 'themes',
              id: 'recThematic1',
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
                    id: 'recCompetence1',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'recTube1',
                    },
                    {
                      type: 'tubes',
                      id: 'recTube2',
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

    context('success', function() {
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

        const airtableThematic = airtableBuilder.factory.buildThematic(
          domainBuilder.buildThematicDatasourceObject({
            id: 'thematic1',
            airtableId: 'recThematic1',
            index: 1,
            competenceAirtableId: 'recCompetence1',
            competenceId: 'competence1',
            tubeAirtableIds: ['recTube1', 'recTube2'],
            tubeIds: ['tube1', 'tube2'],
          }),
        );

        airtableThematicScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques/recThematic1')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableThematic);

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

        const updatedAirtableThematic = airtableBuilder.factory.buildThematic(
          domainBuilder.buildThematicDatasourceObject({
            id: 'thematic1',
            airtableId: 'recThematic1',
            index: 2,
            competenceAirtableId: 'recCompetence1',
            competenceId: 'competence1',
            tubeAirtableIds: ['recTube1', 'recTube2'],
            tubeIds: ['tube1', 'tube2'],
          }),
        );

        airtableUpdateThematicScope = nock('https://api.airtable.com')
          .patch('/v0/airtableBaseValue/Thematiques/', {
            records: [
              {
                fields: {
                  'id persistant': 'thematic1',
                  Index: 2,
                  Competence: ['recCompetence1'],
                },
                id: 'recThematic1',
              },
            ],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [updatedAirtableThematic] });
      });

      it('should respond with status 201 and created thematic', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/thematics/recThematic1',
          payload: {
            data: {
              type: 'themes',
              id: 'recThematic1',
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
                    id: 'recCompetence1',
                  },
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'recTube1',
                    },
                    {
                      type: 'tubes',
                      id: 'recTube2',
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
            id: 'recThematic1',
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
                  id: 'recCompetence1',
                },
              },
              'raw-tubes': {
                data: [
                  {
                    type: 'tubes',
                    id: 'recTube1',
                  },
                  {
                    type: 'tubes',
                    id: 'recTube2',
                  },
                ],
              },
            },
          },
        });

        expect(airtableUpdateThematicScope.isDone()).toBe(true);
        expect(airtableThematicScope.isDone()).toBe(true);

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
