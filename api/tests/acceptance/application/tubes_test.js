import {  beforeEach, describe, describe as context, expect, it, afterEach, vi } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { tubeDatasource } from '../../../lib/infrastructure/datasources/airtable/tube-datasource.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';

describe('Application | Route | Tubes', () => {
  let editorUser, readonlyUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/tubes/{tubeAirtableId}', () => {
    let airtableTubeScope;

    context('when provided id has not the right format', function() {
      it('should respond with a status 400', async function() {
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tubes/zouloulou',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('when tube does not exist', function() {
      it('should respond with a status 404', async function() {
        const server = await createServer();
        airtableTubeScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tubes/recTube1')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tubes/recTube1',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
        expect(airtableTubeScope.isDone()).toBe(true);
      });
    });

    it('should respond with status 200 and tube data', async () => {
      // given
      const airtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
        id: 'tube1',
        airtableId: 'recTube1',
        name: '@test',
        index: 1,
        competenceAirtableId: 'recCompetence1',
        thematicAirtableId: 'recThematic1',
        skillAirtableIds: ['recSkill1', 'recSkill2'],
      }));

      airtableTubeScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tubes/recTube1')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableTube);

      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'fr', value: 'Titre du tube' });
      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'en', value: 'Tube’s title' });
      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'fr', value: 'Description du tube' });
      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'en', value: 'Tube’s description' });

      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/tubes/recTube1',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({
        data: {
          type: 'tubes',
          id: 'recTube1',
          attributes: {
            'pix-id': 'tube1',
            name: '@test',
            index: 1,
            'practical-title-fr': 'Titre du tube',
            'practical-title-en': 'Tube’s title',
            'practical-description-fr': 'Description du tube',
            'practical-description-en': 'Tube’s description',
          },
          relationships: {
            'competence': {
              data: {
                id: 'recCompetence1',
                type: 'competences',
              },
            },
            'theme': {
              data: {
                id: 'recThematic1',
                type: 'themes',
              },
            },
            'raw-skills': {
              data: [
                {
                  id: 'recSkill1',
                  type: 'skills',
                },
                {
                  id: 'recSkill2',
                  type: 'skills',
                },
              ],
            },
          }
        },
      });
      expect(airtableTubeScope.isDone()).toBe(true);
    });
  });

  describe('GET /api/tubes', () => {
    describe('when using no filters', () => {
      it('should respond with status 200 and tubes data', async () => {
        // given
        const airtableTubes = [
          airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
            id: 'tube1',
            airtableId: 'recTube1',
            name: '@test',
            index: 1,
            competenceAirtableId: 'recCompetence1',
            thematicAirtableId: 'recThematic1',
            skillAirtableIds: ['recSkill1', 'recSkill2'],
          })),
          airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
            id: 'tube2',
            airtableId: 'recTube2',
            name: '@pouet',
            index: 2,
            competenceAirtableId: 'recCompetence2',
            thematicAirtableId: 'recThematic2',
            skillAirtableIds: ['recSkill3', 'recSkill4'],
          })),
        ];

        const airtableTubesScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tubes')
          .query({
            fields: { '': tubeDatasource.usedFields },
            sort: [{ field: tubeDatasource.sortField, direction: 'asc' }]
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableTubes });

        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'fr', value: 'Titre premier tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'en', value: 'First tube’s title' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'fr', value: 'Description premier tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'en', value: 'First tube’s description' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube2.practicalTitle', locale: 'fr', value: 'Titre deuxième tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube2.practicalTitle', locale: 'en', value: 'Second tube’s title' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube2.practicalDescription', locale: 'fr', value: 'Description deuxième tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube2.practicalDescription', locale: 'en', value: 'Second tube’s description' });

        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tubes',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'tubes',
              id: 'recTube1',
              attributes: {
                'pix-id': 'tube1',
                name: '@test',
                'practical-title-fr': 'Titre premier tube',
                'practical-title-en': 'First tube’s title',
                'practical-description-fr': 'Description premier tube',
                'practical-description-en': 'First tube’s description',
                index: 1,
              },
              relationships: {
                'competence': {
                  data: {
                    id: 'recCompetence1',
                    type: 'competences',
                  },
                },
                'theme': {
                  data: {
                    id: 'recThematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'recSkill1',
                      type: 'skills',
                    },
                    {
                      id: 'recSkill2',
                      type: 'skills',
                    },
                  ],
                },
              }
            },
            {
              type: 'tubes',
              id: 'recTube2',
              attributes: {
                'pix-id': 'tube2',
                name: '@pouet',
                'practical-title-fr': 'Titre deuxième tube',
                'practical-title-en': 'Second tube’s title',
                'practical-description-fr': 'Description deuxième tube',
                'practical-description-en': 'Second tube’s description',
                index: 2,
              },
              relationships: {
                'competence': {
                  data: {
                    id: 'recCompetence2',
                    type: 'competences',
                  },
                },
                'theme': {
                  data: {
                    id: 'recThematic2',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'recSkill3',
                      type: 'skills',
                    },
                    {
                      id: 'recSkill4',
                      type: 'skills',
                    },
                  ],
                },
              }
            },
          ],
        });

        expect(airtableTubesScope.isDone()).toBe(true);
      });
    });

    describe('when filtering by ids', () => {
      it('should respond with status 200 and tubes data', async () => {
        // given
        const airtableTubes = [
          airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
            id: 'tube1',
            airtableId: 'recTube1',
            name: '@test',
            index: 1,
            competenceAirtableId: 'recCompetence1',
            thematicAirtableId: 'recThematic1',
            skillAirtableIds: ['recSkill1', 'recSkill2'],
          })),
          airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
            id: 'tube2',
            airtableId: 'recTube2',
            name: '@pouet',
            index: 2,
            competenceAirtableId: 'recCompetence2',
            thematicAirtableId: 'recThematic2',
            skillAirtableIds: ['recSkill3', 'recSkill4'],
          })),
        ];

        const airtableTubesScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tubes')
          .query({
            filterByFormula: 'OR(RECORD_ID() = "recTube1", RECORD_ID() = "recTube2")',
            fields: { '': tubeDatasource.usedFields },
            sort: [{ field: tubeDatasource.sortField, direction: 'asc' }]
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableTubes });

        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'fr', value: 'Titre premier tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'en', value: 'First tube’s title' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'fr', value: 'Description premier tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'en', value: 'First tube’s description' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube2.practicalTitle', locale: 'fr', value: 'Titre deuxième tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube2.practicalTitle', locale: 'en', value: 'Second tube’s title' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube2.practicalDescription', locale: 'fr', value: 'Description deuxième tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube2.practicalDescription', locale: 'en', value: 'Second tube’s description' });

        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tubes?filter[ids][]=recTube1&filter[ids][]=recTube2',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'tubes',
              id: 'recTube1',
              attributes: {
                'pix-id': 'tube1',
                name: '@test',
                'practical-title-fr': 'Titre premier tube',
                'practical-title-en': 'First tube’s title',
                'practical-description-fr': 'Description premier tube',
                'practical-description-en': 'First tube’s description',
                index: 1,
              },
              relationships: {
                'competence': {
                  data: {
                    id: 'recCompetence1',
                    type: 'competences',
                  },
                },
                'theme': {
                  data: {
                    id: 'recThematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'recSkill1',
                      type: 'skills',
                    },
                    {
                      id: 'recSkill2',
                      type: 'skills',
                    },
                  ],
                },
              }
            },
            {
              type: 'tubes',
              id: 'recTube2',
              attributes: {
                'pix-id': 'tube2',
                name: '@pouet',
                'practical-title-fr': 'Titre deuxième tube',
                'practical-title-en': 'Second tube’s title',
                'practical-description-fr': 'Description deuxième tube',
                'practical-description-en': 'Second tube’s description',
                index: 2,
              },
              relationships: {
                'competence': {
                  data: {
                    id: 'recCompetence2',
                    type: 'competences',
                  },
                },
                'theme': {
                  data: {
                    id: 'recThematic2',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'recSkill3',
                      type: 'skills',
                    },
                    {
                      id: 'recSkill4',
                      type: 'skills',
                    },
                  ],
                },
              }
            },
          ],
        });

        expect(airtableTubesScope.isDone()).toBe(true);
      });
    });
  });

  describe('POST /api/tubes', async () => {
    let airtableCreateTubeScope, airtableThematicScope;

    context('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tubes',
          payload: {
            data: {
              type: 'tubes',
              attributes: {
                name: '@test',
                'practical-title-fr': 'Titre du tube',
                'practical-title-en': 'Tube’s title',
                'practical-description-fr': 'Description du tube',
                'practical-description-en': 'Tube’s description',
              },
              relationships: {
                'competence': {
                  data: {
                    id: 'recCompetence1',
                    type: 'competences',
                  },
                },
                'theme': {
                  data: {
                    id: 'recThematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [],
                },
              }
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
          url: '/api/tubes',
          payload: {
            data: {
              type: 'sujets',
              attributes: {
                name: '@test',
                'practical-title-fr': 'Titre du tube',
                'practical-title-en': 'Tube’s title',
                'practical-description-fr': 'Description du tube',
                'practical-description-en': 'Tube’s description',
              },
              relationships: {
                'competence': {
                  data: null
                },
                'theme': {
                  data: {
                    id: 'recThematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [],
                },
              }
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
        const airtableThematic = airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({
          id: 'thematic1',
          airtableId: 'recThematic1',
          competenceAirtableId: 'recCompetence1',
          tubeAirtableIds: ['recTube1', 'recTube2'],
        }));

        airtableThematicScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Thematiques/recThematic1')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableThematic);

        const createdAirtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
          id: 'tube3',
          airtableId: 'recTube3',
          name: '@pouic',
          index: 2,
          competenceAirtableId: 'recCompetence1',
          competenceId: 'competence1',
          thematicAirtableId: 'recThematic1',
          skillAirtableIds: [],
          skillIds: [],
        }));

        airtableCreateTubeScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tubes/', {
            records: [{
              fields: {
                'id persistant': 'tube3',
                'Nom': '@pouic',
                'Index': 2,
                'Competences': ['recCompetence1'],
                'Thematique': ['recThematic1'],
              },
            }],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [createdAirtableTube] });

        vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('tube3');
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
          url: '/api/tubes',
          payload: {
            data: {
              type: 'tubes',
              attributes: {
                'name': '@pouic',
                'practical-title-fr': 'Titre troisième tube',
                'practical-title-en': 'Third tube’s title',
                'practical-description-fr': 'Description troisième tube',
                'practical-description-en': 'Third tube’s description',
              },
              relationships: {
                'competence': {
                  data: null,
                },
                'theme': {
                  data: {
                    type: 'themes',
                    id: 'recThematic1',
                  },
                },
                'raw-skills': {
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
            type: 'tubes',
            id: 'recTube3',
            attributes: {
              'pix-id': 'tube3',
              'name': '@pouic',
              'practical-title-fr': 'Titre troisième tube',
              'practical-title-en': 'Third tube’s title',
              'practical-description-fr': 'Description troisième tube',
              'practical-description-en': 'Third tube’s description',
              'index': 2,
            },
            relationships: {
              competence: {
                data: {
                  id: 'recCompetence1',
                  type: 'competences'
                }
              },
              'theme': {
                data: {
                  type: 'themes',
                  id: 'recThematic1',
                },
              },
              'raw-skills': {
                data: [],
              },
            },
          },
        });

        expect(airtableCreateTubeScope.isDone()).toBe(true);
        expect(airtableThematicScope.isDone()).toBe(true);

        await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([
          { key: 'tube.tube3.practicalDescription', locale: 'en', value: 'Third tube’s description' },
          { key: 'tube.tube3.practicalDescription', locale: 'fr', value: 'Description troisième tube' },
          { key: 'tube.tube3.practicalTitle', locale: 'en', value: 'Third tube’s title' },
          { key: 'tube.tube3.practicalTitle', locale: 'fr', value: 'Titre troisième tube' },
        ]);
      });
    });
  });

  describe('PATCH /api/tubes/{tubeAirtableId}', async () => {
    let airtableUpdateTubeScope, airtableTubeScope;

    context('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tubes/recTube1',
          payload: {
            data: {
              type: 'tubes',
              id: 'recTube1',
              attributes: {
                name: '@test',
                index: 2,
                'practical-title-fr': 'Titre du tube',
                'practical-title-en': 'Tube’s title',
                'practical-description-fr': 'Description du tube',
                'practical-description-en': 'Tube’s description',
              },
              relationships: {
                'competence': {
                  data: {
                    id: 'recCompetence1',
                    type: 'competences',
                  },
                },
                'theme': {
                  data: {
                    id: 'recThematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'recSkill1',
                      type: 'skills',
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
          url: '/api/tubes/recTube1',
          payload: {
            data: {
              type: 'sujets',
              id: 'recTube1',
              attributes: {
                name: '@test',
                index: 2,
                'practical-title-fr': 'Titre du tube',
                'practical-title-en': 'Tube’s title',
                'practical-description-fr': 'Description du tube',
                'practical-description-en': 'Tube’s description',
              },
              relationships: {
                'competence': {
                  data: {
                    id: 'recCompetence1',
                    type: 'competences',
                  },
                },
                'theme': {
                  data: {
                    id: 'recThematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'recSkill1',
                      type: 'skills',
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

    context('success', function() {
      beforeEach(async () => {
        const airtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
          id: 'tube1',
          airtableId: 'recTube1',
          name: '@test',
          index: 1,
          competenceAirtableId: 'recCompetence1',
          thematicAirtableId: 'recThematic1',
          skillAirtableIds: ['recSkill1', 'recSkill2'],
        }));

        airtableTubeScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tubes/recTube1')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableTube);

        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'fr', value: 'Titre du tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'en', value: 'Tube’s title' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'fr', value: 'Description du tube' });
        databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'en', value: 'Tube’s description' });

        await databaseBuilder.commit();

        const updatedAirtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
          id: 'tube1',
          airtableId: 'recTube1',
          name: '@pouet',
          index: 2,
          competenceAirtableId: 'recCompetence1',
          competenceId: 'competence1',
          thematicAirtableId: 'recThematic1',
          skillAirtableIds: ['recSkill1', 'recSkill2'],
          skillIds: ['skill1', 'skill2'],
        }));

        airtableUpdateTubeScope = nock('https://api.airtable.com')
          .patch('/v0/airtableBaseValue/Tubes/', {
            records: [{
              fields: {
                'id persistant': 'tube1',
                'Nom': '@pouet',
                'Index': 2,
                'Competences': ['recCompetence1'],
                'Thematique': ['recThematic1'],
              },
              id: 'recTube1',
            }],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [updatedAirtableTube] });
      });

      it.fails('should respond with status 200 and updated tube', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tubes/recTube1',
          payload: {
            data: {
              type: 'tubes',
              id: 'recTube1',
              attributes: {
                'pix-id': 'tube1',
                'name': '@pouet',
                'index': 2,
                'practical-title-fr': 'Titre tube après',
                'practical-title-en': 'Tube’s title after',
                'practical-description-fr': 'Description tube après',
                'practical-description-en': 'Tube’s description after',
              },
              relationships: {
                'competence': {
                  data: {
                    type: 'competences',
                    id: 'recCompetence1',
                  },
                },
                'theme': {
                  data: {
                    type: 'themes',
                    id: 'recThematic1',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      type: 'skills',
                      id: 'recSkill1',
                    },
                    {
                      type: 'skills',
                      id: 'recSkill2',
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
            type: 'tubes',
            id: 'recTube1',
            attributes: {
              'pix-id': 'tube1',
              'name': '@pouet',
              'index': 2,
              'practical-title-fr': 'Titre tube après',
              'practical-title-en': 'Tube’s title after',
              'practical-description-fr': 'Description tube après',
              'practical-description-en': 'Tube’s description after',
            },
            relationships: {
              'competence': {
                data: {
                  type: 'competences',
                  id: 'recCompetence1',
                },
              },
              'theme': {
                data: {
                  type: 'themes',
                  id: 'recThematic1',
                },
              },
              'raw-skills': {
                data: [
                  {
                    type: 'skills',
                    id: 'recSkill1',
                  },
                  {
                    type: 'skills',
                    id: 'recSkill2',
                  },
                ],
              },
            },
          },
        });

        expect(airtableUpdateTubeScope.isDone()).toBe(true);
        expect(airtableTubeScope.isDone()).toBe(true);

        await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([
          { key: 'tube.tube1.practicalDescription', locale: 'en', value: 'Tube’s description after' },
          { key: 'tube.tube1.practicalDescription', locale: 'fr', value: 'Description tube après' },
          { key: 'tube.tube1.practicalTitle', locale: 'en', value: 'Tube’s title after' },
          { key: 'tube.tube1.practicalTitle', locale: 'fr', value: 'Titre tube après' },
        ]);
      });
    });
  });
});
