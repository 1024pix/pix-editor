import { beforeEach, describe, expect, it } from 'vitest';

import * as config from '../../../../lib/config.js';
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
      const draftModule = domainBuilder.buildDraftModule({ version: '0.1' });
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
            relationships: { module: { data: null } },
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
            url: expect.stringMatching(new RegExp(`^${config.pixApp.recette.baseUrlFr.replace(/([.])/g, '\\$1')}/modules/.{8}/${draftModule.slug}$`)),
            'preview-url': expect.stringMatching(new RegExp(`^${config.pixApp.recette.baseUrlFr.replace(/([.])/g, '\\$1')}/modules/preview/.{8}/${draftModule.slug}$`)),
            'has-been-validated': true,
            'validation-errors': [],
            'updated-at': expect.any(Date),
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
          version: draftModule.version,
          hasBeenValidated: true,
          validationErrors: [],
          ...draftModule.details,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe('when creating a draft for a production module', () => {
      it('responds with status 201 and draft modules data', async () => {
        // given
        const module = domainBuilder.buildModule({
          sections: [],
          glossary: [],
          version: '4.0',
        });
        databaseBuilder.factory.buildModule(module);
        await databaseBuilder.commit();

        const draftModule = domainBuilder.buildDraftModule({
          id: module.id,
          shortId: module.shortId,
          moduleId: module.id,
          slug: module.slug + '-update',
          title: module.title + ' update',
          internalTitle: module.internalTitle + '-update',
          isBeta: true,
          visibility: Module.VISIBILITIES.PRIVATE,
          version: '4.1',
          details: {
            image: module.details.image + '-update',
            description: module.details.description + ' update',
            duration: module.details.duration + 1,
            level: Module.LEVELS.ADVANDCED,
            objectives: [...module.details.objectives, 'update'],
            tabletSupport: module.details.tabletSupport,
          },
        });
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
              relationships: {
                module: {
                  data: {
                    id: draftModule.moduleId,
                    type: 'modules',
                  },
                },
              },
            },
          },
        });

        // then
        expect(response.statusCode).toBe(201);
        expect(response.result).toStrictEqual({
          data: {
            type: 'draft-modules',
            id: draftModule.id,
            attributes: {
              'short-id': draftModule.shortId,
              ...draftModulePayload,
              url: `${config.pixApp.recette.baseUrlFr}/modules/${draftModule.shortId}/${draftModule.slug}`,
              'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModule.shortId}/${draftModule.slug}`,
              'has-been-validated': true,
              'validation-errors': [],
              'updated-at': expect.any(Date),
            },
            relationships: {
              module: {
                data: {
                  id: module.id,
                  type: 'modules',
                },
              },
              diff: { links: { related: `/api/draft-modules/${draftModule.id}/diff` } },
            },
          },
        });

        await expect(knex.select('*').from('draft-modules')).resolves.toStrictEqual([
          {
            id: draftModule.id,
            shortId: draftModule.shortId,
            moduleId: draftModule.moduleId,
            internalTitle: draftModule.internalTitle,
            slug: draftModule.slug,
            title: draftModule.title,
            isBeta: draftModule.isBeta,
            visibility: draftModule.visibility,
            sections: draftModule.sections,
            glossary: draftModule.glossary,
            version: draftModule.version,
            hasBeenValidated: true,
            validationErrors: [],
            ...draftModule.details,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);

        await expect(knex.select('*').from('draft-module-versions')).resolves.toStrictEqual([
          {
            id: expect.any(Number),
            draftModuleId: draftModule.id,
            version: draftModule.version,
            structuredDiff: expect.any(Object),
            createdAt: expect.any(Date),
          },
        ]);
      });
    });

    describe('when payload is invalid', () => {
      it('responds with status 400 and error detail', async () => {
        // given
        const draftModule = domainBuilder.buildDraftModule({ version: '0.1' });
        const draftModulePayload = {
          slug: draftModule.slug,
          title: draftModule.title,
          'internal-title': '',
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
              relationships: { module: { data: null } },
            },
          },
        });

        // then
        expect(response.statusCode).toBe(400);
        expect(response.result).toStrictEqual({
          errors: [
            {
              status: '400',
              title: 'Invalid Request Payload',
              detail: '"data.attributes.internal-title" ne doit pas être vide',
            },
          ],
        });
      });
    });
  });

  describe('GET /draft-modules', () => {
    let draftModules;

    beforeEach(async () => {
      const { id: moduleId } = databaseBuilder.factory.buildModule(domainBuilder.buildModule());
      draftModules = [
        { id: '79cc8f8d-d948-4ce5-bd35-1250b61d6011', shortId: 'abcd1234', internalTitle: 'MOD_a', slug: 'a', details: { level: Module.LEVELS.NOVICE }, visibility: Module.VISIBILITIES.PRIVATE, hasBeenValidated: true },
        { id: moduleId, moduleId, shortId: 'abcd5678', internalTitle: 'MOD_b', slug: 'b', details: { level: Module.LEVELS.INDEPENDENT }, visibility: Module.VISIBILITIES.PUBLIC, hasBeenValidated: false },
        { id: 'f995ce82-1373-4758-b839-7a844893ef07', shortId: 'abcd9012', internalTitle: 'MOD_c', slug: 'c', details: { level: Module.LEVELS.EXPERT }, visibility: Module.VISIBILITIES.PRIVATE, hasBeenValidated: true },
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
            attributes: {
              'internal-title': draftModules[1].internalTitle,
              details: draftModules[1].details,
              'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModules[1].shortId}/${draftModules[1].slug}`,
              'has-been-validated': draftModules[1].hasBeenValidated,
            },
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
            attributes: {
              'internal-title': draftModules[0].internalTitle,
              details: draftModules[0].details,
              'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModules[0].shortId}/${draftModules[0].slug}`,
              'has-been-validated': draftModules[0].hasBeenValidated,
            },
            relationships: { module: { data: null } },
          },
          {
            type: 'draft-modules',
            id: draftModules[2].id,
            attributes: {
              'internal-title': draftModules[2].internalTitle,
              details: draftModules[2].details,
              'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModules[2].shortId}/${draftModules[2].slug}`,
              'has-been-validated': draftModules[2].hasBeenValidated,
            },
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
              attributes: {
                'internal-title': draftModules[0].internalTitle,
                details: draftModules[0].details,
                'has-been-validated': draftModules[0].hasBeenValidated,
                'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModules[0].shortId}/${draftModules[0].slug}`,
              },
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
            url: `${config.pixApp.recette.baseUrlFr}/modules/${draftModule.shortId}/${draftModule.slug}`,
            'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModule.shortId}/${draftModule.slug}`,
            'has-been-validated': draftModule.hasBeenValidated,
            'validation-errors': draftModule.validationErrors,
            'updated-at': draftModule.updatedAt,
          },
          relationships: {
            module: {
              data: {
                id: draftModule.moduleId,
                type: 'modules',
              },
            },
            diff: { links: { related: `/api/draft-modules/${draftModule.id}/diff` } },
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

  describe('GET /draft-modules/:id/diff', () => {
    it('responds with status 200 and draft module’s data', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);
      const { id: draftModuleId } = databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({
        id: module.id,
        moduleId: module.id,
        details: { level: Module.LEVELS.EXPERT },
        glossary: [
          ...module.glossary,
          {
            word: 'antennes',
            definition: 'La paire d’antennes de l’escargot lui sert, en gros, à tâter le terrain et à découvrir, par le toucher, son environnement immédiat.',
          },
        ],
      }));
      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/draft-modules/${draftModuleId}/diff`,
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toStrictEqual({
        data: {
          type: 'draft-module-diffs',
          id: draftModuleId,
          attributes: { 'html-diff': expect.any(String) },
        },
      });
      expect(response.result.data.attributes['html-diff']).toMatchInlineSnapshot(`
        "<pre class="shiki github-light" style="background-color:#fff;color:#24292e" tabindex="0"><code><span class="line"><span style="color:#6F42C1;font-weight:bold">@@ -9,9 +9,9 @@</span></span>
        <span class="line"><span style="color:#24292E">   "details": {</span></span>
        <span class="line"><span style="color:#24292E">     "image": "https://assets.pix.org/draft/escargots.jpg",</span></span>
        <span class="line"><span style="color:#24292E">     "description": "&#x3C;p>Ce module est dédié aux escargots&#x3C;/p>&#x3C;p>Il contient normalement l'intégralité de leurs secrets disponibles à date.&#x3C;/p>",</span></span>
        <span class="line"><span style="color:#24292E">     "duration": 7,</span></span>
        <span class="line"><span style="color:#B31D28">-    "level": "novice",</span></span>
        <span class="line"><span style="color:#22863A">+    "level": "expert",</span></span>
        <span class="line"><span style="color:#24292E">     "objectives": [</span></span>
        <span class="line"><span style="color:#24292E">       "Connaître les petits secrets des gastéropodes"</span></span>
        <span class="line"><span style="color:#24292E">     ],</span></span>
        <span class="line"><span style="color:#24292E">     "tabletSupport": "inconvenient"</span></span>
        <span class="line"><span style="color:#6F42C1;font-weight:bold">@@ -43,7 +43,11 @@</span></span>
        <span class="line"><span style="color:#24292E">   "glossary": [</span></span>
        <span class="line"><span style="color:#24292E">     {</span></span>
        <span class="line"><span style="color:#24292E">       "word": "coquille",</span></span>
        <span class="line"><span style="color:#24292E">       "definition": "Une coquille est un agglomérat de calcaire très résistant. Sa structure cristalline spécifique lui confère une résistance protectrice. Elle prodique à l'escargot toute sa force et sa vitalité."</span></span>
        <span class="line"><span style="color:#22863A">+    },</span></span>
        <span class="line"><span style="color:#22863A">+    {</span></span>
        <span class="line"><span style="color:#22863A">+      "word": "antennes",</span></span>
        <span class="line"><span style="color:#22863A">+      "definition": "La paire d’antennes de l’escargot lui sert, en gros, à tâter le terrain et à découvrir, par le toucher, son environnement immédiat."</span></span>
        <span class="line"><span style="color:#24292E">     }</span></span>
        <span class="line"><span style="color:#24292E">   ]</span></span>
        <span class="line"><span style="color:#24292E"> }</span></span>
        <span class="line"><span style="color:#24292E">\\ No newline at end of file</span></span>
        <span class="line"></span></code></pre>"
      `);
    });

    describe('when draft is a creation draft', () => {
      it('responds with status 400', async () => {
        // given
        const { id: draftModuleId } = databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule());
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/draft-modules/${draftModuleId}/diff`,
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe('PATCH /draft-modules/:id', () => {
    it('responds with status 200 and draft modules data', async () => {
      // given
      const draftModule = domainBuilder.buildDraftModule({ version: '6.4' });
      databaseBuilder.factory.buildDraftModule(draftModule);
      await databaseBuilder.commit();

      const draftModulePayload = {
        slug: 'kebab-royal',
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
        method: 'PATCH',
        url: `/api/draft-modules/${draftModule.id}`,
        headers: generateAuthorizationHeader(editorUser),
        payload: {
          data: {
            type: 'draft-modules',
            id: draftModule.id,
            attributes: draftModulePayload,
            relationships: { module: { data: null } },
          },
        },
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toStrictEqual({
        data: {
          type: 'draft-modules',
          id: draftModule.id,
          attributes: {
            'short-id': draftModule.shortId,
            ...draftModulePayload,
            url: `${config.pixApp.recette.baseUrlFr}/modules/${draftModule.shortId}/kebab-royal`,
            'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModule.shortId}/kebab-royal`,
            'has-been-validated': true,
            'validation-errors': [],
            'updated-at': expect.any(Date),
          },
          relationships: { module: { data: null } },
        },
      });

      await expect(knex.select('*').from('draft-modules')).resolves.toStrictEqual([
        {
          id: draftModule.id,
          shortId: draftModule.shortId,
          moduleId: null,
          internalTitle: draftModule.internalTitle,
          slug: 'kebab-royal',
          title: draftModule.title,
          isBeta: draftModule.isBeta,
          visibility: draftModule.visibility,
          sections: draftModule.sections,
          glossary: draftModule.glossary,
          version: '6.5',
          hasBeenValidated: true,
          validationErrors: [],
          ...draftModule.details,
          createdAt: draftModule.createdAt,
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(knex.select('*').from('draft-module-versions')).resolves.toStrictEqual([
        {
          id: expect.any(Number),
          draftModuleId: draftModule.id,
          version: '6.5',
          structuredDiff: expect.any(Object),
          createdAt: expect.any(Date),
        },
      ]);
    });

    describe('when payload is invalid', () => {
      it('responds with status 400 and error detail', async () => {
        // given
        const draftModule = domainBuilder.buildDraftModule({ version: '0.1' });
        databaseBuilder.factory.buildDraftModule(draftModule);
        await databaseBuilder.commit();

        const draftModulePayload = {
          slug: draftModule.slug,
          'internal-title': '',
          'is-beta': draftModule.isBeta,
          visibility: draftModule.visibility,
          details: draftModule.details,
          sections: draftModule.sections,
          glossary: draftModule.glossary,
        };

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/draft-modules/${draftModule.id}`,
          headers: generateAuthorizationHeader(editorUser),
          payload: {
            data: {
              type: 'draft-modules',
              id: draftModule.id,
              attributes: draftModulePayload,
              relationships: { module: { data: null } },
            },
          },
        });

        // then
        expect(response.statusCode).toBe(400);
        expect(response.result).toStrictEqual({
          errors: [
            {
              status: '400',
              title: 'Invalid Request Payload',
              detail: '"data.attributes.internal-title" ne doit pas être vide',
            },
            {
              status: '400',
              title: 'Invalid Request Payload',
              detail: '"data.attributes.title" est requis',
            },
          ],
        });
      });
    });
  });

  describe('POST /draft-modules/:id/publish', () => {
    it('responds with status 200 and published module’s data', async () => {
      // given
      const draftModule = domainBuilder.buildDraftModule({ version: '47.3' });
      databaseBuilder.factory.buildDraftModule(draftModule);
      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/draft-modules/${draftModule.id}/publish`,
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: {
          type: 'modules',
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
            url: `${config.pixApp.production.baseUrlFr}/modules/${draftModule.shortId}/${draftModule.slug}`,
            'preview-url': `${config.pixApp.production.baseUrlFr}/modules/preview/${draftModule.shortId}/${draftModule.slug}`,
          },
          relationships: { 'draft-module': { data: null } },
        },
      });

      await expect(knex.select('*').from('modules')).resolves.toStrictEqual([
        {
          id: draftModule.id,
          shortId: draftModule.shortId,
          internalTitle: draftModule.internalTitle,
          slug: draftModule.slug,
          title: draftModule.title,
          isBeta: draftModule.isBeta,
          visibility: draftModule.visibility,
          sections: draftModule.sections,
          glossary: draftModule.glossary,
          version: '48.0',
          ...draftModule.details,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
      await expect(knex.select('*').from('draft-modules')).resolves.toStrictEqual([]);
      await expect(knex.select('*').from('module-versions')).resolves.toStrictEqual([
        {
          id: expect.any(Number),
          moduleId: draftModule.id,
          shortId: draftModule.shortId,
          internalTitle: draftModule.internalTitle,
          slug: draftModule.slug,
          title: draftModule.title,
          isBeta: draftModule.isBeta,
          visibility: draftModule.visibility,
          sections: draftModule.sections,
          glossary: draftModule.glossary,
          version: '48.0',
          ...draftModule.details,
          createdAt: expect.any(Date),
        },
      ]);
    });

    describe('when the draft module is invalid', () => {
      it('responds with status 422 and a DRAFT_MODULE_VALIDATION_ERROR code', async () => {
        // given
        const draftModule = domainBuilder.buildDraftModule({ slug: 'not valid slug' });
        databaseBuilder.factory.buildDraftModule(draftModule);
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/draft-modules/${draftModule.id}/publish`,
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(422);
        expect(response.result.errors).toContainEqual(
          expect.objectContaining({
            status: '422',
            code: 'DRAFT_MODULE_VALIDATION_ERROR',
          }),
        );

        await expect(knex.select('*').from('modules')).resolves.toStrictEqual([]);

        const nonValidatedDraftModule = await knex.select('*').from('draft-modules').first();
        expect(nonValidatedDraftModule.hasBeenValidated).toStrictEqual(false);
        expect(nonValidatedDraftModule.validationErrors).toStrictEqual([
          `
"slug" avec la valeur "not valid slug" ne respecte pas le format requis : /^[a-z0-9-]+$/.
Valeur concernée à rechercher : "not valid slug"
`,
        ]);
      });
    });
  });
});
