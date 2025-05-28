import { afterEach, beforeEach, describe, describe as context, expect, it } from 'vitest';
import nock from 'nock';
import { airtableBuilder, databaseBuilder, generateAuthorizationHeader, knex, } from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Route | attachments', () => {

  let editorUser, readUser;
  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    readUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
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
            'localized-challenge-id': 'I DONT CARE',
          },
          relationships: {
            challenge: {
              data: null,
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

    afterEach(function() {
      return knex('localized_challenges-attachments').truncate();
    });

    context('when user is NOT editor', () => {
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

    context('when payload is NOT valid', () => {
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
      const airtableAttachment = airtableBuilder.factory.buildAttachment({
        id: 'airtableAttachmentId',
        type: validPayload.data.attributes.type,
        url: validPayload.data.attributes.url,
        size: validPayload.data.attributes.size,
        mimeType: validPayload.data.attributes['mime-type'],
        filename: validPayload.data.attributes.filename,
        challengeId: 'challenge123',
        airtableChallengeId: 'challengeAirtable123',
        localizedChallengeId: validPayload.data.relationships['localized-challenge'].data.id,
      });
      const airtableGetAirtableChallengeIdsByIdsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': ['Record ID', 'id persistant'],
          },
          filterByFormula: 'OR("challenge123" = {id persistant})',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [{
          fields: {
            'id persistant': 'challenge123',
            'Record ID': 'challengeAirtable123'
          }
        }]
        });
      const airtablePostAttachmentScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Attachments/', {
          records: [{
            fields: {
              'url': validPayload.data.attributes.url,
              'size': validPayload.data.attributes.size,
              'type': validPayload.data.attributes.type,
              'mimeType': validPayload.data.attributes['mime-type'],
              'filename': validPayload.data.attributes.filename,
              'challengeId': ['challengeAirtable123'],
              'localizedChallengeId': validPayload.data.relationships['localized-challenge'].data.id,
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableAttachment] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge({
        id: 'challenge123',
        locales: ['fr', 'es'],
      });
      const airtableGetChallengeScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          filterByFormula: '{id persistant} = "challenge123"',
          maxRecords: '1'
        })
        .reply(200, {
          records: [
            airtableChallenge,
          ]
        });
      const airtableFindAttachmentsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments')
        .query({
          filterByFormula: 'OR({localizedChallengeId} = "challenge123ES")',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableAttachment] });
      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken });
      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/challenges/challenge123ES',
          {
            id: 'challenge123ES',
            alpha: null,
            alternativeInstruction: '',
            attachments: [ 'some.url.com' ],
            autoReply: false,
            competenceId: null,
            delta: null,
            embedUrl: null,
            embedTitle: '',
            format: 'mots',
            illustrationAlt: null,
            illustrationUrl: null,
            instruction: '',
            locales: [ 'es', 'fr' ],
            proposals: '',
            solution: '',
            solutionToDisplay: '',
            skillId: null,
            t1Status: false,
            t2Status: false,
            t3Status: false,
            requireGafamWebsiteAccess: false,
            isIncompatibleIpadCertif: false,
            deafAndHardOfHearing: 'RAS',
            isAwarenessChallenge: false,
            toRephrase: false,
            hasEmbedInternalValidation: false,
            noValidationNeeded: false
          })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
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
          id: 'airtableAttachmentId',
          attributes: {
            'url': validPayload.data.attributes.url,
            'size': validPayload.data.attributes.size,
            'type': validPayload.data.attributes.type,
            'mime-type': validPayload.data.attributes['mime-type'],
            'filename': validPayload.data.attributes.filename,
            'localized-challenge-id': validPayload.data.relationships['localized-challenge'].data.id,
            'alt': null,
          },
          relationships: {
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: validPayload.data.relationships['localized-challenge'].data.id,
              },
            },
            challenge: {
              data: null,
            },
          },
        },
      });
      expect(airtableGetAirtableChallengeIdsByIdsScope.isDone()).toBe(true);
      expect(airtablePostAttachmentScope.isDone()).toBe(true);
      expect(airtableGetChallengeScope.isDone()).toBe(true);
      expect(airtableFindAttachmentsScope.isDone()).toBe(true);
      expect(apiCacheScope.isDone()).toBe(true);
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
            'localized-challenge-id': 'I DONT CARE',
          },
          relationships: {
            challenge: {
              data: null,
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

    context('when user is NOT editor', () => {
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

    context('when payload is NOT valid', () => {
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

    context('when attachment does not exist', function() {
      it('should return a 404 not found', async function() {
        // given
        const airtableGetAttachmentScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Attachments/recABC123')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);
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
        expect(airtableGetAttachmentScope.isDone()).toBe(true);
      });
    });

    it('should respond with status 200 and updated attachment', async () => {
      // given
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
      const airtableAttachmentBefore = airtableBuilder.factory.buildAttachment({
        id: 'recABC123',
        type: 'type avant',
        url: 'url avant',
        size: 'size avant',
        mimeType: 'mimeType avant',
        filename: 'filename avant',
        challengeId: 'challenge123',
        airtableChallengeId: 'challengeAirtable123',
        localizedChallengeId: 'challenge123ES',
      });
      const airtableAttachmentAfter = airtableBuilder.factory.buildAttachment({
        id: 'recABC123',
        type: 'type avant',
        url: 'url avant',
        size: 'size avant',
        mimeType: 'mimeType avant',
        filename: validPayload.data.attributes.filename,
        challengeId: 'challenge123',
        airtableChallengeId: 'challengeAirtable123',
        localizedChallengeId: 'challenge123ES',
      });
      const airtableGetAttachmentScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments/recABC123')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableAttachmentBefore);

      const airtablePatchAttachmentScope = nock('https://api.airtable.com')
        .patch('/v0/airtableBaseValue/Attachments/', {
          records: [{
            id: 'recABC123',
            fields: {
              'url': 'url avant',
              'size': 'size avant',
              'type': 'type avant',
              'mimeType': 'mimeType avant',
              'filename': 'filename APRES',
              'challengeId': ['challengeAirtable123'],
              'localizedChallengeId': 'challenge123ES',
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableAttachmentAfter] });
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
            size: 'size avant',
            type: 'type avant',
            'mime-type': 'mimeType avant',
            filename: 'filename APRES',
            'localized-challenge-id': 'challenge123ES',
            alt: null,
          },
          relationships: {
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: 'challenge123ES',
              },
            },
            challenge: {
              data: null,
            },
          },
        },
      });
      expect(airtableGetAttachmentScope.isDone()).toBe(true);
      expect(airtablePatchAttachmentScope.isDone()).toBe(true);
    });
  });

  describe('DELETE /attachments/{attachmentId}', () => {
    context('when user is NOT editor', () => {
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

    context('when param id is NOT valid', () => {
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

    context('when attachment does not exist', function() {
      it('should return a 404 not found', async function() {
        // given
        const airtableGetAttachmentScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Attachments/recAttachmentId')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);
        const server = await createServer();
        // when
        const response = await server.inject({
          method: 'DELETE',
          url: '/api/attachments/recAttachmentId',
          headers: generateAuthorizationHeader(editorUser),
        });
        // then
        expect(response.statusCode).toBe(404);
        expect(airtableGetAttachmentScope.isDone()).toBe(true);
      });
    });

    it('should respond with status 204', async () => {
      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeId',
        challengeId: 'challengeId',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        localizedChallengeId: 'challengeId',
        attachmentId: 'recAttachmentId',
      });
      await databaseBuilder.commit();
      const airtableAttachment = airtableBuilder.factory.buildAttachment({
        id: 'recAttachmentId',
        type: 'some type',
        url: 'some url',
        size: 'some size',
        mimeType: 'some mimeType',
        filename: 'some filename',
        challengeId: 'challengeId',
        airtableChallengeId: 'challengeAirtableId',
        localizedChallengeId: 'challengeId',
      });
      const airtableGetAttachmentScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments/recAttachmentId')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableAttachment);
      const airtableDeleteAttachmentScope = nock('https://api.airtable.com')
        .delete('/v0/airtableBaseValue/Attachments')
        .query({
          'records[]': 'recAttachmentId',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(204, {
          records: [
            {
              'id': 'recAttachmentId',
              'deleted': true,
            },
          ],
        });
      const airtableChallenge = airtableBuilder.factory.buildChallenge({
        id: 'challengeId',
        locales: ['fr'],
      });
      const airtableGetChallengeScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          filterByFormula: '{id persistant} = "challengeId"',
          maxRecords: '1'
        })
        .reply(200, {
          records: [
            airtableChallenge,
          ]
        });
      const airtableFindAttachmentsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments')
        .query({
          filterByFormula: 'OR({localizedChallengeId} = "challengeId")',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [] });
      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken });
      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/challenges/challengeId',
          {
            id: 'challengeId',
            alpha: null,
            alternativeInstruction: '',
            autoReply: false,
            competenceId: null,
            delta: null,
            embedUrl: null,
            embedTitle: '',
            format: 'mots',
            illustrationAlt: null,
            illustrationUrl: null,
            instruction: '',
            locales: [ 'fr' ],
            proposals: '',
            solution: '',
            solutionToDisplay: '',
            skillId: null,
            t1Status: false,
            t2Status: false,
            t3Status: false,
            requireGafamWebsiteAccess: false,
            isIncompatibleIpadCertif: false,
            deafAndHardOfHearing: 'RAS',
            isAwarenessChallenge: false,
            toRephrase: false,
            hasEmbedInternalValidation: false,
            noValidationNeeded: false
          })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/attachments/recAttachmentId',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(204);
      expect(airtableGetAttachmentScope.isDone()).toBe(true);
      expect(airtableDeleteAttachmentScope.isDone()).toBe(true);
      expect(airtableGetChallengeScope.isDone()).toBe(true);
      expect(airtableFindAttachmentsScope.isDone()).toBe(true);
      expect(apiCacheScope.isDone()).toBe(true);
    });
  });

  describe('GET /attachments/{attachmentId}', () => {
    context('when user is NOT authenticated', () => {
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

    context('when attachmentId is NOT valid', () => {
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

    context('when attachment does not exist', function() {
      it('should return a 404 not found', async function() {
        // given
        const airtableGetAttachmentScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Attachments/recABC123')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attachments/recABC123',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
        expect(airtableGetAttachmentScope.isDone()).toBe(true);
      });
    });

    it('should respond with status 200 and the attachment', async () => {
      // given
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
      await databaseBuilder.commit();
      const airtableAttachment = airtableBuilder.factory.buildAttachment({
        id: 'recABC123',
        type: 'some type',
        url: 'some url',
        size: 'some size',
        mimeType: 'some mimeType',
        filename: 'some filename',
        challengeId: 'challenge123',
        airtableChallengeId: 'challengeAirtable123',
        localizedChallengeId: 'challenge123ES',
      });
      const airtableGetAttachmentScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments/recABC123')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableAttachment);
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
            size: 'some size',
            'mime-type': 'some mimeType',
            filename: 'some filename',
            'localized-challenge-id': 'challenge123ES',
            alt: null,
          },
          relationships: {
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: 'challenge123ES',
              },
            },
            challenge: {
              data: null,
            },
          },
        },
      });
      expect(airtableGetAttachmentScope.isDone()).toBe(true);
    });
  });

  describe('GET /attachments?filter[localizedChallengeIds]=%', () => {
    context('when user is NOT authenticated', () => {
      it('should respond with status 401', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attachments?filter[localizedChallengeIds]=localizedChallengeId1,localizedChallengeId3',
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    context('when query is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attachments?filter[loclizedChallengeId]=localizedChallengeId123,challengeId456',
          headers: generateAuthorizationHeader(readUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    it('should respond with found attachments', async () => {
      // given
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
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge456',
        challengeId: 'challenge456',
        locale: 'fr',
      });
      await databaseBuilder.commit();
      const airtableAttachments = [];
      airtableAttachments.push(airtableBuilder.factory.buildAttachment({
        id: 'airtableAttachmentId1',
        type: 'some type 1',
        url: 'some url 1',
        size: 123,
        mimeType: 'some mime type 1',
        filename: 'some filename 1',
        challengeId: 'challenge123',
        airtableChallengeId: 'challengeAirtable123',
        localizedChallengeId: 'localizedChallenge123',
      }));
      airtableAttachments.push(airtableBuilder.factory.buildAttachment({
        id: 'airtableAttachmentId2',
        type: 'some type 2',
        url: 'some url 2',
        size: 456,
        mimeType: 'some mime type 2',
        filename: 'some filename 2',
        challengeId: 'challengeId456',
        airtableChallengeId: 'challengeAirtable456',
        localizedChallengeId: 'challengeId456',
      }));
      const airtableGetAttachmentScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments')
        .query({
          filterByFormula: 'OR({localizedChallengeId} = "localizedChallengeId123",{localizedChallengeId} = "challengeId456")',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableAttachments });
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/attachments?filter[localizedChallengeIds]=localizedChallengeId123,challengeId456',
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
              'localized-challenge-id': 'localizedChallenge123',
              alt: null,
            },
            relationships: {
              'localized-challenge': {
                data: {
                  type: 'localized-challenges',
                  id: 'localizedChallenge123',
                },
              },
              challenge: {
                data: null,
              },
            },
          },
          {
            type: 'attachments',
            id: 'airtableAttachmentId2',
            attributes: {
              type: 'some type 2',
              url: 'some url 2',
              size: 456,
              'mime-type': 'some mime type 2',
              filename: 'some filename 2',
              'localized-challenge-id': 'challengeId456',
              alt: null,
            },
            relationships: {
              'localized-challenge': {
                data: {
                  type: 'localized-challenges',
                  id: 'challengeId456',
                },
              },
              challenge: {
                data: {
                  type: 'challenges',
                  id: 'challengeId456',
                },
              },
            },
          },
        ],
      });
      expect(airtableGetAttachmentScope.isDone()).toBe(true);
    });
  });
});
