import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createDraftModule } from '../../../../lib/domain/usecases/index.js';
import { DraftModuleVersion } from '../../../../lib/domain/models/DraftModuleVersion.js';

describe('Unit | Domain | Use Cases | create-draft-module', () => {
  const structuredDiff = Symbol('structuredDiff');

  let draftModuleRepository, draftModule, prepareForCreation, savedDraftModule, updatePixApiReleaseCache, structuredPatch, draftModuleVersionRepository;

  beforeEach(() => {
    savedDraftModule = domainBuilder.buildDraftModule({
      id: Symbol('savedDraftModuleId'),
      version: Symbol('savedDraftModuleVersion'),
    });
    draftModuleRepository = { save: vi.fn().mockResolvedValueOnce(savedDraftModule) };

    draftModule = domainBuilder.buildDraftModule({
      id: null,
      shortId: null,
    });
    prepareForCreation = vi.spyOn(draftModule, 'prepareForCreation');

    updatePixApiReleaseCache = { onDraftModuleCreatedOrUpdated: vi.fn().mockResolvedValueOnce() };

    structuredPatch = vi.fn().mockReturnValueOnce(structuredDiff);

    draftModuleVersionRepository = { create: vi.fn().mockResolvedValueOnce() };
  });

  it('prepares draft module for creation and saves it', async () => {
    // when
    const result = createDraftModule(draftModule, { draftModuleRepository, updatePixApiReleaseCache });

    // then
    await expect(result).resolves.toBe(savedDraftModule);

    expect(prepareForCreation).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(draftModuleRepository.save).toHaveBeenCalledExactlyOnceWith(draftModule);
    expect(updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated).toHaveBeenCalledExactlyOnceWith(savedDraftModule);
  });

  describe('when draft module has a moduleId', () => {
    it('prepares for creation using module', async () => {
      // given
      const moduleJSON = Symbol('moduleJSON');
      const draftModuleJSON = Symbol('draftModuleJSON');
      const module = { serializeToJSON: vi.fn().mockReturnValueOnce(moduleJSON) };
      vi.spyOn(savedDraftModule, 'serializeToJSON').mockReturnValueOnce(draftModuleJSON);
      const moduleRepository = { getById: vi.fn().mockResolvedValueOnce(module) };

      const moduleId = Symbol('moduleId');
      draftModule.moduleId = moduleId;

      // when
      const result = await createDraftModule(draftModule, { draftModuleRepository, draftModuleVersionRepository, moduleRepository, updatePixApiReleaseCache, structuredPatch });

      // then
      await expect(result).toBe(savedDraftModule);

      expect(moduleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id: moduleId });
      expect(prepareForCreation).toHaveBeenCalledExactlyOnceWith(module);
      expect(draftModuleRepository.save).toHaveBeenCalledExactlyOnceWith(draftModule);
      expect(updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated).toHaveBeenCalledExactlyOnceWith(savedDraftModule);
      expect(structuredPatch).toHaveBeenCalledExactlyOnceWith('', '', moduleJSON, draftModuleJSON);
      expect(draftModuleVersionRepository.create).toHaveBeenCalledExactlyOnceWith(new DraftModuleVersion({
        draftModuleId: savedDraftModule.id,
        version: savedDraftModule.version,
        structuredDiff,
      }));
    });
  });
});
