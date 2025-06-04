import {  beforeEach, describe, describe as context, expect, it } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';

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
});
