import { beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import { airtableBuilder, databaseBuilder, generateAuthorizationHeader, } from '../../test-helper.js';
import { createServer } from '../../../server.js';
// import { tagDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js'; // Not directly used in this test file after refactor
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js'; // Still needed for spyOn if we were to keep it
// import { Tag } from '../../../lib/domain/models/Tag.js'; // Not directly used in this test file

describe('Acceptance | Route | /api/tags', () => {
  let editorUser, readUser;

  beforeEach(async () => {
    vi.restoreAllMocks();
    editorUser = databaseBuilder.factory.buildEditorUser();
    readUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  describe('POST /api/tags', () => {
    describe('when user is NOT admin', () => {
      it('should respond with status 403 Forbidden', async () => {
        const server = await createServer();
        const response = await server.inject({
          method: 'POST',
          url: '/api/tags',
          payload: {
            data: {
              type: 'tags',
              attributes: { title: 'Forbidden Tag' },
            },
          },
          headers: generateAuthorizationHeader(readUser),
        });
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400 Bad Request if title is missing', async () => {
        const server = await createServer();
        const response = await server.inject({
          method: 'POST',
          url: '/api/tags',
          payload: {
            data: {
              type: 'tags',
              attributes: { description: 'Tag without title' },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });
        expect(response.statusCode).toBe(400);
      });

      it('should respond with status 400 Bad Request if type is incorrect', async () => {
        const server = await createServer();
        const response = await server.inject({
          method: 'POST',
          url: '/api/tags',
          payload: {
            data: {
              type: 'wrong-type',
              attributes: { title: 'Tag with wrong type' },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when user is admin and payload is valid', () => {
      it('should respond with status 201 Created and the created tag', async () => {
        vi.spyOn(idGenerator, 'generateNewId').mockReturnValue('tagGeneratedId1');
        const airtableRawTag = airtableBuilder.factory.buildTag({ id: 'tagGeneratedId1', airtableId: 'recGeneratedTagAirtableId', skillAirtableId: 'recSkillForTag', tutorialAirtableIds: ['recTutorialForTag1', 'recTutorialForTag2'], title: 'My New Awesome Tag', description: 'A description for the new tag', notes: 'Some notes' });

        const airtableCreateScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tags/', {
            records: [{
              fields: {
                'id persistant': 'tagGeneratedId1',
                'Nom': 'My New Awesome Tag',
                'Description': 'A description for the new tag',
                'Notes': 'Some notes',
                'Acquis': ['recSkillForTag'],
                'Tutoriels':['recTutorialForTag1', 'recTutorialForTag2'],
              },
            }],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, {
            records: [airtableRawTag],
          });

        const server = await createServer();
        const requestPayload = {
          data: {
            type: 'tags',
            attributes: {
              title: 'My New Awesome Tag',
              description: 'A description for the new tag',
              notes: 'Some notes',
            },
            relationships: {
              skills: {
                data: { type: 'skills', id: 'recSkillForTag' },
              },
              tutorials: {
                data: [
                  { type: 'tutorials', id: 'recTutorialForTag1' },
                  { type: 'tutorials', id: 'recTutorialForTag2' },
                ],
              },
            },
          },
        };

        const response = await server.inject({
          method: 'POST',
          url: '/api/tags',
          payload: requestPayload,
          headers: generateAuthorizationHeader(editorUser),
        });

        expect(response.statusCode).toBe(201);
        expect(airtableCreateScope.isDone()).toBe(true, 'Airtable POST /Tags was not called or matched');

        const expectedResponse = {
          data: {
            type: 'tags',
            id: 'recGeneratedTagAirtableId',
            attributes: {
              title: 'My New Awesome Tag',
              description: 'A description for the new tag',
              notes: 'Some notes',
            },
            relationships: {
              skills: {
                data: { type: 'skills', id: 'recSkillForTag' },
              },
              tutorials: {
                data: [
                  { type: 'tutorials', id: 'recTutorialForTag1' },
                  { type: 'tutorials', id: 'recTutorialForTag2' },
                ],
              },
            },
          },
        };
        expect(response.result).toStrictEqual(expectedResponse);
      });
    });
  });
});
