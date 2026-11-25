import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as moduleVersionRepository from '../../../../lib/infrastructure/repositories/module-version-repository.js';
import { ModuleVersion } from '../../../../lib/domain/models/index.js';

describe('Module Version Repository', () => {
  describe('create', () => {
    it('saves a new module version to database and returns it', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);
      await databaseBuilder.commit();

      const moduleVersion = ModuleVersion.fromModule(module);
      const expectedCreatedModuleVersion = new ModuleVersion({
        ...moduleVersion,
        publishedBy: null,
        id: expect.any(Number),
        createdAt: expect.any(Date),
      });

      // when
      await moduleVersionRepository.create(moduleVersion);

      // then
      const { details: expectedDetails, ...expectedCreatedModuleVersionData } = expectedCreatedModuleVersion;
      await expect(knex.select().from('module-versions')).resolves.toStrictEqual([{ ...expectedCreatedModuleVersionData, ...expectedDetails }]);
    });
  });

  describe('getPublishedBy', () => {
    it('returns the id of the user who published the given version of the module', async () => {
      // given
      const user = databaseBuilder.factory.buildUser({ name: 'User', access: 'editor' });
      const otherUser = databaseBuilder.factory.buildUser({ name: 'Other user', access: 'editor', trigram: 'OTH' });
      const module = domainBuilder.buildModule({ version: '2.0' });
      databaseBuilder.factory.buildModule(module);
      databaseBuilder.factory.buildModuleVersion({ ...ModuleVersion.fromModule({ ...module, version: '1.0' }), publishedBy: otherUser.id });
      databaseBuilder.factory.buildModuleVersion({ ...ModuleVersion.fromModule(module), publishedBy: user.id });
      await databaseBuilder.commit();

      // when
      const publishedBy = await moduleVersionRepository.getPublishedBy({ moduleId: module.id, version: '2.0' });

      // then
      expect(publishedBy).toBe(user.id);
    });

    it('returns null when the module version does not exist', async () => {
      // given
      const module = domainBuilder.buildModule({ version: '2.0' });
      databaseBuilder.factory.buildModule(module);
      await databaseBuilder.commit();

      // when
      const publishedBy = await moduleVersionRepository.getPublishedBy({ moduleId: module.id, version: '2.0' });

      // then
      expect(publishedBy).toBeNull();
    });
  });
});
