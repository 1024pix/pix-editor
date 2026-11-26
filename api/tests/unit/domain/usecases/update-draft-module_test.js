import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { updateDraftModule } from '../../../../lib/domain/usecases/index.js';
import { DraftModuleVersion } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | update-draft-module', () => {
  const draftModuleId = Symbol('draftModuleId');
  const structuredDiff = Symbol('structuredDiff');
  const existingDraftModuleJSON = Symbol('existingDraftModuleJSON');
  const savedDraftModuleJSON = Symbol('savedDraftModuleJSON');
  const userId = 10;

  let draftModuleRepository, existingDraftModule, updatedDraftModule, update, savedDraftModule, updatePixApiReleaseCache, draftModule, structuredPatch, draftModuleVersionRepository;

  beforeEach(() => {
    existingDraftModule = domainBuilder.buildDraftModule();
    vi.spyOn(existingDraftModule, 'serializeToJSON').mockReturnValueOnce(existingDraftModuleJSON);

    savedDraftModule = domainBuilder.buildDraftModule({
      id: existingDraftModule.id,
      version: Symbol('savedDraftModuleVersion'),
    });
    vi.spyOn(savedDraftModule, 'serializeToJSON').mockReturnValueOnce(savedDraftModuleJSON);

    draftModuleRepository = {
      getById: vi.fn().mockResolvedValueOnce(existingDraftModule),
      save: vi.fn().mockResolvedValueOnce(savedDraftModule),
    };

    updatedDraftModule = domainBuilder.buildDraftModule({ id: existingDraftModule.id });
    update = vi.spyOn(existingDraftModule, 'update').mockReturnValueOnce(updatedDraftModule);

    updatePixApiReleaseCache = { onDraftModuleCreatedOrUpdated: vi.fn().mockResolvedValueOnce() };

    draftModule = domainBuilder.buildDraftModule({ id: draftModuleId });

    structuredPatch = vi.fn().mockReturnValueOnce(structuredDiff);

    draftModuleVersionRepository = { create: vi.fn().mockResolvedValueOnce() };
  });

  it('prepares updates existing module and saves it', async () => {
    // given
    // when
    const result = await updateDraftModule({ draftModule, userId }, { draftModuleRepository, draftModuleVersionRepository, updatePixApiReleaseCache, structuredPatch });

    // then
    await expect(result).toBe(savedDraftModule);

    expect(update).toHaveBeenCalledExactlyOnceWith(draftModule);
    expect(draftModuleRepository.save).toHaveBeenCalledExactlyOnceWith({ draftModule: updatedDraftModule });
    expect(updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated).toHaveBeenCalledExactlyOnceWith(savedDraftModule);
    expect(structuredPatch).toHaveBeenCalledExactlyOnceWith('', '', existingDraftModuleJSON, savedDraftModuleJSON);
    expect(draftModuleVersionRepository.create).toHaveBeenCalledExactlyOnceWith(new DraftModuleVersion({
      draftModuleId: savedDraftModule.id,
      version: savedDraftModule.version,
      structuredDiff,
    }));
  });

  it('saves draft module with userId as modifiedBy', async () => {
    // given
    // when
    await updateDraftModule({ draftModule, userId }, { draftModuleRepository, draftModuleVersionRepository, updatePixApiReleaseCache, structuredPatch });

    // then
    expect(draftModuleRepository.save.mock.calls[0][0].draftModule.modifiedBy).toBe(userId);
  });
});
