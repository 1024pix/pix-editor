import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createDraftModule } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | create-draft-module', () => {
  const savedDraftModule = Symbol('savedDraftModule');

  let draftModuleRepository, draftModule, prepareForCreation, updatePixApiReleaseCache;

  beforeEach(() => {
    draftModuleRepository = { save: vi.fn().mockResolvedValueOnce(savedDraftModule) };

    draftModule = domainBuilder.buildDraftModule({
      id: null,
      shortId: null,
    });
    prepareForCreation = vi.spyOn(draftModule, 'prepareForCreation');

    updatePixApiReleaseCache = { onDraftModuleCreated: vi.fn().mockResolvedValueOnce() };
  });

  it('prepares draft module for creation and saves it', async () => {
    // when
    const result = createDraftModule(draftModule, { draftModuleRepository, updatePixApiReleaseCache });

    // then
    await expect(result).resolves.toBe(savedDraftModule);

    expect(prepareForCreation).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(draftModuleRepository.save).toHaveBeenCalledExactlyOnceWith(draftModule);
    expect(updatePixApiReleaseCache.onDraftModuleCreated).toHaveBeenCalledExactlyOnceWith(savedDraftModule);
  });

  describe('when draft module has a moduleId', () => {
    it('prepares for creation using module', async () => {
      // given
      const module = Symbol('module');
      const moduleRepository = { getById: vi.fn().mockResolvedValueOnce(module) };

      const moduleId = Symbol('moduleId');
      draftModule.moduleId = moduleId;

      // when
      const result = createDraftModule(draftModule, { draftModuleRepository, moduleRepository, updatePixApiReleaseCache });

      // then
      await expect(result).resolves.toBe(savedDraftModule);

      expect(moduleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id: moduleId });
      expect(prepareForCreation).toHaveBeenCalledExactlyOnceWith(module);
      expect(draftModuleRepository.save).toHaveBeenCalledExactlyOnceWith(draftModule);
      expect(updatePixApiReleaseCache.onDraftModuleCreated).toHaveBeenCalledExactlyOnceWith(savedDraftModule);
    });
  });
});
