import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { competenceDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';

describe('Acceptance | Route | competences', () => {

  let editorUser, adminUser;
  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    adminUser = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /competences', async () => {
    let airtableCompetencesScope;

    beforeEach(async () => {
      const airtableCompetences = [
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence1',
          airtableId: 'recCompetence1',
          index: '1.1',
          areaAirtableId: 'recArea1',
          origin: 'Pix',
          thematicAirtableIds: ['recThematic1', 'recThematic2'],
          tubeAirtableIds: ['recTube1', 'recTube2', 'recTube3', 'recTube4', 'recTube5'],
        })),
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence11',
          airtableId: 'recCompetence11',
          index: '1.1',
          areaAirtableId: 'recArea11',
          origin: 'Pix Junior',
          thematicAirtableIds: ['recThematic11', 'recThematic12'],
          tubeAirtableIds: ['recTube11', 'recTube12', 'recTube13'],
        })),
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence2',
          airtableId: 'recCompetence2',
          index: '1.2',
          areaAirtableId: 'recArea1',
          origin: 'Pix',
          thematicAirtableIds: ['recThematic3'],
          tubeAirtableIds: ['recTube6', 'recTube7'],
        })),
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence12',
          airtableId: 'recCompetence12',
          index: '1.2',
          areaAirtableId: 'recArea11',
          origin: 'Pix Junior',
          thematicAirtableIds: ['recThematic13', 'recThematic14'],
          tubeAirtableIds: ['recTube14', 'recTube15', 'recTube16', 'recTube17'],
        })),
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence3',
          airtableId: 'recCompetence3',
          index: '2.1',
          areaAirtableId: 'recArea2',
          origin: 'Pix',
          thematicAirtableIds: ['recThematic4', 'recThematic5'],
          tubeAirtableIds: ['recTube8', 'recTube9'],
        })),
      ];

      airtableCompetencesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Competences')
        .query({
          fields: { '': competenceDatasource.usedFields },
          sort: [{ field: competenceDatasource.sortField, direction: 'asc' }]
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableCompetences });

      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.name', locale: 'fr', value: 'Première compétence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.name', locale: 'en', value: 'First competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.description', locale: 'fr', value: 'C’est la première' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.description', locale: 'en', value: 'It’s the first one' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence11.name', locale: 'fr', value: 'Première compétence junior' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence11.name', locale: 'en', value: 'First junior competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence11.description', locale: 'fr', value: 'C’est la première pour les juniors' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence11.description', locale: 'en', value: 'It’s the first one for juniors' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.name', locale: 'fr', value: 'Deuxième compétence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.name', locale: 'en', value: 'Second competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.description', locale: 'fr', value: 'C’est la deuxième' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.description', locale: 'en', value: 'It’s the second one' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence12.name', locale: 'fr', value: 'Deuxième compétence junior' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence12.name', locale: 'en', value: 'Second junior competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence12.description', locale: 'fr', value: 'C’est la deuxième pour les juniors' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence12.description', locale: 'en', value: 'It’s the second one for juniors' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence3.name', locale: 'fr', value: 'Troisième compétence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence3.name', locale: 'en', value: 'Third competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence3.description', locale: 'fr', value: 'C’est la troisième' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence3.description', locale: 'en', value: 'It’s the third one' });

      await databaseBuilder.commit();
    });

    it('should respond with status 200 and competences', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/competences',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: [
          {
            type: 'competences',
            id: 'recCompetence1',
            attributes: {
              'pix-id': 'competence1',
              code: '1.1',
              title: 'Première compétence',
              'title-en': 'First competence',
              description: 'C’est la première',
              'description-en': 'It’s the first one',
              source: 'Pix',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recArea1',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic1', type: 'themes' },
                  { id: 'recThematic2', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube1', type: 'tubes' },
                  { id: 'recTube2', type: 'tubes' },
                  { id: 'recTube3', type: 'tubes' },
                  { id: 'recTube4', type: 'tubes' },
                  { id: 'recTube5', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCompetence11',
            attributes: {
              'pix-id': 'competence11',
              code: '1.1',
              title: 'Première compétence junior',
              'title-en': 'First junior competence',
              description: 'C’est la première pour les juniors',
              'description-en': 'It’s the first one for juniors',
              source: 'Pix Junior',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recArea11',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic11', type: 'themes' },
                  { id: 'recThematic12', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube11', type: 'tubes' },
                  { id: 'recTube12', type: 'tubes' },
                  { id: 'recTube13', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCompetence2',
            attributes: {
              'pix-id': 'competence2',
              code: '1.2',
              title: 'Deuxième compétence',
              'title-en': 'Second competence',
              description: 'C’est la deuxième',
              'description-en': 'It’s the second one',
              source: 'Pix',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recArea1',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic3', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube6', type: 'tubes' },
                  { id: 'recTube7', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCompetence12',
            attributes: {
              'pix-id': 'competence12',
              code: '1.2',
              title: 'Deuxième compétence junior',
              'title-en': 'Second junior competence',
              description: 'C’est la deuxième pour les juniors',
              'description-en': 'It’s the second one for juniors',
              source: 'Pix Junior',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recArea11',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic13', type: 'themes' },
                  { id: 'recThematic14', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube14', type: 'tubes' },
                  { id: 'recTube15', type: 'tubes' },
                  { id: 'recTube16', type: 'tubes' },
                  { id: 'recTube17', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCompetence3',
            attributes: {
              'pix-id': 'competence3',
              code: '2.1',
              title: 'Troisième compétence',
              'title-en': 'Third competence',
              description: 'C’est la troisième',
              'description-en': 'It’s the third one',
              source: 'Pix',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recArea2',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic4', type: 'themes' },
                  { id: 'recThematic5', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube8', type: 'tubes' },
                  { id: 'recTube9', type: 'tubes' },
                ],
              },
            },
          },
        ],
      });

      expect(airtableCompetencesScope.isDone()).toBe(true);
    });
  });

  describe('GET /competences/{competenceAirtableid}', async () => {
    let airtableCompetence, airtableCompetenceScope;

    beforeEach(async () => {
      airtableCompetence = airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
        id: 'competence2',
        airtableId: 'recCompetence2',
        index: '1.2',
        areaAirtableId: 'recArea1',
        origin: 'Pix',
        thematicAirtableIds: ['recThematic3'],
        tubeAirtableIds: ['recTube6', 'recTube7'],
      }));

      airtableCompetenceScope = nock('https://api.airtable.com')
        .get(`/v0/airtableBaseValue/Competences/${airtableCompetence.id}`)
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableCompetence);

      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.name', locale: 'fr', value: 'Deuxième compétence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.name', locale: 'en', value: 'Second competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.description', locale: 'fr', value: 'C’est la deuxième' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.description', locale: 'en', value: 'It’s the second one' });

      await databaseBuilder.commit();
    });

    describe('when competence is unknown', () => {
      it('should respond with status 404', async () => {
        // given
        const airtableUnknownCompetenceScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Competences/recCompetence404')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/competences/recCompetence404',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);

        expect(airtableUnknownCompetenceScope.isDone()).toBe(true);
      });
    });

    it('should respond with status 200 and competence', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/competences/${airtableCompetence.id}`,
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: {
          type: 'competences',
          id: 'recCompetence2',
          attributes: {
            'pix-id': 'competence2',
            code: '1.2',
            title: 'Deuxième compétence',
            'title-en': 'Second competence',
            description: 'C’est la deuxième',
            'description-en': 'It’s the second one',
            source: 'Pix',
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'recArea1',
              },
            },
            'raw-themes': {
              data: [
                { id: 'recThematic3', type: 'themes' },
              ],
            },
            'raw-tubes': {
              data: [
                { id: 'recTube6', type: 'tubes' },
                { id: 'recTube7', type: 'tubes' },
              ],
            },
          },
        },
      });

      expect(airtableCompetenceScope.isDone()).toBe(true);
    });
  });

  describe('POST /competences', async () => {
    let airtableAreaScope;
    let airtableCompetencesScope;
    let airtableCreateCompetenceScope;
    let airtableCreateThematicScope;
    let airtableCreateTubeScope;
    let airtableCreateSkillScope;
    let generateNewId;
    let pixApiCompetenceCacheScope;
    let pixApiThematicCacheScope;

    beforeEach(async () => {
      const airtableArea = airtableBuilder.factory.buildArea(domainBuilder.buildAreaDatasourceObject({
        id: 'area2',
        airtableId: 'recArea2',
        code: '2',
      }));

      airtableAreaScope = nock('https://api.airtable.com')
        .get(`/v0/airtableBaseValue/Domaines/${airtableArea.id}`)
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableArea);

      const airtableCompetences = [
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence3',
          airtableId: 'recCompetence3',
          index: '2.1',
          areaAirtableId: 'recArea2',
        })),
      ];

      airtableCompetencesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Competences')
        .query({
          fields: { '': competenceDatasource.usedFields },
          filterByFormula: 'Domaine = "recArea2"',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableCompetences });

      const airtableCompetence = airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
        id: 'competence4',
        airtableId: 'recCompetence4',
        index: '2.2',
        areaId: 'area2',
        areaAirtableId: 'recArea2',
        origin: 'Pix',
        thematicIds: null,
        thematicAirtableIds: null,
        tubeAirtableIds: null,
        skillIds: null,
      }));

      const airtableThematic = airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
        id: 'thematic1',
        airtableId: 'recThematic1',
        index: 0,
        competenceId: 'competence4',
        tubeIds: [],
      }));

      const airtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
        id: 'tube1',
        airtableId: 'recTube1',
        name: '@workbench',
        competenceId: 'competence4',
        index: null,
      }));

      const airtableSkill = airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
        id: 'skill1',
        airtableId: 'recSkill1',
        name: '@workbench',
        tubeAirtableId: 'recTube1',
        tubeId: 'tube1',
        description: 'Acquis pour l\'atelier de la compétence 2.2 Pix',
      }));

      airtableCreateCompetenceScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Competences/', {
          records: [{
            fields: {
              'id persistant': 'competence4',
              'Sous-domaine': '2.2',
              Domaine: ['recArea2'],
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableCompetence] });

      airtableCreateThematicScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Thematiques/', {
          records: [{
            fields: {
              'id persistant': 'thematic1',
              Competence: ['recCompetence4'],
              Index: 0,
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableThematic] });

      airtableCreateTubeScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Tubes/', {
          records: [{
            fields: {
              'id persistant': 'tube1',
              Nom: '@workbench',
              Competences: ['recCompetence4'],
              Thematique: ['recThematic1'],
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableTube] });

      airtableCreateSkillScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Acquis/', {
          records: [{
            fields: {
              'id persistant': 'skill1',
              Tube: ['recTube1'],
              Description: 'Acquis pour l\'atelier de la compétence 2.2 Pix',
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableSkill] });

      generateNewId = vi.spyOn(idGenerator, 'generateNewId');
      generateNewId.mockImplementation((prefix) => {
        switch (prefix) {
          case 'competence': return 'competence4';
          case 'thematic': return 'thematic1';
          case 'tube': return 'tube1';
          case 'skill': return 'skill1';
        }
      });

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken })
        .persist();

      pixApiCompetenceCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/competences/competence4', {
          id: 'competence4',
          index: '2.2',
          areaId: 'area2',
          skillIds: [],
          thematicIds: ['thematic1'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Quatrième compétence',
            en: 'Fourth competence'
          },
          'description_i18n': {
            fr: 'C’est la quatrième',
            en: 'It’s the fourth one'
          }
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);

      pixApiThematicCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/thematics/thematic1', {
          id: 'thematic1',
          name_i18n: {
            fr: 'workbench_2_2',
            en: null,
          },
          index: 0,
          competenceId: 'competence4',
          tubeIds: [],
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
    });

    afterEach(async () => {
      await knex('translations').truncate();
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/competences',
          payload:  {
            data: {
              type: 'competences',
              attributes: {
                title: 'Quatrième compétence',
              },
              relationships: {
                area: {
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

    describe('when user is NOT admin', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/competences',
          payload:  {
            data: {
              type: 'competences',
              attributes: {
                title: 'Quatrième compétence',
              },
              relationships: {
                area: {
                  data: {
                    type: 'areas',
                    id: 'recArea2',
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

    it.fails('should respond with status 201 and created competence', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/competences',
        payload:  {
          data: {
            type: 'competences',
            attributes: {
              title: 'Quatrième compétence',
              'title-en': 'Fourth competence',
              description: 'C’est la quatrième',
              'description-en': 'It’s the fourth one',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recArea2',
                },
              },
            },
          },
        },
        headers: generateAuthorizationHeader(adminUser),
      });

      // then
      expect(response.statusCode).toBe(201);

      expect(response.result).toEqual({
        data: {
          type: 'competences',
          id: 'recCompetence4',
          attributes: {
            'pix-id': 'competence4',
            code: '2.2',
            title: 'Quatrième compétence',
            'title-en': 'Fourth competence',
            description: 'C’est la quatrième',
            'description-en': 'It’s the fourth one',
            source: 'Pix',
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'recArea2',
              },
            },
            'raw-themes': {
              data: [
                { id: 'recThematic1', type: 'themes' },
              ],
            },
            'raw-tubes': {
              data: [
                { id: 'recTube1', type: 'tubes' },
              ],
            },
          },
        },
      });

      expect(generateNewId).toHaveBeenCalledWith('competence');
      expect(generateNewId).toHaveBeenCalledWith('thematic');
      expect(generateNewId).toHaveBeenCalledWith('tube');
      expect(generateNewId).toHaveBeenCalledWith('skill');

      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([
        { key: 'competence.competence4.description', locale: 'en', value: 'It’s the fourth one' },
        { key: 'competence.competence4.description', locale: 'fr', value: 'C’est la quatrième' },
        { key: 'competence.competence4.name', locale: 'en', value: 'Fourth competence' },
        { key: 'competence.competence4.name', locale: 'fr', value: 'Quatrième compétence' },
        { key: 'thematic.thematic1.name', locale: 'fr', value: 'workbench_2_2' },
        { key: 'tube.tube1.practicalTitle', locale: 'fr', value: 'Tube pour l\'atelier de la compétence 2.2 Pix' },
      ]);

      expect(airtableAreaScope.isDone()).toBe(true);
      expect(airtableCompetencesScope.isDone()).toBe(true);
      expect(airtableCreateCompetenceScope.isDone()).toBe(true);
      expect(airtableCreateThematicScope.isDone()).toBe(true);
      expect(airtableCreateTubeScope.isDone()).toBe(true);
      expect(airtableCreateSkillScope.isDone()).toBe(true);
      expect(pixApiCompetenceCacheScope.isDone()).toBe(true);
      expect(pixApiThematicCacheScope.isDone()).toBe(true);
    });
  });

  describe('PATCH /competences/{id}', async () => {
    let airtableCompetence, airtableCompetenceScope, pixApiCacheScope;

    beforeEach(async () => {
      airtableCompetence = airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
        id: 'competence4',
        airtableId: 'recCompetence4',
        index: '2.2',
        areaId: 'area2',
        areaAirtableId: 'recArea2',
        origin: 'Pix',
        thematicIds: ['thematic9'],
        thematicAirtableIds: ['recThematic9'],
        tubeAirtableIds: ['recTube8', 'recTube9'],
        skillIds: ['skill7', 'skill8', 'skill8'],
      }));

      airtableCompetenceScope = nock('https://api.airtable.com')
        .get(`/v0/airtableBaseValue/Competences/${airtableCompetence.id}`)
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableCompetence);

      databaseBuilder.factory.buildTranslation({ key: 'competence.competence4.name', locale: 'fr', value: 'Quatrième compétence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence4.name', locale: 'en', value: 'Fourth competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence4.description', locale: 'fr', value: 'C’est la quatrième' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence4.description', locale: 'en', value: 'It’s the fourth one' });

      await databaseBuilder.commit();

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken });
      pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/competences/competence4', {
          id: 'competence4',
          index: '2.2',
          areaId: 'area2',
          skillIds: ['skill7', 'skill8', 'skill8'],
          thematicIds: ['thematic9'],
          origin: 'Pix',
          name_i18n: {
            fr: '4ème compétence',
            en: '4th competence',
          },
          'description_i18n': {
            fr: 'C’est la 4ème',
            en: null,
          }
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/competences/${airtableCompetence.id}`,
          payload:  {
            data: {
              type: 'competences',
              attributes: {
                'title': 1234,
              },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when user is NOT admin', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/competences/${airtableCompetence.id}`,
          payload: {
            data: {
              type: 'competences',
              id: 'recCompetence4',
              attributes: {
                'pix-id': 'competence4',
                code: '2.2',
                title: '4ème compétence',
                'title-en': '4th competence',
                description: 'C’est la 4ème',
                'description-en': 'It’s the 4th one',
                source: 'Pix',
              },
              relationships: {
                area: {
                  data: {
                    type: 'areas',
                    id: 'recArea2',
                  },
                },
                'raw-themes': {
                  data: [
                    {
                      type: 'themes',
                      id: 'recThematic9',
                    },
                  ],
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'recTube8',
                    },
                    {
                      type: 'tubes',
                      id: 'recTube9',
                    },
                  ],
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

    describe('when competence is unknown', () => {
      it('should respond with status 404', async () => {
        // given
        const airtableUnknownCompetenceScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Competences/recCompetence404')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/competences/recCompetence404',
          payload: {
            data: {
              type: 'competences',
              id: 'recCompetence404',
              attributes: {
                'pix-id': 'competence404',
                code: '2.2',
                title: '4ème compétence',
                'title-en': '4th competence',
                description: 'C’est la 4ème',
                'description-en': 'It’s the 4th one',
                source: 'Pix',
              },
              relationships: {
                area: {
                  data: {
                    type: 'areas',
                    id: 'recArea2',
                  },
                },
                'raw-themes': {
                  data: [
                    {
                      type: 'themes',
                      id: 'recThematic9',
                    },
                  ],
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'recTube8',
                    },
                    {
                      type: 'tubes',
                      id: 'recTube9',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(404);

        expect(airtableUnknownCompetenceScope.isDone()).toBe(true);
      });
    });

    it('should respond with status 200 and updated competence', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/competences/${airtableCompetence.id}`,
        payload: {
          data: {
            type: 'competences',
            id: 'recCompetence4',
            attributes: {
              'pix-id': 'competence4',
              code: '2.2',
              title: '4ème compétence',
              'title-en': '4th competence',
              description: 'C’est la 4ème',
              'description-en': null,
              source: 'Pix',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recArea2',
                },
              },
              'raw-themes': {
                data: [
                  {
                    type: 'themes',
                    id: 'recThematic9',
                  },
                ],
              },
              'raw-tubes': {
                data: [
                  {
                    type: 'tubes',
                    id: 'recTube8',
                  },
                  {
                    type: 'tubes',
                    id: 'recTube9',
                  },
                ],
              },
            },
          },
        },
        headers: generateAuthorizationHeader(adminUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: {
          type: 'competences',
          id: 'recCompetence4',
          attributes: {
            'pix-id': 'competence4',
            code: '2.2',
            title: '4ème compétence',
            'title-en': '4th competence',
            description: 'C’est la 4ème',
            'description-en': null,
            source: 'Pix',
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'recArea2',
              },
            },
            'raw-themes': {
              data: [
                {
                  type: 'themes',
                  id: 'recThematic9',
                },
              ],
            },
            'raw-tubes': {
              data: [
                {
                  type: 'tubes',
                  id: 'recTube8',
                },
                {
                  type: 'tubes',
                  id: 'recTube9',
                },
              ],
            },
          },
        },
      });

      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([
        { key: 'competence.competence4.description', locale: 'fr', value: 'C’est la 4ème' },
        { key: 'competence.competence4.name', locale: 'en', value: '4th competence' },
        { key: 'competence.competence4.name', locale: 'fr', value: '4ème compétence' },
      ]);

      expect(airtableCompetenceScope.isDone()).toBe(true);
      expect(pixApiCacheScope.isDone()).toBe(true);
    });
  });
});
