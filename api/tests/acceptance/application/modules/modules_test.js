import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Module } from '../../../../lib/domain/models/index.js';

describe('Acceptance | Route | modules', () => {
  let editorUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    await databaseBuilder.commit();
  });

  describe('GET /modules', () => {
    let modules;

    beforeEach(async () => {
      modules = [
        { id: '79cc8f8d-d948-4ce5-bd35-1250b61d6011', shortId: 'abcd1234', internalTitle: 'MOD_a', slug: 'a', isBeta: true, visibility: Module.VISIBILITIES.PRIVATE, details: { level: Module.LEVELS.NOVICE } },
        { id: '6e7f16ae-4d96-4a71-b646-d6c86029e05e', shortId: 'abcd5678', internalTitle: 'MOD_b', slug: 'b', isBeta: false, visibility: Module.VISIBILITIES.PUBLIC, details: { level: Module.LEVELS.INDEPENDENT } },
        { id: 'f995ce82-1373-4758-b839-7a844893ef07', shortId: 'abcd9012', internalTitle: 'MOD_c', slug: 'c', isBeta: false, visibility: Module.VISIBILITIES.PRIVATE, details: { level: Module.LEVELS.EXPERT } },
      ].map(domainBuilder.buildModule);

      modules.forEach((module) => {
        databaseBuilder.factory.buildModule(module);
      });

      await databaseBuilder.commit();
    });

    it('responds with status 200 and modules data', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/modules',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toStrictEqual({
        data: [
          {
            type: 'modules',
            id: modules[1].id,
            attributes: { 'internal-title': modules[1].internalTitle, 'is-beta': modules[1].isBeta, visibility: modules[1].visibility, details: modules[1].details },
          },
          {
            type: 'modules',
            id: modules[0].id,
            attributes: { 'internal-title': modules[0].internalTitle, 'is-beta': modules[0].isBeta, visibility: modules[0].visibility, details: modules[0].details },
          },
          {
            type: 'modules',
            id: modules[2].id,
            attributes: { 'internal-title': modules[2].internalTitle, 'is-beta': modules[2].isBeta, visibility: modules[2].visibility, details: modules[2].details },
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          rowCount: 3,
          pageCount: 1,
        },
      });
    });

    describe('when using pagination and sort query params', () => {
      it('responds with status 200 and modules data', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/modules?page[size]=2&page[number]=2&sort=-internalTitle',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toStrictEqual({
          data: [
            {
              type: 'modules',
              id: modules[0].id,
              attributes: { 'internal-title': modules[0].internalTitle, 'is-beta': modules[0].isBeta, visibility: modules[0].visibility, details: modules[0].details },
            },
          ],
          meta: {
            page: 2,
            pageSize: 2,
            rowCount: 3,
            pageCount: 2,
          },
        });
      });
    });
  });

  describe('GET /modules/:id', () => {
    let module;

    beforeEach(async () => {
      module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);
      await databaseBuilder.commit();
    });

    it('responds with status 200 and modules data', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/modules/${module.id}`,
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toStrictEqual({
        data: {
          type: 'modules',
          id: module.id,
          attributes: {
            'short-id': module.shortId,
            'internal-title': module.internalTitle,
            'is-beta': module.isBeta,
            visibility: module.visibility,
            details: module.details,
            slug: module.slug,
            title: module.title,
            sections: module.sections,
            glossary: module.glossary,
          },
        },
      });
    });

    describe('when module does not exist', () => {
      it('responds with status 404', async () => {
        // given
        const server = await createServer();
        const notFoundId = crypto.randomUUID();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/modules/${notFoundId}`,
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });
  });
});
