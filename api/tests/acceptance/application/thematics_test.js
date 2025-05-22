import {  beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import _ from 'lodash';

import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';

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
});
