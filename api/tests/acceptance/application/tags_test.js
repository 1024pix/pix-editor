import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';
import { tagDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';

describe('Application | Route | Tags', () => {
  let editorUser, readonlyUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  describe('POST /api/tags', async () => {
    let airtableCreateTagScope, airtableSearchTagsScope;

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
              attributes: { title: 'Internet' },
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
          url: '/api/tags',
          payload: {
            data: {
              type: 'tags',
              attributes: { titlee: 'Internet' },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('when tag title already taken', function() {
      it('should respond with status 409', async () => {
        // given
        databaseBuilder.factory.buildTag({ id: 'tagId1', title: 'Fruits' });
        await databaseBuilder.commit();

        const airtableTags = [airtableBuilder.factory.buildTag({ id: 'tagId1', airtableId: 'tagAirtableId1', title: 'Fruits' })];
        airtableSearchTagsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tags')
          .query({
            filterByFormula: '"fruits" = LOWER(Nom)',
            fields: { '': tagDatasource.usedFields },
            sort: [{ field: 'Nom', direction: 'asc' }],
            maxRecords: 1,
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
              attributes: { title: 'FRUITS' },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(409);
        expect(airtableSearchTagsScope.isDone()).toBe(true);
      });
    });

    context('success', function() {
      it('should respond with status 201 and created tag', async () => {
        // given
        airtableSearchTagsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tags')
          .query({
            filterByFormula: '"internet" = LOWER(Nom)',
            fields: { '': tagDatasource.usedFields },
            sort: [{ field: 'Nom', direction: 'asc' }],
            maxRecords: 1,
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [] });
        const generateNewId = vi.spyOn(idGenerator, 'generateNewId');
        generateNewId.mockReturnValue('tagId2');
        const createdAirtableTag = airtableBuilder.factory.buildTag({
          id: 'tagId2',
          airtableId: 'tagAirtableId2',
          title: 'Internet',
        });
        airtableCreateTagScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tags/', {
            records: [
              {
                fields: {
                  'id persistant': 'tagId2',
                  Nom: 'Internet',
                },
              },
            ],
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
              attributes: { title: 'Internet' },
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
              title: 'Internet',
            },
          },
        });

        expect(airtableSearchTagsScope.isDone()).toBe(true);
        expect(airtableCreateTagScope.isDone()).toBe(true);
        await expect(knex('tutorial_tags').select().first()).resolves.toEqual({
          id: 'tagId2',
          title: 'Internet',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
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
        databaseBuilder.factory.buildTag({
          id: 'tagId1',
          title: 'Fruits',
        });
        await databaseBuilder.commit();
        const airtableTag = airtableBuilder.factory.buildTag({
          id: 'tagId1',
          airtableId: 'tagAirtableId1',
          title: 'Fruits',
        });
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
              title: 'Fruits',
            },
          },
        });

        expect(airtableGetTagScope.isDone()).toBe(true);
      });
    });
  });

  describe('GET /api/tags', async () => {
    let airtableSearchTagsScope;

    context('when query param is not formatted correctly', function() {
      it('should respond with status 400', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tags?filter[titleee]=coucou',
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('success', function() {
      context('when searching by titles', function() {
        it('should respond with status 200 and related tags, limited by 4 tags and sorted by title', async () => {
          // given
          databaseBuilder.factory.buildTag({ id: 'tagId3', title: 'france' });
          databaseBuilder.factory.buildTag({ id: 'tagId4', title: 'freT' });
          databaseBuilder.factory.buildTag({ id: 'tagId2', title: 'frontieRe' });
          databaseBuilder.factory.buildTag({ id: 'tagId1', title: 'ééééfréééé' });
          databaseBuilder.factory.buildTag({ id: 'tagId5', title: 'FR' });
          await databaseBuilder.commit();

          const airtableTags = [
            airtableBuilder.factory.buildTag({ id: 'tagId1', airtableId: 'tagAirtableId1', title: 'ééééfréééé' }),
            airtableBuilder.factory.buildTag({ id: 'tagId5', airtableId: 'tagAirtableId5', title: 'FR' }),
            airtableBuilder.factory.buildTag({ id: 'tagId3', airtableId: 'tagAirtableId3', title: 'france' }),
            airtableBuilder.factory.buildTag({ id: 'tagId4', airtableId: 'tagAirtableId4', title: 'freT' }),
          ];
          airtableSearchTagsScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Tags')
            .query({
              filterByFormula: 'FIND("fr", LOWER(Nom))',
              fields: { '': tagDatasource.usedFields },
              sort: [{ field: 'Nom', direction: 'asc' }],
              maxRecords: 4,
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, { records: airtableTags });
          const server = await createServer();

          // when
          const response = await server.inject({
            method: 'GET',
            url: '/api/tags?filter[title]=fr',
            headers: generateAuthorizationHeader(editorUser),
          });

          // then
          expect(response.statusCode).toBe(200);
          expect(response.result).toEqual({
            data: [
              {
                type: 'tags',
                id: 'tagAirtableId1',
                attributes: {
                  'pix-id': 'tagId1',
                  title: 'ééééfréééé',
                },
              },
              {
                type: 'tags',
                id: 'tagAirtableId5',
                attributes: {
                  'pix-id': 'tagId5',
                  title: 'FR',
                },
              },
              {
                type: 'tags',
                id: 'tagAirtableId3',
                attributes: {
                  'pix-id': 'tagId3',
                  title: 'france',
                },
              },
              {
                type: 'tags',
                id: 'tagAirtableId4',
                attributes: {
                  'pix-id': 'tagId4',
                  title: 'freT',
                },
              },
            ],
          });
          expect(airtableSearchTagsScope.isDone()).toBe(true);
        });
      });

      context('when searching by ids', function() {
        it('should respond with status 200 and related tags', async () => {
          // given
          databaseBuilder.factory.buildTag({ id: 'tagId3', title: 'france' });
          databaseBuilder.factory.buildTag({ id: 'tagId4', title: 'freT' });
          databaseBuilder.factory.buildTag({ id: 'tagId2', title: 'frontieRe' });
          await databaseBuilder.commit();

          const airtableTags = [
            airtableBuilder.factory.buildTag({ id: 'tagId3', airtableId: 'tagAirtableId3', title: 'france' }),
            airtableBuilder.factory.buildTag({ id: 'tagId4', airtableId: 'tagAirtableId4', title: 'freT' }),
            airtableBuilder.factory.buildTag({ id: 'tagId2', airtableId: 'tagAirtableId2', title: 'frontieRe' }),
          ];
          airtableSearchTagsScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Tags')
            .query({
              filterByFormula: 'OR(RECORD_ID() = "tagId3", RECORD_ID() = "tagId4", RECORD_ID() = "tagId2")',
              fields: { '': tagDatasource.usedFields },
              sort: [{ field: tagDatasource.sortField, direction: 'asc' }],
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, { records: airtableTags });
          const server = await createServer();

          // when
          const response = await server.inject({
            method: 'GET',
            url: '/api/tags?filter[ids][]=tagId3&filter[ids][]=tagId4&filter[ids][]=tagId2',
            headers: generateAuthorizationHeader(editorUser),
          });

          // then
          expect(response.statusCode).toBe(200);
          expect(response.result).toEqual({
            data: [
              {
                type: 'tags',
                id: 'tagAirtableId3',
                attributes: {
                  'pix-id': 'tagId3',
                  title: 'france',
                },
              },
              {
                type: 'tags',
                id: 'tagAirtableId4',
                attributes: {
                  'pix-id': 'tagId4',
                  title: 'freT',
                },
              },
              {
                type: 'tags',
                id: 'tagAirtableId2',
                attributes: {
                  'pix-id': 'tagId2',
                  title: 'frontieRe',
                },
              },
            ],
          });
          expect(airtableSearchTagsScope.isDone()).toBe(true);
        });
      });
    });
  });
});
