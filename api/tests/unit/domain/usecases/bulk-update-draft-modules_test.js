import { describe, expect, it, vi } from 'vitest';
import { bulkUpdateDraftModules } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | bulk-update-draft-modules', () => {
  describe('For creation drafts', () => {
    it('updates existing draft-module, increments minor version and saves it', async () => {
      // given
      const draftModule1 = {
        id: 1,
        version: '0.1',
      };
      const draftModule2 = {
        id: 2,
        version: '0.6',
      };

      const draftModules = [draftModule1, draftModule2];
      const draftModuleRepository = { save: vi.fn().mockImplementation(async (draftModule) => draftModule) };
      const moduleRepository = { getById: vi.fn().mockResolvedValue(undefined) };
      const draftModuleVersionRepository = { create: vi.fn() };
      const updatePixApiReleaseCache = { onDraftModuleCreatedOrUpdated: vi.fn() };

      // when
      await bulkUpdateDraftModules(draftModules, {
        draftModuleRepository,
        draftModuleVersionRepository,
        moduleRepository,
        updatePixApiReleaseCache,
      });

      // then
      expect(draftModuleRepository.save).toHaveBeenCalledTimes(2);
      expect(draftModuleVersionRepository.create).toHaveBeenCalledTimes(2);
      expect(draftModule1.version).toEqual('0.2');
      expect(draftModule2.version).toEqual('0.7');
      expect(updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated).toHaveBeenCalledTimes(2);
      expect(updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated).toHaveBeenNthCalledWith(1, draftModule1);
      expect(updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated).toHaveBeenNthCalledWith(2, draftModule2);
    });
  });

  describe('For drafts of existing modules', () => {
    it('updates existing draft-module, increments major version of the draft module, sets minor to 1 and saves it', async () => {
      // given
      const draftModule1 = {
        id: 1,
        moduleId: 2,
        version: '1.1',
      };

      const draftModules = [draftModule1];
      const draftModuleRepository = { save: vi.fn().mockImplementation(async (draftModule) => draftModule) };
      const moduleRepository = { getById: vi.fn().mockResolvedValueOnce({ id: 2, version: '2.0' }) };
      const draftModuleVersionRepository = { create: vi.fn() };
      const updatePixApiReleaseCache = { onDraftModuleCreatedOrUpdated: vi.fn() };

      // when
      await bulkUpdateDraftModules(draftModules, {
        draftModuleRepository,
        draftModuleVersionRepository,
        moduleRepository,
        updatePixApiReleaseCache,
      });

      // then
      expect(draftModuleRepository.save).toHaveBeenCalledTimes(1);
      expect(draftModuleVersionRepository.create).toHaveBeenCalledTimes(1);
      expect(moduleRepository.getById).toHaveBeenCalledTimes(1);
      expect(draftModule1.version).toEqual('2.1');
      expect(updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated).toHaveBeenCalledExactlyOnceWith(draftModule1);
    });
  });
});
