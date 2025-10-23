import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as whitelistedUrlReadRepository from '../../../../lib/infrastructure/repositories/whitelisted-url-read-repository.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';

describe('Integration | Repository | whitelisted-url-read-repository', () => {
  describe('#list', () => {
    it('should retrieve active whitelisted url readmodels ordered by url', async () => {
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
      const whitelistedUrls_read = await whitelistedUrlReadRepository.list();

      // then
      expect(whitelistedUrls_read).toStrictEqual([
        domainBuilder.buildWhitelistedUrlRead({
          id: 456,
          createdAt: new Date('2020-12-12'),
          updatedAt: new Date('2022-08-08'),
          creatorName: null,
          latestUpdatorName: null,
          url: 'https://www.editor.pix.fr',
          relatedSkillNames: null,
          comment: 'Mon site préféré',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        }),
        domainBuilder.buildWhitelistedUrlRead({
          id: 123,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2022-02-02'),
          creatorName: 'Madame Admin 1',
          latestUpdatorName: 'Madame Admin 2',
          url: 'https://www.google.com',
          relatedSkillNames: '@bidule3,@chose2',
          comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
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
      const whitelistedUrls_read = await whitelistedUrlReadRepository.list();

      // then
      expect(whitelistedUrls_read).toStrictEqual([]);
    });
  });

  describe('#find', () => {
    it('should retrieve given read whitelisted url by its id', async () => {
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
      const whitelistedUrl = await whitelistedUrlReadRepository.find(123);

      // then
      expect(whitelistedUrl).toStrictEqual(
        domainBuilder.buildWhitelistedUrlRead({
          id: 123,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2022-02-02'),
          creatorName: 'Madame Admin 1',
          latestUpdatorName: 'Madame Admin 2',
          url: 'https://www.google.com',
          relatedSkillNames: '@bidule3,@chose2',
          comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        }),
      );
    });

    it('should return null when whitelisted url has been deleted', async () => {
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
      const whitelistedUrl = await whitelistedUrlReadRepository.find(789);

      // then
      expect(whitelistedUrl).toStrictEqual(null);
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
      const whitelistedUrl = await whitelistedUrlReadRepository.find(777);

      // then
      expect(whitelistedUrl).toStrictEqual(null);
    });
  });
});
