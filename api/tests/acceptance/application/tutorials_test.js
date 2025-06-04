import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';
import { Tutorial } from '../../../lib/domain/models/index.js';

describe('Application | Route | Tutorials', () => {
  let editorUser, readonlyUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  describe('POST /api/tutorials', async () => {
    let airtableCreateTutorialScope;

    context('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tutorials',
          payload: {
            data: {
              type: 'tutorials',
              attributes: {
                'title': 'mon titre',
                'duration': '12:01:02',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': Tutorial.CRUSHES.YES,
                'language': 'fr',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
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

    context('when payload is not formatted correctly', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tutorials',
          payload: {
            data: {
              type: 'tutorials',
              attributes: {
                'title': 'mon titre',
                'duration': '99:99:99',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': Tutorial.CRUSHES.YES,
                'language': 'fr',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
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
      it('should respond with status 201 and created tutorial', async () => {
        // given
        const generateNewId = vi.spyOn(idGenerator, 'generateNewId');
        generateNewId.mockReturnValue('tutorialId1');
        const createdAirtableTutorial = airtableBuilder.factory.buildTutorial({
          id: 'tutorialId1',
          airtableId: 'tutorialAirtableId1',
          title: 'mon titre',
          format: Tutorial.FORMATS.PDF,
          duration: '12:01:02',
          source: 'Mon grenier',
          link: 'https://coucou.com',
          language: 'fr',
          license: Tutorial.LICENSES.C,
          level: Tutorial.LEVELS.TWO,
          crush: Tutorial.CRUSHES.YES,
          tagAirtableIds: ['tagAirtableId1', 'tagAirtableId2'],
        });
        airtableCreateTutorialScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tutoriels/', {
            records: [{
              fields: {
                'id persistant': 'tutorialId1',
                'Durée': '12:01:02',
                'Format': Tutorial.FORMATS.PDF,
                'Lien': 'https://coucou.com',
                'Source': 'Mon grenier',
                'Titre': 'mon titre',
                'Langue': 'fr',
                'License': Tutorial.LICENSES.C,
                'niveau': Tutorial.LEVELS.TWO,
                'CoupDeCoeur': Tutorial.CRUSHES.YES,
                'Tags': ['tagAirtableId1', 'tagAirtableId2'],
              },
            }],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [createdAirtableTutorial] });
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tutorials',
          payload: {
            data: {
              type: 'tutorials',
              attributes: {
                'title': 'mon titre',
                'duration': '12:01:02',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': Tutorial.CRUSHES.YES,
                'language': 'fr',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
                    },
                  ],
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
            type: 'tutorials',
            id: 'tutorialAirtableId1',
            attributes: {
              'title': 'mon titre',
              'duration': '12:01:02',
              'source': 'Mon grenier',
              'format': Tutorial.FORMATS.PDF,
              'link': 'https://coucou.com',
              'license': Tutorial.LICENSES.C,
              'level': Tutorial.LEVELS.TWO,
              'crush': Tutorial.CRUSHES.YES,
              'language': 'fr',
              'pix-id': 'tutorialId1',
            },
            relationships: {
              tags: {
                data: [
                  {
                    type: 'tags',
                    id: 'tagAirtableId1',
                  },
                  {
                    type: 'tags',
                    id: 'tagAirtableId2',
                  },
                ],
              },
            },
          },
        });
        expect(airtableCreateTutorialScope.isDone()).toBe(true);
      });
    });
  });
});
