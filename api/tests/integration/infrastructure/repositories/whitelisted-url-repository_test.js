import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as whitelistedUrlRepository from '../../../../lib/infrastructure/repositories/whitelisted-url-repository.js';

describe('Integration | Repository | whitelisted-url-repository', () => {

  describe('#listRead', () => {

    it('should retrieve active whitelisted url readmodels ordered by url', async () => {
      // given
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin' });
      const adminUser2 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 2', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser2.id,
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
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser1.id,
        deletedBy: adminUser1.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedEntityIds: 'reclbhuUTRGc1jZRL',
        comment: null,
      });
      await databaseBuilder.commit();

      // when
      const whitelistedUrls = await whitelistedUrlRepository.listRead();

      // then
      expect(whitelistedUrls).toStrictEqual([
        domainBuilder.buildReadWhitelistedUrl({
          id: 456,
          createdAt: new Date('2020-12-12'),
          updatedAt: new Date('2022-08-08'),
          creatorName: null,
          latestUpdatorName: null,
          url: 'https://www.editor.pix.fr',
          relatedEntityIds: null,
          comment: 'Mon site préféré',
        }),
        domainBuilder.buildReadWhitelistedUrl({
          id: 123,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2022-02-02'),
          creatorName: 'Madame Admin 1',
          latestUpdatorName: 'Madame Admin 2',
          url: 'https://www.google.com',
          relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
          comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        }),
      ]);
    });

    it('should return an empty array when no active whitelisted urls found', async () => {
      // given
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser1.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: new Date('2024-01-01'),
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 789,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser1.id,
        deletedBy: adminUser1.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedEntityIds: 'reclbhuUTRGc1jZRL',
        comment: null,
      });
      await databaseBuilder.commit();

      // when
      const whitelistedUrls = await whitelistedUrlRepository.listRead();

      // then
      expect(whitelistedUrls).toStrictEqual([]);
    });
  });

  describe('#find', () => {

    it('should retrieve given whitelisted url by its id', async () => {
      // given
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin' });
      const adminUser2 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 2', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser2.id,
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
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser1.id,
        deletedBy: adminUser1.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedEntityIds: 'reclbhuUTRGc1jZRL',
        comment: null,
      });
      await databaseBuilder.commit();

      // when
      const whitelistedUrl = await whitelistedUrlRepository.find(123);

      // then
      expect(whitelistedUrl).toStrictEqual(domainBuilder.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser2.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
      }));
    });

    it('should return null when no entity found for id', async () => {
      // given
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser1.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: new Date('2024-01-01'),
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 789,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser1.id,
        deletedBy: adminUser1.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedEntityIds: 'reclbhuUTRGc1jZRL',
        comment: null,
      });
      await databaseBuilder.commit();

      // when
      const whitelistedUrl = await whitelistedUrlRepository.find(777);

      // then
      expect(whitelistedUrl).toStrictEqual(null);
    });
  });

  describe('#save', function() {
    it('should update the whitelisted url', async function() {
      // given
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin' });
      const adminUser2 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 2', access: 'admin' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser2.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
      });
      await databaseBuilder.commit();
      const whitelistedUrlToSave = domainBuilder.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser2.id,
        latestUpdatedBy: adminUser2.id,
        deletedBy: adminUser2.id,
        createdAt: new Date('2022-02-02'),
        updatedAt: new Date('2023-03-03'),
        deletedAt: new Date('2024-04-04'),
        url: 'https://www.bing.com',
        relatedEntityIds: 'recABC789123',
        comment: 'Je viens de modifier le commentaire',
      });

      // when
      await whitelistedUrlRepository.save(whitelistedUrlToSave);

      // then
      const savedWhitelistedUrl = await whitelistedUrlRepository.find(123);
      expect(savedWhitelistedUrl).toStrictEqual(whitelistedUrlToSave);
    });
  });
});
