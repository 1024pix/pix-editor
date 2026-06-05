import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Module } from '../../../../lib/domain/models/index.js';

const uuidRegExp = /^\p{Hex_Digit}{8}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{12}$/u;
const shortIdRegExp = /^\p{Hex_Digit}{8}$/u;

describe('Acceptance | Route | draft-modules', () => {
  let editorUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    await databaseBuilder.commit();
  });

  describe('POST /draft-modules', () => {
    it('responds with status 201 and draft modules data', async () => {
      // given
      const draftModule = domainBuilder.buildDraftModule();
      const draftModulePayload = {
        slug: draftModule.slug,
        title: draftModule.title,
        'internal-title': draftModule.internalTitle,
        'is-beta': draftModule.isBeta,
        visibility: draftModule.visibility,
        details: draftModule.details,
        sections: draftModule.sections,
        glossary: draftModule.glossary,
      };

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/draft-modules',
        headers: generateAuthorizationHeader(editorUser),
        payload: {
          data: {
            type: 'draft-modules',
            attributes: draftModulePayload,
          },
        },
      });

      // then
      expect(response.statusCode).toBe(201);
      expect(response.result).toStrictEqual({
        data: {
          type: 'draft-modules',
          id: expect.stringMatching(uuidRegExp),
          attributes: {
            'short-id': expect.stringMatching(shortIdRegExp),
            ...draftModulePayload,
          },
          relationships: { module: { data: null } },
        },
      });

      await expect(knex.select('*').from('draft-modules')).resolves.toStrictEqual([
        {
          id: expect.stringMatching(uuidRegExp),
          shortId: expect.stringMatching(shortIdRegExp),
          moduleId: null,
          internalTitle: draftModule.internalTitle,
          slug: draftModule.slug,
          title: draftModule.title,
          isBeta: draftModule.isBeta,
          visibility: draftModule.visibility,
          sections: draftModule.sections,
          glossary: draftModule.glossary,
          ...draftModule.details,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('GET /draft-modules', () => {
    let draftModules;

    beforeEach(async () => {
      const { id: moduleId } = databaseBuilder.factory.buildModule(domainBuilder.buildModule());
      draftModules = [
        { id: '79cc8f8d-d948-4ce5-bd35-1250b61d6011', shortId: 'abcd1234', internalTitle: 'MOD_a', slug: 'a', details: { level: Module.LEVELS.NOVICE }, visibility: Module.VISIBILITIES.PRIVATE },
        { id: moduleId, moduleId, shortId: 'abcd5678', internalTitle: 'MOD_b', slug: 'b', details: { level: Module.LEVELS.INDEPENDENT }, visibility: Module.VISIBILITIES.PUBLIC },
        { id: 'f995ce82-1373-4758-b839-7a844893ef07', shortId: 'abcd9012', internalTitle: 'MOD_c', slug: 'c', details: { level: Module.LEVELS.EXPERT }, visibility: Module.VISIBILITIES.PRIVATE },
      ].map(domainBuilder.buildDraftModule);

      draftModules.forEach((draftModule) => {
        databaseBuilder.factory.buildDraftModule(draftModule);
      });

      await databaseBuilder.commit();
    });

    it('responds with status 200 and modules data', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/draft-modules',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: [
          {
            type: 'draft-modules',
            id: draftModules[1].id,
            attributes: { 'internal-title': draftModules[1].internalTitle, details: draftModules[1].details },
            relationships: {
              module: {
                data: {
                  id: draftModules[1].moduleId,
                  type: 'modules',
                },
              },
            },
          },
          {
            type: 'draft-modules',
            id: draftModules[0].id,
            attributes: { 'internal-title': draftModules[0].internalTitle, details: draftModules[0].details },
            relationships: { module: { data: null } },
          },
          {
            type: 'draft-modules',
            id: draftModules[2].id,
            attributes: { 'internal-title': draftModules[2].internalTitle, details: draftModules[2].details },
            relationships: { module: { data: null } },
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
          url: '/api/draft-modules?page[size]=2&page[number]=2&sort=-internalTitle',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'draft-modules',
              id: draftModules[0].id,
              attributes: { 'internal-title': draftModules[0].internalTitle, details: draftModules[0].details },
              relationships: { module: { data: null } },
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

  describe('GET /draft-modules/:id', () => {
    let draftModule;

    beforeEach(async () => {
      const { id: moduleId } = databaseBuilder.factory.buildModule(domainBuilder.buildModule());
      draftModule = domainBuilder.buildDraftModule({ id: moduleId, moduleId });
      databaseBuilder.factory.buildDraftModule(draftModule);
      await databaseBuilder.commit();
    });

    it('responds with status 200 and draft module’s data', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/draft-modules/${draftModule.id}`,
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toStrictEqual({
        data: {
          type: 'draft-modules',
          id: draftModule.id,
          attributes: {
            'short-id': draftModule.shortId,
            'internal-title': draftModule.internalTitle,
            'is-beta': draftModule.isBeta,
            visibility: draftModule.visibility,
            details: draftModule.details,
            slug: draftModule.slug,
            title: draftModule.title,
            sections: draftModule.sections,
            glossary: draftModule.glossary,
          },
          relationships: {
            module: {
              data: {
                id: draftModule.moduleId,
                type: 'modules',
              },
            },
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
