import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';

import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';

describe('Application | Route | Tags', () => {
  let editorUser, readonlyUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  describe('POST /api/tags', async () => {
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
      });
    });

    context('success', function() {
      it('should respond with status 201 and created tag', async () => {
        // given
        vi.spyOn(idGenerator, 'generateNewId').mockReturnValue('tagId2');
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
            id: 'tagId2',
            attributes: {
              'pix-id': 'tagId2',
              title: 'Internet',
            },
          },
        });

        await expect(knex('tutorial_tags').select().first()).resolves.toEqual({
          id: 'tagId2',
          title: 'Internet',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });

  describe('GET /api/tags/{tagId}', async () => {
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
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tags/tagId1',
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
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tags/tagId1',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);
        expect(response.result).toEqual({
          data: {
            type: 'tags',
            id: 'tagId1',
            attributes: {
              'pix-id': 'tagId1',
              title: 'Fruits',
            },
          },
        });
      });
    });
  });

  describe('GET /api/tags', async () => {
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
                id: 'tagId1',
                attributes: {
                  'pix-id': 'tagId1',
                  title: 'ééééfréééé',
                },
              },
              {
                type: 'tags',
                id: 'tagId5',
                attributes: {
                  'pix-id': 'tagId5',
                  title: 'FR',
                },
              },
              {
                type: 'tags',
                id: 'tagId3',
                attributes: {
                  'pix-id': 'tagId3',
                  title: 'france',
                },
              },
              {
                type: 'tags',
                id: 'tagId4',
                attributes: {
                  'pix-id': 'tagId4',
                  title: 'freT',
                },
              },
            ],
          });
        });
      });

      context('when searching by ids', function() {
        it('should respond with status 200 and related tags', async () => {
          // given
          databaseBuilder.factory.buildTag({ id: 'tagId3', title: 'france' });
          databaseBuilder.factory.buildTag({ id: 'tagId4', title: 'freT' });
          databaseBuilder.factory.buildTag({ id: 'tagId2', title: 'frontieRe' });
          await databaseBuilder.commit();

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
                id: 'tagId2',
                attributes: {
                  'pix-id': 'tagId2',
                  title: 'frontieRe',
                },
              },
              {
                type: 'tags',
                id: 'tagId3',
                attributes: {
                  'pix-id': 'tagId3',
                  title: 'france',
                },
              },
              {
                type: 'tags',
                id: 'tagId4',
                attributes: {
                  'pix-id': 'tagId4',
                  title: 'freT',
                },
              },
            ],
          });
        });
      });
    });
  });
});
