import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
            'localized-challenge-id': 'localizedChallenge123ES',
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: 'challengeAirtable123'
              },
            },
          },
        },
      };
    });

    afterEach(function() {
      return knex('localized_challenges-attachments').truncate();
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
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge123',
        challengeId: 'challenge123',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: validPayload.data.attributes['localized-challenge-id'],
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
        localizedChallengeId: validPayload.data.attributes['localized-challenge-id'],
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
              'challengeId': [validPayload.data.relationships.challenge.data.id],
              'localizedChallengeId': validPayload.data.attributes['localized-challenge-id'],
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableAttachment] });
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
            'localized-challenge-id': validPayload.data.attributes['localized-challenge-id'],
            alt: null,
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: validPayload.data.relationships.challenge.data.id,
              },
            },
          },
        },
      });
      expect(airtablePostAttachmentScope.isDone()).toBe(true);
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

    it('should respond with status 204', async () => {
      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId',
      });
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        localizedChallengeId: 'localizedChallengeId',
        attachmentId: 'recAttachmentId',
      });
      await databaseBuilder.commit();
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
              'deleted': true
            },
          ],
        });
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/attachments/recAttachmentId',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(204);
      expect(airtableDeleteAttachmentScope.isDone()).toBe(true);
    });
  });
});
