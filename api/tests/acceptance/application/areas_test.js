import { beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { areaDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';

describe('Acceptance | Route | areas', () => {

  let editorUser, adminUser;
  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    adminUser = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /areas', async () => {
    let airtableAreasScope;

    beforeEach(async () => {
      const airtableAreas = [
        airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
          id: 'area1',
          airtableId: 'recArea1',
          code: '1',
          frameworkId: 'framework1',
          competenceAirtableIds: ['recCompetence1', 'recCompetence2'],
          competenceIds: ['competence1', 'competence2'],
          color: null,
        })),
        airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
          id: 'area4',
          airtableId: 'recArea4',
          code: '1',
          frameworkId: 'framework2',
          competenceAirtableIds: ['recCompetence8', 'recCompetence9'],
          competenceIds: ['competence8', 'competence9'],
          color: null,
        })),
        airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
          id: 'area2',
          airtableId: 'recArea2',
          code: '2',
          frameworkId: 'framework1',
          competenceAirtableIds: ['recCompetence4', 'recCompetence3'],
          competenceIds: ['competence4', 'competence3'],
          color: null,
        })),
        airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
          id: 'area3',
          airtableId: 'recArea3',
          code: '3',
          frameworkId: 'framework1',
          competenceAirtableIds: ['recCompetence7', 'recCompetence5', 'recCompetence6'],
          competenceIds: ['competence7', 'competence5', 'competence6'],
          color: null,
        })),
      ];

      airtableAreasScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Domaines')
        .query({
          fields: { '': areaDatasource.usedFields },
          sort: [{ field: areaDatasource.sortField, direction: 'asc' }]
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableAreas });

      databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'fr', value: 'Premier domaine' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'en', value: 'First domain' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area2.title', locale: 'fr', value: 'Deuxième domaine' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area2.title', locale: 'en', value: 'Second domain' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area3.title', locale: 'fr', value: 'Troisième domaine' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area3.title', locale: 'en', value: 'Third domain' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area4.title', locale: 'fr', value: 'Quatrième domaine' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area4.title', locale: 'en', value: 'Fourth domain' });

      await databaseBuilder.commit();
    });

    it('should respond with status 200 and areas', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/areas',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: [
          {
            type: 'areas',
            id: 'recArea1',
            attributes: {
              'pix-id': 'area1',
              code: '1',
              'title-fr-fr': 'Premier domaine',
              'title-en-us': 'First domain',
              name: '1. Premier domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework1',
                },
              },
              competences: {
                data: [
                  { id: 'recCompetence1', type: 'competences' },
                  { id: 'recCompetence2', type: 'competences' },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'recArea4',
            attributes: {
              'pix-id': 'area4',
              code: '1',
              'title-fr-fr': 'Quatrième domaine',
              'title-en-us': 'Fourth domain',
              name: '1. Quatrième domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework2',
                },
              },
              competences: {
                data: [
                  { id: 'recCompetence8', type: 'competences' },
                  { id: 'recCompetence9', type: 'competences' },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'recArea2',
            attributes: {
              'pix-id': 'area2',
              code: '2',
              'title-fr-fr': 'Deuxième domaine',
              'title-en-us': 'Second domain',
              name: '2. Deuxième domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework1',
                },
              },
              competences: {
                data: [
                  { id: 'recCompetence4', type: 'competences' },
                  { id: 'recCompetence3', type: 'competences' },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'recArea3',
            attributes: {
              'pix-id': 'area3',
              code: '3',
              'title-fr-fr': 'Troisième domaine',
              'title-en-us': 'Third domain',
              name: '3. Troisième domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework1',
                },
              },
              competences: {
                data: [
                  { id: 'recCompetence7', type: 'competences' },
                  { id: 'recCompetence5', type: 'competences' },
                  { id: 'recCompetence6', type: 'competences' },
                ],
              },
            },
          },
        ],
      });

      expect(airtableAreasScope.isDone()).toBe(true);
    });
  });

  describe('POST /areas', () => {
    describe('when user is NOT admin', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/areas',
          payload: {
            data: {
              type: 'areas',
              attributes: {
                'title-fr-fr': 'Mon domaine',
                'title-en-us': 'My domain',
              },
              relationships: {
                framework: {
                  data: {
                    type: 'frameworks',
                    id: 'framework2',
                  },
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/areas',
          payload: {
            data: {
              type: 'areas',
              attributes: {
                'title-fr-fr': 'Mon domaine',
                'title-en-us': 'My domain',
              },
              relationships: {
                framework: {
                  data: null,
                },
              },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when user is admin', () => {
      it('should respond with status 201 and created area', async () => {
        // given
        const airtableArea = airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
          id: 'area5',
          airtableId: 'recArea5',
          code: '2',
          frameworkId: 'framework2',
          competenceAirtableIds: null,
          competenceIds: null,
          color: null,
        }));

        const airtableAreas = [
          airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
            id: 'area1',
            airtableId: 'recArea2',
            code: '1',
            frameworkId: 'framework1',
          })),
          airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
            id: 'area4',
            airtableId: 'recArea4',
            code: '1',
            frameworkId: 'framework2',
          })),
          airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
            id: 'area2',
            airtableId: 'recArea2',
            code: '2',
            frameworkId: 'framework1',
          })),
        ];

        const airtableGetAreasScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Domaines')
          .query({
            fields: { '': areaDatasource.usedFields },
            sort: [{ field: areaDatasource.sortField, direction: 'asc' }],
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableAreas });

        const airtablePostAreaScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Domaines/', {
            records: [{
              fields: {
                'id persistant': 'area5',
                Code: '2',
                Referentiel: ['framework2'],
              },
            }],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [airtableArea] });

        const generateNewId = vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('area5');

        const pixApiToken = 'secret';
        nock('https://api.test.pix.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': pixApiToken });
        const pixApiCacheScope = nock('https://api.test.pix.fr')
          .patch('/api/cache/areas/area5', {
            id: 'area5',
            code: '2',
            title_i18n: {
              fr: 'Cinquième domaine',
              en: 'Fifth domain',
            },
            name: '2. Cinquième domaine',
            frameworkId: 'framework2',
            competenceIds: null,
            color: null,
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          payload: {
            data: {
              type: 'areas',
              attributes: {
                'title-fr-fr': 'Cinquième domaine',
                'title-en-us': 'Fifth domain',
              },
              relationships: {
                framework: {
                  data: {
                    type: 'frameworks',
                    id: 'framework2',
                  },
                },
              },
            },
          },
          url: '/api/areas',
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(201);

        expect(response.result).toEqual({
          data: {
            type: 'areas',
            id: 'recArea5',
            attributes: {
              'pix-id': 'area5',
              code: '2',
              'title-fr-fr': 'Cinquième domaine',
              'title-en-us': 'Fifth domain',
              name: '2. Cinquième domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework2',
                },
              },
              competences: {
                data: null,
              },
            },
          },
        });

        expect(generateNewId).toHaveBeenCalledWith('area');

        await expect(knex.select('key', 'locale', 'value').from('translations').orderBy('locale')).resolves.toStrictEqual([
          { key: 'area.area5.title', locale: 'en', value: 'Fifth domain' },
          { key: 'area.area5.title', locale: 'fr', value: 'Cinquième domaine' },
        ]);

        expect(airtableGetAreasScope.isDone()).toBe(true);
        expect(airtablePostAreaScope.isDone()).toBe(true);
        expect(pixApiCacheScope.isDone()).toBe(true);
      });
    });
  });
});
