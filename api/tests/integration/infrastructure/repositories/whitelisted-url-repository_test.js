import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as whitelistedUrlRepository from '../../../../lib/infrastructure/repositories/whitelisted-url-repository.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';

describe('Integration | Repository | whitelisted-url-repository', () => {
  describe('#list', () => {
    it('should retrieve all whitelisted urls ordered by url', async () => {
      // given
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin', trigram: 'MA1' });
      const adminUser2 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 2', access: 'admin', trigram: 'MA2' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser2.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedSkillNames: '@bidule3,@chose2',
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
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser1.id,
        deletedBy: adminUser1.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedSkillNames: '@ours8',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });
      await databaseBuilder.commit();

      // when
      const whitelistedUrls = await whitelistedUrlRepository.list();

      // then
      expect(whitelistedUrls).toStrictEqual([
        domainBuilder.buildWhitelistedUrl({
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
        }),
        domainBuilder.buildWhitelistedUrl({
          id: 123,
          createdBy: adminUser1.id,
          latestUpdatedBy: adminUser2.id,
          deletedBy: null,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2022-02-02'),
          deletedAt: null,
          url: 'https://www.google.com',
          relatedSkillNames: '@bidule3,@chose2',
          comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        }),
        domainBuilder.buildWhitelistedUrl({
          id: 789,
          createdBy: adminUser1.id,
          latestUpdatedBy: adminUser1.id,
          deletedBy: adminUser1.id,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2022-02-02'),
          deletedAt: new Date('2023-01-01'),
          url: 'https://www.les-fruits-c-super-bon',
          relatedSkillNames: '@ours8',
          comment: null,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        }),
      ]);
    });

    it('should return an empty array when no whitelisted url in database', async () => {
      // when
      const whitelistedUrls = await whitelistedUrlRepository.list();

      // then
      expect(whitelistedUrls).toStrictEqual([]);
    });
  });

  describe('#find', () => {
    it('should retrieve given whitelisted url by its id', async () => {
      // given
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin', trigram: 'MA1' });
      const adminUser2 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 2', access: 'admin', trigram: 'MA2' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser2.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedSkillNames: '@bidule3,@chose2',
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
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser1.id,
        deletedBy: adminUser1.id,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: new Date('2023-01-01'),
        url: 'https://www.les-fruits-c-super-bon',
        relatedSkillNames: '@ours8',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });
      await databaseBuilder.commit();

      // when
      const whitelistedUrl = await whitelistedUrlRepository.find(123);

      // then
      expect(whitelistedUrl).toStrictEqual(
        domainBuilder.buildWhitelistedUrl({
          id: 123,
          createdBy: adminUser1.id,
          latestUpdatedBy: adminUser2.id,
          deletedBy: null,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2022-02-02'),
          deletedAt: null,
          url: 'https://www.google.com',
          relatedSkillNames: '@bidule3,@chose2',
          comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        }),
      );
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
        relatedSkillNames: '@bidule3,@chose2',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
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
        relatedSkillNames: '@ours8',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin', trigram: 'MA1' });
      const adminUser2 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 2', access: 'admin', trigram: 'MA2' });
      databaseBuilder.factory.buildWhitelistedUrl({
        id: 123,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser2.id,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedSkillNames: '@bidule3,@chose2',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
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
        relatedSkillNames: '@morse8',
        comment: 'Je viens de modifier le commentaire',
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });

      // when
      await whitelistedUrlRepository.save(whitelistedUrlToSave);

      // then
      const savedWhitelistedUrl = await whitelistedUrlRepository.find(123);
      expect(savedWhitelistedUrl).toStrictEqual(whitelistedUrlToSave);
    });

    it('should insert a new whitelisted url', async function() {
      // given
      const adminUser1 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 1', access: 'admin', trigram: 'MA1' });
      const adminUser2 = databaseBuilder.factory.buildUser({ name: 'Madame Admin 2', access: 'admin', trigram: 'MA2' });
      await databaseBuilder.commit();
      const whitelistedUrlToSave = domainBuilder.buildWhitelistedUrl({
        id: null,
        createdBy: adminUser1.id,
        latestUpdatedBy: adminUser2.id,
        deletedBy: adminUser2.id,
        createdAt: new Date('2022-02-02'),
        updatedAt: new Date('2023-03-03'),
        deletedAt: new Date('2024-04-04'),
        url: 'https://www.bing.com',
        relatedSkillNames: '@morse8',
        comment: 'Je viens de créer cette entrée',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });

      // when
      const id = await whitelistedUrlRepository.save(whitelistedUrlToSave);

      // then
      const savedWhitelistedUrl = await whitelistedUrlRepository.find(id);
      expect(savedWhitelistedUrl).toStrictEqual(
        domainBuilder.buildWhitelistedUrl({
          ...whitelistedUrlToSave,
          id,
        }),
      );
    });
  });
});
