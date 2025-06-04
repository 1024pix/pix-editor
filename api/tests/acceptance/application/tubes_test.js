import {  beforeEach, describe, describe as context, expect, it } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { tubeDatasource } from '../../../lib/infrastructure/datasources/airtable/tube-datasource.js';

describe('Application | Route | Tubes', () => {
  let editorUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
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
      it.fails('should respond with status 200 and tubes data', async () => {
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
});
