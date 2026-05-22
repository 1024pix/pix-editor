import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { save } from '../../../../lib/infrastructure/repositories/draft-module-repository.js';

describe('Module Repository', () => {
  describe('save', () => {
    it('saves a draft module having a NULL moduleId ', async () => {
      // given
      const draftModule = domainBuilder.buildDraftModule();
      const expectedDraftModule = { ...draftModule, createdAt: expect.any(Date), updatedAt: expect.any(Date) };

      // when
      const savedDraftModule = await save({ ...draftModule });

      // then
      const { details: expectedDetails, ...expectedDraftModuleData } = expectedDraftModule;
      await expect(knex.select().from('draft-modules')).resolves.toStrictEqual([{ ...expectedDraftModuleData, ...expectedDetails }]);
      expect({ ...savedDraftModule }).toStrictEqual(expectedDraftModule);
    });

    it('saves a draft module referencing an existing module', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);

      const expectedDraftModule = { ...module, moduleId: module.id, createdAt: expect.any(Date), updatedAt: expect.any(Date) };

      await databaseBuilder.commit();

      // when
      const savedDraftModule = await save({ ...module, moduleId: module.id });

      // then
      const { details: expectedDetails, ...expectedDraftModuleData } = expectedDraftModule;
      await expect(knex.select().from('draft-modules')).resolves.toStrictEqual([{ ...expectedDraftModuleData, ...expectedDetails }]);
      expect({ ...savedDraftModule }).toStrictEqual(expectedDraftModule);
    });

    it('overrides draft module when it already exists', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);

      const updatedModule = {
        ...module,
        title: 'updated',
      };
      const expectedDraftModule = { ...updatedModule, moduleId: module.id, createdAt: expect.any(Date), updatedAt: expect.any(Date) };

      await databaseBuilder.commit();

      // when
      const savedDraftModule = await save({ ...updatedModule, moduleId: module.id });

      // then
      const { details: expectedDetails, ...expectedDraftModuleData } = expectedDraftModule;
      await expect(knex.select().from('draft-modules')).resolves.toStrictEqual([{ ...expectedDraftModuleData, ...expectedDetails }]);
      expect({ ...savedDraftModule }).toStrictEqual(expectedDraftModule);
    });
  });
});
