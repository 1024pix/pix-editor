import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';
import { tagDatasource } from '../../../lib/infrastructure/datasources/airtable/tag-datasource.js';

describe('Application | Route | Tags', () => {
  let editorUser, readonlyUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  describe('POST /api/tags', async () => {
    let airtableCreateTagScope, airtableListTagsScope;

    context('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tags',
          payload: {
            data: {
              type: 'tags',
              attributes: {
                'name': 'Internet',
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
          url: '/api/tags',
          payload: {
            data: {
              type: 'tags',
              attributes: {
                'nameee': 'Internet',
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('when tag name already taken', function() {
      it('should respond with status 409', async () => {
        // given
        const airtableTags = [
          airtableBuilder.factory.buildTag({ id: 'tagId1', airtableId: 'tagAirtableId1', name: 'Fruits' }),
        ];

        airtableListTagsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tags')
          .query({
            fields: { '': tagDatasource.usedFields },
            sort: [{ field: tagDatasource.sortField, direction: 'asc' }]
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableTags });
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tags',
          payload: {
            data: {
              type: 'tags',
              attributes: {
                'name': 'FRUITS',
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(409);
        expect(airtableListTagsScope.isDone()).toBe(true);
      });
    });

    context('success', function() {
      it('should respond with status 201 and created tag', async () => {
        // given
        const airtableTags = [
          airtableBuilder.factory.buildTag({ id: 'tagId1', airtableId: 'tagAirtableId1', name: 'Fruits' }),
        ];

        airtableListTagsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tags')
          .query({
            fields: { '': tagDatasource.usedFields },
            sort: [{ field: tagDatasource.sortField, direction: 'asc' }]
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableTags });
        const generateNewId = vi.spyOn(idGenerator, 'generateNewId');
        generateNewId.mockReturnValue('tagId2');
        const createdAirtableTag = airtableBuilder.factory.buildTag({ id: 'tagId2', airtableId: 'tagAirtableId2', name: 'Internet' });
        airtableCreateTagScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tags/', {
            records: [{
              fields: {
                'id persistant': 'tagId2',
                'Nom': 'Internet',
              },
            }],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [createdAirtableTag] });
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tags',
          payload: {
            data: {
              type: 'tags',
              attributes: {
                'name': 'Internet',
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(201);
        expect(response.result).toEqual({
          data: {
            type: 'tags',
            id: 'tagAirtableId2',
            attributes: {
              'pix-id': 'tagId2',
              'name': 'Internet',
            },
          },
        });

        expect(airtableListTagsScope.isDone()).toBe(true);
        expect(airtableCreateTagScope.isDone()).toBe(true);
      });
    });
  });

  describe('GET /api/tags/{tagAirtableId}', async () => {
    let airtableGetTagScope;

    context('when param is not formatted correctly', function() {
      it('should respond with status 400', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tags/autreChose',
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('when tag does not exist', function() {
      it('should respond with status 404', async () => {
        // given
        airtableGetTagScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tags/tagAirtableId1')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tags/tagAirtableId1',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    context('success', function() {
      it('should respond with status 200 and tag', async () => {
        // given
        const airtableTag = airtableBuilder.factory.buildTag({ id: 'tagId1', airtableId: 'tagAirtableId1', name: 'Fruits' });
        airtableGetTagScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tags/tagAirtableId1')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableTag);
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tags/tagAirtableId1',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);
        expect(response.result).toEqual({
          data: {
            type: 'tags',
            id: 'tagAirtableId1',
            attributes: {
              'pix-id': 'tagId1',
              'name': 'Fruits',
            },
          },
        });

        expect(airtableGetTagScope.isDone()).toBe(true);
      });
    });
  });
});
