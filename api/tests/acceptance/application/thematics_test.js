import {  afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import _ from 'lodash';

import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { thematicDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';

describe('Application | Route | Thematics', () => {
  let editorUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/thematics/{thematicAirtableId}', () => {
    let airtableThematicScope;

    beforeEach(async () => {
      const airtableThematic = airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
        id: 'thematic1',
        airtableId: 'recThematic1',
        index: 1,
        competenceAirtableId: 'recCompetence1',
        tubeAirtableIds: ['recTube1', 'recTube2'],
      }));

      airtableThematicScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques/recThematic1')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableThematic);

      databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'fr', value: 'Première thématique' });
      databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'en', value: 'First thematic' });

      await databaseBuilder.commit();
    });

    it('should respond with status 200 and thematic data', async () => {
      // given
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
            'competence': {
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
          }
        },
      });

      expect(airtableThematicScope.isDone()).toBe(true);
    });
  });

  describe('GET /api/thematics', () => {
    describe('when using no filters', () => {
      it('should respond with status 200 and thematics data', async () => {
        // given
        const airtableThematics = [
          airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
            id: 'thematic1',
            airtableId: 'recThematic1',
            index: 1,
            competenceAirtableId: 'recCompetence1',
            tubeAirtableIds: ['recTube1', 'recTube2'],
          })),
          airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
            id: 'thematic2',
            airtableId: 'recThematic2',
            index: 2,
            competenceAirtableId: 'recCompetence2',
            tubeAirtableIds: ['recTube3', 'recTube4'],
          })),
        ];

        const airtableThematicsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques')
          .query({
            fields: { '': thematicDatasource.usedFields },
            sort: [{ field: thematicDatasource.sortField, direction: 'asc' }]
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableThematics });

        databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'fr', value: 'Première thématique' });
        databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'en', value: 'First thematic' });
        databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic2.name', locale: 'fr', value: 'Deuxième thématique' });
        databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic2.name', locale: 'en', value: 'Second thematic' });

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
                'competence': {
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
              }
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
                'competence': {
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
              }
            },
          ],
        });

        expect(airtableThematicsScope.isDone()).toBe(true);
      });
    });

    describe('when filtering by ids', () => {
      it('should respond with status 200 and thematics data', async () => {
        // given
        const airtableThematics = [
          airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
            id: 'thematic1',
            airtableId: 'recThematic1',
            index: 1,
            competenceAirtableId: 'recCompetence1',
            tubeAirtableIds: ['recTube1', 'recTube2'],
          })),
          airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
            id: 'thematic2',
            airtableId: 'recThematic2',
            index: 2,
            competenceAirtableId: 'recCompetence2',
            tubeAirtableIds: ['recTube3', 'recTube4'],
          })),
        ];

        const airtableThematicsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques')
          .query({
            filterByFormula: 'OR(RECORD_ID() = "recThematic1", RECORD_ID() = "recThematic2")',
            fields: { '': thematicDatasource.usedFields },
            sort: [{ field: thematicDatasource.sortField, direction: 'asc' }]
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableThematics });

        databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'fr', value: 'Première thématique' });
        databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'en', value: 'First thematic' });
        databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic2.name', locale: 'fr', value: 'Deuxième thématique' });
        databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic2.name', locale: 'en', value: 'Second thematic' });

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
                'competence': {
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
              }
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
                'competence': {
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
              }
            },
          ],
        });

        expect(airtableThematicsScope.isDone()).toBe(true);
      });
    });
  });

  describe('POST /api/thematics', async () => {
    let airtableCreateThematicScope, airtableThematicsScope, pixApiCacheScope;

    beforeEach(async () => {
      const airtableThematics = [
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
          id: 'thematic1',
          airtableId: 'recThematic1',
          index: 0,
          competenceAirtableId: 'recCompetence1',
          competenceId: 'competence1',
        })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
          id: 'thematic2',
          airtableId: 'recThematic2',
          index: 1,
          competenceAirtableId: 'recCompetence1',
          competenceId: 'competence1',
        })),
      ];

      airtableThematicsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques')
        .query({
          filterByFormula: 'Competence = "recCompetence1"',
          fields: { '': thematicDatasource.usedFields },
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableThematics });

      const createdAirtableThematic = airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
        id: 'thematic3',
        airtableId: 'recThematic3',
        index: 2,
        competenceAirtableId: 'recCompetence1',
        competenceId: 'competence1',
        tubeAirtableIds: [],
        tubeIds: [],
      }));

      airtableCreateThematicScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Thematiques/', {
          records: [{
            fields: {
              'id persistant': createdAirtableThematic.fields['id persistant'],
              'Index': 2,
              'Competence': ['recCompetence1'],
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [createdAirtableThematic] });

      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('thematic3');

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken });
      pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/thematics/thematic3', {
          id: createdAirtableThematic.fields['id persistant'],
          name_i18n: {
            fr: 'Troisième thématique',
            en: 'Third thematic',
          },
          index: 2,
          competenceId: 'competence1',
          tubeIds: [],
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
    });

    afterEach(async () => {
      await knex('translations').truncate();
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
              'name': 'Troisième thématique',
              'name-en-us': 'Third thematic',
            },
            relationships: {
              'competence': {
                data: {
                  type: 'competences',
                  id: 'recCompetence1',
                },
              },
              'raw-tubes': {
                data: [],
              },
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
            'name': 'Troisième thématique',
            'name-en-us': 'Third thematic',
            'index': 2,
          },
          relationships: {
            competence: {
              data: {
                id: 'recCompetence1',
                type: 'competences'
              }
            },
            'raw-tubes': {
              data: [],
            },
          },
        },
      });

      expect(airtableCreateThematicScope.isDone()).toBe(true);
      expect(airtableThematicsScope.isDone()).toBe(true);
      expect(pixApiCacheScope.isDone()).toBe(true);

      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([
        { key: 'thematic.thematic3.name', locale: 'en', value: 'Third thematic' },
        { key: 'thematic.thematic3.name', locale: 'fr', value: 'Troisième thématique' },
      ]);
    });
  });

  describe('PATCH /api/thematics/{thematicAirtableId}', async () => {
    let airtableUpdateThematicScope, airtableThematicScope, pixApiCacheScope;

    beforeEach(async () => {
      const airtableThematic = airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
        id: 'thematic1',
        airtableId: 'recThematic1',
        index: 1,
        competenceAirtableId: 'recCompetence1',
        tubeAirtableIds: ['recTube1', 'recTube2'],
      }));

      airtableThematicScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques/recThematic1')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableThematic);

      databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'fr', value: 'Première thématique' });
      databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'en', value: 'First thematic' });

      await databaseBuilder.commit();

      const updatedAirtableThematic = airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
        id: 'thematic1',
        airtableId: 'recThematic1',
        index: 2,
        competenceAirtableId: 'recCompetence1',
        competenceId: 'competence1',
        tubeAirtableIds: ['recTube1', 'recTube2'],
        tubeIds: ['tube1', 'tube2'],
      }));

      airtableUpdateThematicScope = nock('https://api.airtable.com')
        .patch('/v0/airtableBaseValue/Thematiques/', {
          records: [{
            fields: {
              'id persistant': 'thematic1',
              'Index': 2,
              'Competence': ['recCompetence1'],
            },
            id: 'recThematic1',
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [updatedAirtableThematic] });

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken });
      pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/thematics/thematic1', {
          id: 'thematic1',
          name_i18n: {
            fr: '1ère thématique',
            en: '1st thematic',
          },
          index: 2,
          competenceId: 'competence1',
          tubeIds: ['tube1', 'tube2'],
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
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
              'name': '1ère thématique',
              'name-en-us': '1st thematic',
              index: 2,
            },
            relationships: {
              'competence': {
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
            'name': '1ère thématique',
            'name-en-us': '1st thematic',
            index: 2,
          },
          relationships: {
            'competence': {
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
      expect(pixApiCacheScope.isDone()).toBe(true);

      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([
        { key: 'thematic.thematic1.name', locale: 'en', value: '1st thematic' },
        { key: 'thematic.thematic1.name', locale: 'fr', value: '1ère thématique' },
      ]);
    });
  });
});
