import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as config from '../../../lib/config.js';

const TABLE_NAME = 'frameworks';

describe('Acceptance | Route | frameworks', () => {
  let editorUser, adminUser, originalPixApiUrlValue;

  beforeEach(async function() {
    originalPixApiUrlValue = config.pixApi.baseUrl;
    delete config.pixApi.baseUrl;
    editorUser = databaseBuilder.factory.buildEditorUser();
    adminUser = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  afterEach(function() {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('GET /frameworks', () => {
    beforeEach(async () => {
      databaseBuilder.factory.buildFramework({ id: 'framework1', name: 'Pix', createdAt: '20250905T07:20:00Z' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'framework1' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'framework1' });
      databaseBuilder.factory.buildFramework({ id: 'framework2', name: 'Paix', createdAt: '20250905T07:22:00Z' });
      databaseBuilder.factory.buildArea({ id: 'area3', code: '3', frameworkId: 'framework2' });
      databaseBuilder.factory.buildArea({ id: 'area4', code: '4', frameworkId: 'framework2' });
      databaseBuilder.factory.buildArea({ id: 'area5', code: '5', frameworkId: 'framework2' });
      databaseBuilder.factory.buildFramework({ id: 'framework3', name: 'Poux', createdAt: '20250905T07:21:00Z' });
      databaseBuilder.factory.buildArea({ id: 'area6', code: '6', frameworkId: 'framework3' });
      databaseBuilder.factory.buildArea({ id: 'area7', code: '7', frameworkId: 'framework3' });
      databaseBuilder.factory.buildArea({ id: 'area8', code: '8', frameworkId: 'framework3' });
      databaseBuilder.factory.buildFramework({ id: 'framework4', name: 'Prix', createdAt: '20250905T07:23:00Z' });
      await databaseBuilder.commit();
    });

    it('should respond with status 200 and frameworks', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/frameworks',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: [
          {
            type: 'frameworks',
            id: 'framework1',
            attributes: { name: 'Pix' },
            relationships: { areas: { data: [{ id: 'area1', type: 'areas' }, { id: 'area2', type: 'areas' }] } },
          },
          {
            type: 'frameworks',
            id: 'framework3',
            attributes: { name: 'Poux' },
            relationships: {
              areas: {
                data: [
                  { id: 'area6', type: 'areas' },
                  { id: 'area7', type: 'areas' },
                  { id: 'area8', type: 'areas' },
                ],
              },
            },
          },
          {
            type: 'frameworks',
            id: 'framework2',
            attributes: { name: 'Paix' },
            relationships: {
              areas: {
                data: [
                  { id: 'area3', type: 'areas' },
                  { id: 'area4', type: 'areas' },
                  { id: 'area5', type: 'areas' },
                ],
              },
            },
          },
          {
            type: 'frameworks',
            id: 'framework4',
            attributes: { name: 'Prix' },
            relationships: { areas: { data: [] } },
          },
        ],
      });
    });
  });

  describe('POST /frameworks', () => {
    describe('when user is NOT admin', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/frameworks',
          payload: {
            data: {
              type: 'frameworks',
              attributes: { name: 'Mon framework' },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/frameworks',
          payload: {
            data: {
              type: 'frameworks',
              attributes: { name: null },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    it('should respond with status 201 and created framework', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        payload: {
          data: {
            type: 'frameworks',
            attributes: { name: 'Prix' },
          },
        },
        url: '/api/frameworks',
        headers: generateAuthorizationHeader(adminUser),
      });

      // then
      expect(response.statusCode).toBe(201);
      expect(response.result).toEqual({
        data: {
          type: 'frameworks',
          id: expect.stringMatching(/^framework.+$/),
          attributes: { name: 'Prix' },
          relationships: { areas: { data: [] } },
        },
      });

      await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
        {
          id: expect.stringMatching(/^framework.+$/),
          name: 'Prix',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });
});
