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
});
