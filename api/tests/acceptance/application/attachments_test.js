import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as config from '../../../lib/config.js';

describe('Acceptance | Route | attachments', () => {
  let editorUser, readUser, originalPixApiUrlValue;
  beforeEach(async function() {
    originalPixApiUrlValue = config.pixApi.baseUrl;
    delete config.pixApi.baseUrl;
    editorUser = databaseBuilder.factory.buildEditorUser();
    readUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  afterEach(function() {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('POST /attachments', () => {
    let validPayload;

    beforeEach(function() {
      validPayload = {
        data: {
          type: 'attachments',
          attributes: {
            filename: 'some filename',
            size: 123,
            url: 'some.url.com',
            type: 'some type',
            'mime-type': 'some mime type',
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge123',
              },
            },
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: 'challenge123ES',
              },
            },
          },
        },
      };
    });

    describe('when user is NOT editor', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/attachments',
          payload: validPayload,
          headers: generateAuthorizationHeader(readUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();
        const invalidPayload = structuredClone(validPayload);
        invalidPayload.data.attributes.url = 123;

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/attachments',
          payload: invalidPayload,
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    it('should respond with status 201 and created attachment', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({
        id: 'area1',
        code: '1',
        frameworkId: 'recFmk1',
      });
      databaseBuilder.factory.buildCompetence({
        id: 'competence1',
        index: '1.1',
        areaId: 'area1',
      });
      databaseBuilder.factory.buildThematic({
        id: 'thematic1',
        competenceId: 'competence1',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube1',
        name: '@tube',
        thematicId: 'thematic1',
      });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({
          id: 'challenge123',
          skillId: 'skill1',
        }),
      );

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge123',
        challengeId: 'challenge123',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: validPayload.data.relationships['localized-challenge'].data.id,
        challengeId: 'challenge123',
        locale: 'es',
      });
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        payload: validPayload,
        url: '/api/attachments',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(201);
      expect(response.result).toEqual({
        data: {
          type: 'attachments',
          id: expect.stringMatching(/^attachment.+$/),
          attributes: {
            url: validPayload.data.attributes.url,
            size: validPayload.data.attributes.size,
            type: validPayload.data.attributes.type,
            'mime-type': validPayload.data.attributes['mime-type'],
            filename: validPayload.data.attributes.filename,
          },
          relationships: {
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: validPayload.data.relationships['localized-challenge'].data.id,
              },
            },
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge123',
              },
            },
          },
        },
      });

      await expect(knex.select('*').from('attachments')).resolves.toStrictEqual([
        {
          id: expect.stringMatching(/^attachment.+$/),
          url: validPayload.data.attributes.url,
          size: validPayload.data.attributes.size,
          type: validPayload.data.attributes.type,
          mimeType: validPayload.data.attributes['mime-type'],
          filename: validPayload.data.attributes.filename,
          challengeId: 'challenge123',
          localizedChallengeId: validPayload.data.relationships['localized-challenge'].data.id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('PATCH /attachments/{attachmentId}', () => {
    let validPayload;
    beforeEach(function() {
      validPayload = {
        data: {
          type: 'attachments',
          id: 'recABC123',
          attributes: {
            filename: 'filename APRES',
            size: 159,
            url: 'some.url.com APRES',
            type: 'some type APRES',
            'mime-type': 'some mime type APRES',
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge123',
              },
            },
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: 'challenge123ES',
              },
            },
          },
        },
      };
    });

    describe('when user is NOT editor', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/attachments/recABC123',
          payload: validPayload,
          headers: generateAuthorizationHeader(readUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();
        const invalidPayload = structuredClone(validPayload);
        invalidPayload.data.attributes.url = 123;

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/attachments/recABC123',
          payload: invalidPayload,
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when attachment does not exist', function() {
      it('should return a 404 not found', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          payload: validPayload,
          url: '/api/attachments/recABC123',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    it('should respond with status 200 and updated attachment', async () => {
      // given
      const attachmentBefore = {
        id: 'recABC123',
        type: 'type avant',
        url: 'url avant',
        size: 1024,
        mimeType: 'mimeType avant',
        filename: 'filename avant',
        challengeId: 'challenge123',
        airtableChallengeId: 'challengeAirtable123',
        localizedChallengeId: 'challenge123ES',
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({
        id: 'area1',
        code: '1',
        frameworkId: 'recFmk1',
      });
      databaseBuilder.factory.buildCompetence({
        id: 'competence1',
        index: '1.1',
        areaId: 'area1',
      });
      databaseBuilder.factory.buildThematic({
        id: 'thematic1',
        competenceId: 'competence1',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube1',
        name: '@tube',
        thematicId: 'thematic1',
      });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({
          id: 'challenge123',
          skillId: 'skill1',
        }),
      );

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge123',
        challengeId: 'challenge123',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: validPayload.data.relationships['localized-challenge'].data.id,
        challengeId: 'challenge123',
        locale: 'es',
      });

      databaseBuilder.factory.buildAttachment(attachmentBefore);

      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        payload: validPayload,
        url: '/api/attachments/recABC123',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({
        data: {
          type: 'attachments',
          id: 'recABC123',
          attributes: {
            url: 'url avant',
            size: 1024,
            type: 'type avant',
            'mime-type': 'mimeType avant',
            filename: 'filename APRES',
          },
          relationships: {
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: 'challenge123ES',
              },
            },
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge123',
              },
            },
          },
        },
      });

      await expect(knex.select('*').from('attachments')).resolves.toStrictEqual([
        {
          id: 'recABC123',
          type: 'type avant',
          url: 'url avant',
          size: 1024,
          mimeType: 'mimeType avant',
          filename: validPayload.data.attributes.filename,
          challengeId: 'challenge123',
          localizedChallengeId: 'challenge123ES',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('DELETE /attachments/{attachmentId}', () => {
    describe('when user is NOT editor', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'DELETE',
          url: '/api/attachments/recABC123',
          headers: generateAuthorizationHeader(readUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when param id is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'DELETE',
          url: '/api/attachments/coucouABC123',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when attachment does not exist', function() {
      it('should return a 404 not found', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'DELETE',
          url: '/api/attachments/recAttachmentId',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    it('should respond with status 204', async () => {
      // given
      const attachment = {
        id: 'recAttachmentId',
        type: 'some type',
        url: 'some url',
        size: 4321,
        mimeType: 'some mimeType',
        filename: 'some filename',
        challengeId: 'challengeId',
        airtableChallengeId: 'challengeAirtableId',
        localizedChallengeId: 'challengeId',
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({
        id: 'area1',
        code: '1',
        frameworkId: 'recFmk1',
      });
      databaseBuilder.factory.buildCompetence({
        id: 'competence1',
        index: '1.1',
        areaId: 'area1',
      });
      databaseBuilder.factory.buildThematic({
        id: 'thematic1',
        competenceId: 'competence1',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube1',
        name: '@tube',
        thematicId: 'thematic1',
      });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({
          id: 'challengeId',
          skillId: 'skill1',
        }),
      );

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeId',
        challengeId: 'challengeId',
        locale: 'fr',
      });

      databaseBuilder.factory.buildAttachment(attachment);

      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/attachments/recAttachmentId',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      await expect(knex.select('*').from('attachments')).resolves.toStrictEqual([]);

      expect(response.statusCode).toBe(204);
    });
  });

  describe('GET /attachments/{attachmentId}', () => {
    describe('when user is NOT authenticated', () => {
      it('should respond with status 401', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attachments/recABC123',
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when attachmentId is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attachments/bouboulapraline',
          headers: generateAuthorizationHeader(readUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when attachment does not exist', function() {
      it('should return a 404 not found', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attachments/recABC123',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    it('should respond with status 200 and the attachment', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({
        id: 'area1',
        code: '1',
        frameworkId: 'recFmk1',
      });
      databaseBuilder.factory.buildCompetence({
        id: 'competence1',
        index: '1.1',
        areaId: 'area1',
      });
      databaseBuilder.factory.buildThematic({
        id: 'thematic1',
        competenceId: 'competence1',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube1',
        name: '@tube',
        thematicId: 'thematic1',
      });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({
          id: 'challenge123',
          skillId: 'skill1',
        }),
      );

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge123',
        challengeId: 'challenge123',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge123ES',
        challengeId: 'challenge123',
        locale: 'es',
      });
      const attachment = {
        id: 'recABC123',
        type: 'some type',
        url: 'some url',
        size: 52983472,
        mimeType: 'some mimeType',
        filename: 'some filename',
        challengeId: 'challenge123',
        airtableChallengeId: 'challengeAirtable123',
        localizedChallengeId: 'challenge123ES',
      };
      databaseBuilder.factory.buildAttachment(attachment);
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/attachments/recABC123',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({
        data: {
          type: 'attachments',
          id: 'recABC123',
          attributes: {
            type: 'some type',
            url: 'some url',
            size: 52983472,
            'mime-type': 'some mimeType',
            filename: 'some filename',
          },
          relationships: {
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: 'challenge123ES',
              },
            },
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge123',
              },
            },
          },
        },
      });
    });
  });

  describe('GET /attachments?filter[localizedChallengeId]=%', () => {
    describe('when user is NOT authenticated', () => {
      it('should respond with status 401', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attachments?filter[localizedChallengeId]=localizedChallengeId1',
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when query is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attachments?filter[loclizedChallengeId]=localizedChallenge123,challengeId456',
          headers: generateAuthorizationHeader(readUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    it('should respond with found attachments', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({
        id: 'area1',
        code: '1',
        frameworkId: 'recFmk1',
      });
      databaseBuilder.factory.buildCompetence({
        id: 'competence1',
        index: '1.1',
        areaId: 'area1',
      });
      databaseBuilder.factory.buildThematic({
        id: 'thematic1',
        competenceId: 'competence1',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube1',
        name: '@tube',
        thematicId: 'thematic1',
      });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({
          id: 'challenge123',
          skillId: 'skill1',
        }),
      );

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge123',
        challengeId: 'challenge123',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallenge123',
        challengeId: 'challenge123',
        locale: 'es',
      });
      const attachment = {
        id: 'airtableAttachmentId1',
        type: 'some type 1',
        url: 'some url 1',
        size: 123,
        mimeType: 'some mime type 1',
        filename: 'some filename 1',
        challengeId: 'challenge123',
        airtableChallengeId: 'challengeAirtable123',
        localizedChallengeId: 'localizedChallenge123',
      };
      databaseBuilder.factory.buildAttachment(attachment);
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/attachments?filter[localizedChallengeId]=localizedChallenge123',
        headers: generateAuthorizationHeader(readUser),
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({
        data: [
          {
            type: 'attachments',
            id: 'airtableAttachmentId1',
            attributes: {
              type: 'some type 1',
              url: 'some url 1',
              size: 123,
              'mime-type': 'some mime type 1',
              filename: 'some filename 1',
            },
            relationships: {
              'localized-challenge': {
                data: {
                  type: 'localized-challenges',
                  id: 'localizedChallenge123',
                },
              },
              challenge: {
                data: {
                  type: 'challenges',
                  id: 'challenge123',
                },
              },
            },
          },
        ],
      });
    });
  });
});
