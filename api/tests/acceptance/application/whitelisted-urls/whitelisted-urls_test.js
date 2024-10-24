import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, } from '../../../test-helper.js';
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
});
