import { beforeEach, describe, describe as context, expect, it } from 'vitest';

import * as config from '../../../../lib/config.js';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Module } from '../../../../lib/domain/models/index.js';

const uuidRegExp = /^\p{Hex_Digit}{8}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{12}$/u;

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
        { id: '79cc8f8d-d948-4ce5-bd35-1250b61d6011', shortId: 'abcd1234', internalTitle: 'Module IA et environnement', slug: 'a', isBeta: true, visibility: Module.VISIBILITIES.PRIVATE, details: { level: Module.LEVELS.NOVICE } },
        { id: '6e7f16ae-4d96-4a71-b646-d6c86029e05e', shortId: 'abcd5678', internalTitle: 'Module phishing', slug: 'b', isBeta: false, visibility: Module.VISIBILITIES.PUBLIC, details: { level: Module.LEVELS.INDEPENDENT } },
        { id: 'f995ce82-1373-4758-b839-7a844893ef07', shortId: 'abcd9012', internalTitle: 'Module IA et fake news', slug: 'c', isBeta: false, visibility: Module.VISIBILITIES.PRIVATE, details: { level: Module.LEVELS.EXPERT } },
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
            attributes: {
              'internal-title': modules[1].internalTitle,
              'is-beta': modules[1].isBeta,
              visibility: modules[1].visibility,
              details: modules[1].details,
              url: `${config.pixApp.production.baseUrlFr}/modules/${modules[1].shortId}/${modules[1].slug}`,
            },
          },
          {
            type: 'modules',
            id: modules[0].id,
            attributes: {
              'internal-title': modules[0].internalTitle,
              'is-beta': modules[0].isBeta,
              visibility: modules[0].visibility,
              details: modules[0].details,
              url: `${config.pixApp.production.baseUrlFr}/modules/${modules[0].shortId}/${modules[0].slug}`,
            },
          },
          {
            type: 'modules',
            id: modules[2].id,
            attributes: {
              'internal-title': modules[2].internalTitle,
              'is-beta': modules[2].isBeta,
              visibility: modules[2].visibility,
              details: modules[2].details,
              url: `${config.pixApp.production.baseUrlFr}/modules/${modules[2].shortId}/${modules[2].slug}`,
            },
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
              attributes: {
                'internal-title': modules[0].internalTitle,
                'is-beta': modules[0].isBeta,
                visibility: modules[0].visibility,
                details: modules[0].details,
                url: `${config.pixApp.production.baseUrlFr}/modules/${modules[0].shortId}/${modules[0].slug}`,
              },
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

    describe('when using filter.internalTitle query param', () => {
      it('responds with status 200 and modules data', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/modules?filter[internalTitle]=IA',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toStrictEqual({
          data: [
            {
              type: 'modules',
              id: modules[0].id,
              attributes: {
                'internal-title': modules[0].internalTitle,
                'is-beta': modules[0].isBeta,
                visibility: modules[0].visibility,
                details: modules[0].details,
                url: `${config.pixApp.production.baseUrlFr}/modules/${modules[0].shortId}/${modules[0].slug}`,
              },
            },
            {
              type: 'modules',
              id: modules[2].id,
              attributes: {
                'internal-title': modules[2].internalTitle,
                'is-beta': modules[2].isBeta,
                visibility: modules[2].visibility,
                details: modules[2].details,
                url: `${config.pixApp.production.baseUrlFr}/modules/${modules[2].shortId}/${modules[2].slug}`,
              },
            },
          ],
          meta: {
            page: 1,
            pageSize: 10,
            rowCount: 2,
            pageCount: 1,
          },
        });
      });
    });
  });

  describe('GET /modules/:id', () => {
    let module, draftModule;

    beforeEach(async () => {
      module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);
      draftModule = domainBuilder.buildDraftModule({ id: module.id, moduleId: module.id });
      databaseBuilder.factory.buildDraftModule(draftModule);
      await databaseBuilder.commit();
    });

    it('responds with status 200 and module’s data', async () => {
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
            url: `${config.pixApp.production.baseUrlFr}/modules/${module.shortId}/${module.slug}`,
            'preview-url': `${config.pixApp.production.baseUrlFr}/modules/preview/${module.shortId}/${module.slug}`,
          },
          relationships: {
            'draft-module': {
              data: {
                id: draftModule.id,
                type: 'draft-modules',
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

  describe('POST /modules/:id/duplicate', () => {
    let originalModule;

    beforeEach(async () => {
      originalModule = domainBuilder.buildModule({
        internalTitle: 'IAGenAmi_CLA',
        title: 'Comment devenir ami avec une IA ?',
        slug: 'comment-devenir-ami-avec-une-ia',
        version: '3.0',
        sections: [
          {
            id: '3c1f0a4e-8b2d-4f6a-9c7e-1d2b3a4c5e6f',
            type: 'explore-to-understand',
            grains: [
              {
                id: '7a8b9c0d-1e2f-4a3b-8c4d-5e6f7a8b9c0d',
                type: 'lesson',
                title: 'Une IA peut-elle être votre amie ?',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
                      type: 'text',
                      content: '<p>Une IA génère ses réponses à partir de données : elle ne ressent pas d’émotions.</p>',
                    },
                  },
                ],
              },
            ],
          },
        ],
      });
      databaseBuilder.factory.buildModule(originalModule);
      await databaseBuilder.commit();
    });

    it('responds with status 201 and the duplicated draft module id', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/modules/${originalModule.id}/duplicate`,
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(201);

      const [duplicatedDraftModule] = await knex.select('*').from('draft-modules');
      const expectedDuplicatedDraftModule = {
        id: expect.stringMatching(uuidRegExp),
        shortId: duplicatedDraftModule.id.slice(0, 8),
        moduleId: null,
        internalTitle: '[Copie] IAGenAmi_CLA',
        slug: 'comment-devenir-ami-avec-une-ia-copie',
        title: '[Copie] Comment devenir ami avec une IA ?',
        isBeta: originalModule.isBeta,
        visibility: originalModule.visibility,
        sections: [
          {
            id: expect.stringMatching(uuidRegExp),
            type: 'explore-to-understand',
            grains: [
              {
                id: expect.stringMatching(uuidRegExp),
                type: 'lesson',
                title: 'Une IA peut-elle être votre amie ?',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: expect.stringMatching(uuidRegExp),
                      type: 'text',
                      content: '<p>Une IA génère ses réponses à partir de données : elle ne ressent pas d’émotions.</p>',
                    },
                  },
                ],
              },
            ],
          },
        ],
        glossary: originalModule.glossary,
        version: '0.1',
        hasBeenValidated: false,
        validationErrors: null,
        ...originalModule.details,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      expect(duplicatedDraftModule).toStrictEqual(expectedDuplicatedDraftModule);
      expect(duplicatedDraftModule.id).not.toBe(originalModule.id);

      const duplicatedDraftModuleVersions = await knex.select('*').from('draft-module-versions');
      const expectedDuplicatedDraftModuleVersions = [
        {
          id: expect.any(Number),
          draftModuleId: duplicatedDraftModule.id,
          version: '0.1',
          structuredDiff: expect.any(Object),
          createdAt: expect.any(Date),
        },
      ];
      expect(duplicatedDraftModuleVersions).toStrictEqual(expectedDuplicatedDraftModuleVersions);

      expect(response.result).toStrictEqual({ data: { type: 'draft-modules', id: duplicatedDraftModule.id } });

      const unchangedModules = await knex.select('id', 'internalTitle').from('modules');
      expect(unchangedModules).toStrictEqual([{ id: originalModule.id, internalTitle: originalModule.internalTitle }]);
    });

    context('when the module does not exist', () => {
      it('responds with status 404', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/modules/2b2e3b7c-5b8e-4d6a-9a0f-0c1d2e3f4a5b/duplicate',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
        await expect(knex('draft-modules').count().first()).resolves.toStrictEqual({ count: 0 });
      });
    });

    context('when a draft module already uses the duplicated internal title', () => {
      it('responds with status 409', async () => {
        // given
        const existingDraftModule = domainBuilder.buildDraftModule({ shortId: 'copie123', internalTitle: '[Copie] IAGenAmi_CLA' });
        databaseBuilder.factory.buildDraftModule(existingDraftModule);
        await databaseBuilder.commit();
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/modules/${originalModule.id}/duplicate`,
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(409);
        expect(response.result.errors[0].detail).toBe('Un brouillon avec le titre interne "[Copie] IAGenAmi_CLA" existe déjà.');
        const unchangedDraftModules = await knex.select('id').from('draft-modules');
        expect(unchangedDraftModules).toStrictEqual([{ id: existingDraftModule.id }]);
      });
    });

    context('when user has no write access', () => {
      it('responds with status 403', async () => {
        // given
        const readonlyUser = databaseBuilder.factory.buildReadonlyUser();
        await databaseBuilder.commit();
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/modules/${originalModule.id}/duplicate`,
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(403);
        await expect(knex('draft-modules').count().first()).resolves.toStrictEqual({ count: 0 });
      });
    });
  });

  describe('GET /api/module-schema/module-json-schema.json', function() {
    it('should return a cacheable JSON Schema', async function() {
      // given
      const server = await createServer();
      const options = {
        method: 'GET',
        url: '/api/module-schema/module-json-schema.json',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['cache-control']).to.include('public');
      expect(response.headers['cache-control']).to.include(900);
      expect(response.headers['etag']).to.exist;
      expect(() => JSON.parse(response.payload), 'Response payload is not a valid JSON string').not.to.throw(Error);
    });
  });
});
