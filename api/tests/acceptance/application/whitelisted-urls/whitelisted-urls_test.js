import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';

describe('Acceptance | Controller | whitelisted-urls', () => {let now;
  beforeEach(function() {
    now = new Date('2024-10-29T03:04:00Z');
    vi.useFakeTimers({
      now,
      toFake: ['Date'],
    });
  });

  afterEach(function() {
    vi.useRealTimers();
    return knex('whitelisted_urls').del();
  });

  describe('GET /whitelisted-urls', () => {
    let editorUser, server;
    beforeEach(async function() {
      editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'editor' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedSkillNames: '@morse2,@saumon5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 456,
        createdBy: null,
        latestUpdatedBy: null,
        deletedBy: null,
        createdAt: new Date('2020-12-12'),
        updatedAt: new Date('2022-08-08'),
        deletedAt: null,
        url: 'https://www.editor.pix.fr',
        relatedSkillNames: null,
        comment: 'Mon site préféré',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 789,
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        deletedBy: editorUser.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedSkillNames: '@truite2',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      await databaseBuilder.commit();
      server = await createServer();
    });

    it('should return a 403 status code when user is not editor', async () => {
      // given
      const notEditorUser = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/whitelisted-urls',
        headers: generateAuthorizationHeader(notEditorUser)
      });

      // Then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal({
        errors: [
          {
            code: 403,
            detail: 'Missing or insufficient permissions.',
            title: 'Forbidden access',
          },
        ],
      });
    });

    it('should return the active whitelisted urls', async () => {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/whitelisted-urls',
        headers: generateAuthorizationHeader(editorUser)
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            type: 'whitelisted-urls',
            id: '456',
            attributes: {
              'created-at': new Date('2020-12-12'),
              'updated-at': new Date('2022-08-08'),
              'creator-name': null,
              'latest-updator-name': null,
              'url': 'https://www.editor.pix.fr',
              'related-skill-names': null,
              'comment': 'Mon site préféré',
              'check-type': 'exact_match',
            },
          },
          {
            type: 'whitelisted-urls',
            id: '123',
            attributes: {
              'created-at': new Date('2020-01-01'),
              'updated-at':new Date('2022-02-02'),
              'creator-name': 'Madame Editor',
              'latest-updator-name': 'Madame Editor',
              'url': 'https://www.google.com',
              'related-skill-names': '@morse2,@saumon5',
              'comment': 'Je décide de whitelister ça car mon cousin travaille chez google',
              'check-type': 'starts_with',
            },
          },
        ],
      });
    });
  });
  describe('DELETE /whitelisted-urls/{whitelistedUrlId}', () => {
    let editorUser, server;
    beforeEach(async function() {
      editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedSkillNames: '@morse2,@saumon5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 456,
        createdBy: null,
        latestUpdatedBy: null,
        deletedBy: null,
        createdAt: new Date('2020-12-12'),
        updatedAt: new Date('2022-08-08'),
        deletedAt: null,
        url: 'https://www.editor.pix.fr',
        relatedSkillNames: null,
        comment: 'Mon site préféré',
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 789,
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        deletedBy: editorUser.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedSkillNames: '@truite2',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });
      await databaseBuilder.commit();
      server = await createServer();
    });

    it('should return a 403 status code when user is not editor', async () => {
      // given
      const notEditorUser = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/whitelisted-urls/123456',
        headers: generateAuthorizationHeader(notEditorUser)
      });

      // Then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal({
        errors: [
          {
            code: 403,
            detail: 'Missing or insufficient permissions.',
            title: 'Forbidden access',
          },
        ],
      });
    });

    it('should return a 400 status code when provided whitelisted url id is not in the right format', async () => {
      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/whitelisted-urls/coucoumaman',
        headers: generateAuthorizationHeader(editorUser)
      });

      // Then
      expect(response.statusCode).to.equal(400);
      expect(response.result).to.deep.equal({
        error: 'Bad Request',
        message: 'Invalid request params input',
        statusCode: 400,
      });
    });

    it('should return a 404 status code when provided whitelisted url id does not exist', async () => {
      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/whitelisted-urls/777',
        headers: generateAuthorizationHeader(editorUser)
      });

      // Then
      expect(response.statusCode).to.equal(404);
      expect(response.result).to.deep.equal({
        errors: [
          {
            status: '404',
            title: 'Not Found',
            detail: 'L\'URL d\'id 777 n\'existe pas',
          },
        ],
      });
    });

    it('should return a 409 status code when provided whitelisted url id has already been deleted', async () => {
      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/whitelisted-urls/789',
        headers: generateAuthorizationHeader(editorUser)
      });

      // Then
      expect(response.statusCode).to.equal(409);
      expect(response.result).to.deep.equal({
        errors: [
          {
            status: '409',
            title: 'Conflict',
            detail: 'L\'URL a déjà été supprimée',
          },
        ],
      });
    });

    it('should return a 204 status code and delete the active whitelisted url given by its id', async () => {
      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/whitelisted-urls/123',
        headers: generateAuthorizationHeader(editorUser)
      });

      // Then
      const exists = await knex('whitelisted_urls').where({ id: 123 }).whereNotNull('deletedAt').first();
      expect(response.statusCode).to.equal(204);
      expect(exists.id).to.equal(123);
    });
  });
  describe('POST /whitelisted-urls', () => {
    let editorUser, server, validPayload;
    beforeEach(async function() {
      editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedSkillNames: '@morse2,@saumon5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 456,
        createdBy: null,
        latestUpdatedBy: null,
        deletedBy: null,
        createdAt: new Date('2020-12-12'),
        updatedAt: new Date('2022-08-08'),
        deletedAt: null,
        url: 'https://www.editor.pix.fr',
        relatedSkillNames: null,
        comment: 'Mon site préféré',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 789,
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        deletedBy: editorUser.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedSkillNames: '@truite2',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      await databaseBuilder.commit();
      server = await createServer();
      validPayload = {
        data: {
          attributes: {
            url: 'https://super-casserole.com',
            'related-skill-names': '@feutre2,@crayon1',
            comment: 'Un super commentaire',
            'check-type': WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
          },
        },
      };
    });

    it('should return a 403 status code when user is not editor', async () => {
      // given
      const notEditorUser = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/whitelisted-urls',
        headers: generateAuthorizationHeader(notEditorUser),
        payload: validPayload,
      });

      // Then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal({
        errors: [
          {
            code: 403,
            detail: 'Missing or insufficient permissions.',
            title: 'Forbidden access',
          },
        ],
      });
    });

    it('should return a 422 status code when creation command in invalid', async () => {
      // when
      const invalidPayload = JSON.parse(JSON.stringify(validPayload));
      invalidPayload.data.attributes.url = 'je ne suis pas une bonne url';
      const response = await server.inject({
        method: 'POST',
        url: '/api/whitelisted-urls',
        headers: generateAuthorizationHeader(editorUser),
        payload: invalidPayload,
      });

      // Then
      expect(response.statusCode).to.equal(422);
      expect(response.result).to.deep.equal({
        errors: [
          {
            status: '422',
            title: 'Unprocessable entity',
            detail: 'URL invalide',
            source: { pointer: '/data/attributes/url' },
          },
        ],
      });
    });

    it('should return a 201 status code and the serialized created whitelisted url', async () => {
      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/whitelisted-urls',
        headers: generateAuthorizationHeader(editorUser),
        payload: validPayload,
      });

      // Then
      expect(response.statusCode).to.equal(201);
      const [id] = await knex('whitelisted_urls').pluck('id').where('createdAt', now);
      expect(response.result).toStrictEqual({
        data: {
          type: 'whitelisted-urls',
          id: id.toString(),
          attributes: {
            'created-at': now,
            'updated-at': now,
            'creator-name': 'Madame Editor',
            'latest-updator-name': 'Madame Editor',
            url: 'https://super-casserole.com',
            'related-skill-names': '@feutre2,@crayon1',
            comment: 'Un super commentaire',
            'check-type': 'exact_match',
          },
        },
      });
    });
  });
  describe('PATCH /whitelisted-urls/{whitelistedUrlId}', () => {
    let editorUser, server, validPayload;
    beforeEach(async function() {
      editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedSkillNames: '@morse2,@saumon5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 456,
        createdBy: null,
        latestUpdatedBy: null,
        deletedBy: null,
        createdAt: new Date('2020-12-12'),
        updatedAt: new Date('2022-08-08'),
        deletedAt: null,
        url: 'https://www.editor.pix.fr',
        relatedSkillNames: null,
        comment: 'Mon site préféré',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 789,
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        deletedBy: editorUser.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedSkillNames: '@truite2',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      await databaseBuilder.commit();
      server = await createServer();
      validPayload = {
        data: {
          attributes: {
            url: 'https://super-casserole.com',
            'related-skill-names': '@feutre2,@crayon1',
            comment: 'Un super commentaire',
            'check-type': 'starts_with',
          },
        },
      };
    });

    it('should return a 403 status code when user is not editor', async () => {
      // given
      const notEditorUser = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/whitelisted-urls/456',
        headers: generateAuthorizationHeader(notEditorUser),
        payload: validPayload,
      });

      // Then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal({
        errors: [
          {
            code: 403,
            detail: 'Missing or insufficient permissions.',
            title: 'Forbidden access',
          },
        ],
      });
    });

    it('should return a 422 status code when update command in invalid', async () => {
      // when
      const invalidPayload = JSON.parse(JSON.stringify(validPayload));
      invalidPayload.data.attributes.url = 'je ne suis pas une bonne url';
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/whitelisted-urls/456',
        headers: generateAuthorizationHeader(editorUser),
        payload: invalidPayload,
      });

      // Then
      expect(response.statusCode).to.equal(422);
      expect(response.result).to.deep.equal({
        errors: [
          {
            status: '422',
            title: 'Unprocessable entity',
            detail: 'URL invalide',
            source: { pointer: '/data/attributes/url' },
          },
        ],
      });
    });

    it('should return a 200 status code and the serialized updated whitelisted url', async () => {
      // when
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/whitelisted-urls/456',
        headers: generateAuthorizationHeader(editorUser),
        payload: validPayload,
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).toStrictEqual({
        data: {
          type: 'whitelisted-urls',
          id: '456',
          attributes: {
            'created-at': new Date('2020-12-12'),
            'updated-at': now,
            'creator-name': null,
            'latest-updator-name': 'Madame Editor',
            url: 'https://super-casserole.com',
            'related-skill-names': '@feutre2,@crayon1',
            comment: 'Un super commentaire',
            'check-type': 'starts_with',
          },
        },
      });
    });
  });
});
