import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | whitelisted-urls', () => {
  describe('GET /whitelisted-urls', () => {
    let adminUser, server;
    beforeEach(async function() {
      adminUser = databaseBuilder.factory.buildUser({ name: 'Madame Admin', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser.id,
        latestUpdatedBy: adminUser.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
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
        relatedEntityIds: null,
        comment: 'Mon site préféré',
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 789,
        createdBy: adminUser.id,
        latestUpdatedBy: adminUser.id,
        deletedBy: adminUser.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedEntityIds: 'reclbhuUTRGc1jZRL',
        comment: null,
      });
      await databaseBuilder.commit();
      server = await createServer();
    });

    it('should return a 403 status code when user is not admin', async () => {
      // given
      const notAdminUser = databaseBuilder.factory.buildEditorUser();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/whitelisted-urls',
        headers: generateAuthorizationHeader(notAdminUser)
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
        headers: generateAuthorizationHeader(adminUser)
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
              'related-entity-ids': null,
              'comment': 'Mon site préféré',
            },
          },
          {
            type: 'whitelisted-urls',
            id: '123',
            attributes: {
              'created-at': new Date('2020-01-01'),
              'updated-at':new Date('2022-02-02'),
              'creator-name': 'Madame Admin',
              'latest-updator-name': 'Madame Admin',
              'url': 'https://www.google.com',
              'related-entity-ids': 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
              'comment': 'Je décide de whitelister ça car mon cousin travaille chez google',
            },
          },
        ],
      });
    });
  });
  describe('DELETE /whitelisted-urls/{whitelistedUrlId}', () => {
    let adminUser, server;
    beforeEach(async function() {
      adminUser = databaseBuilder.factory.buildUser({ name: 'Madame Admin', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser.id,
        latestUpdatedBy: adminUser.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
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
        relatedEntityIds: null,
        comment: 'Mon site préféré',
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 789,
        createdBy: adminUser.id,
        latestUpdatedBy: adminUser.id,
        deletedBy: adminUser.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedEntityIds: 'reclbhuUTRGc1jZRL',
        comment: null,
      });
      await databaseBuilder.commit();
      server = await createServer();
    });

    it('should return a 403 status code when user is not admin', async () => {
      // given
      const notAdminUser = databaseBuilder.factory.buildEditorUser();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/whitelisted-urls/123456',
        headers: generateAuthorizationHeader(notAdminUser)
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
        headers: generateAuthorizationHeader(adminUser)
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
        headers: generateAuthorizationHeader(adminUser)
      });

      // Then
      expect(response.statusCode).to.equal(404);
      expect(response.result).to.deep.equal({
        error: 'Not Found',
        message: 'L\'URL whitelistée d\'id 777 n\'existe pas',
        statusCode: 404,
      });
    });

    it('should return a 422 status code when provided whitelisted url id has already been deleted', async () => {
      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/whitelisted-urls/789',
        headers: generateAuthorizationHeader(adminUser)
      });

      // Then
      expect(response.statusCode).to.equal(422);
      expect(response.result).to.deep.equal({
        error: 'Unprocessable Entity',
        message: 'L\'URL whitelistée a déjà été supprimée',
        statusCode: 422,
      });
    });

    it('should return a 204 status code and delete the active whitelisted url given by its id', async () => {
      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/whitelisted-urls/123',
        headers: generateAuthorizationHeader(adminUser)
      });

      // Then
      const exists = await knex('whitelisted_urls').where({ id: 123 }).whereNotNull('deletedAt').first();
      expect(response.statusCode).to.equal(204);
      expect(exists.id).to.equal(123);
    });
  });
});
