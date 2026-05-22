import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

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
});
