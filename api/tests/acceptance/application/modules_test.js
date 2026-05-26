import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { Module } from '../../../lib/domain/models/index.js';

const uuidRegExp = /^\p{Hex_Digit}{8}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{12}$/u;
const shortIdRegExp = /^\p{Hex_Digit}{8}$/u;

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
        { id: '79cc8f8d-d948-4ce5-bd35-1250b61d6011', shortId: 'abcd1234', internalTitle: 'MOD_a', slug: 'a', title: 'Module 1', isBeta: true, visibility: Module.VISIBILITIES.PRIVATE, details: { level: Module.LEVELS.NOVICE } },
        { id: '6e7f16ae-4d96-4a71-b646-d6c86029e05e', shortId: 'abcd5678', internalTitle: 'MOD_b', slug: 'b', title: 'Module 2', isBeta: false, visibility: Module.VISIBILITIES.PUBLIC, details: { level: Module.LEVELS.INDEPENDENT } },
        { id: 'f995ce82-1373-4758-b839-7a844893ef07', shortId: 'abcd9012', internalTitle: 'MOD_c', slug: 'c', title: 'Module 3', isBeta: false, visibility: Module.VISIBILITIES.PRIVATE, details: { level: Module.LEVELS.EXPERT } },
      ];

      modules.forEach((module) => {
        databaseBuilder.factory.buildModule(domainBuilder.buildModule(module));
      });

      await databaseBuilder.commit();
    });

    it('responds with status 200 and modules data', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/module-summaries',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: [
          {
            type: 'module-summaries',
            id: modules[1].id,
            attributes: { 'internal-title': modules[1].internalTitle, 'is-beta': modules[1].isBeta, visibility: modules[1].visibility, level: modules[1].details.level },
          },
          {
            type: 'module-summaries',
            id: modules[0].id,
            attributes: { 'internal-title': modules[0].internalTitle, 'is-beta': modules[0].isBeta, visibility: modules[0].visibility, level: modules[0].details.level },
          },
          {
            type: 'module-summaries',
            id: modules[2].id,
            attributes: { 'internal-title': modules[2].internalTitle, 'is-beta': modules[2].isBeta, visibility: modules[2].visibility, level: modules[2].details.level },
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
          url: '/api/module-summaries?page[size]=2&page[number]=2&sort=-title',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'module-summaries',
              id: modules[0].id,
              attributes: { 'internal-title': modules[0].internalTitle, 'is-beta': modules[0].isBeta, visibility: modules[0].visibility, level: modules[0].details.level },
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

  describe('POST /modules', () => {
    it('responds with status 201 and modules data', async () => {
      // given
      const module = domainBuilder.buildModule();
      const modulePayload = {
        'internal-title': module.internalTitle,
        slug: module.slug,
        title: module.title,
        'is-beta': module.isBeta,
        visibility: module.visibility,
        details: module.details,
        sections: module.sections,
        glossary: module.glossary,
      };

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/modules',
        headers: generateAuthorizationHeader(editorUser),
        payload: {
          data: {
            type: 'modules',
            attributes: modulePayload,
          },
        },
      });

      // then
      expect(response.statusCode).toBe(201);
      expect(response.result).toStrictEqual({
        data: {
          type: 'modules',
          id: expect.stringMatching(uuidRegExp),
          attributes: {
            'short-id': expect.stringMatching(shortIdRegExp),
            ...modulePayload,
          },
        },
      });

      await expect(knex.select('*').from('modules')).resolves.toStrictEqual([
        {
          id: expect.stringMatching(uuidRegExp),
          shortId: expect.stringMatching(shortIdRegExp),
          internalTitle: module.internalTitle,
          slug: module.slug,
          title: module.title,
          isBeta: module.isBeta,
          visibility: module.visibility,
          sections: module.sections,
          glossary: module.glossary,
          ...module.details,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });
});
