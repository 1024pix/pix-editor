import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { updateDraftModule } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | update-draft-module', () => {
  const draftModuleId = Symbol('draftModuleId');
  const savedDraftModule = Symbol('savedDraftModule');

  let draftModuleRepository, existingDraftModule, update, updatePixApiReleaseCache, draftModule;

  beforeEach(() => {
    existingDraftModule = domainBuilder.buildDraftModule();

    draftModuleRepository = {
      getById: vi.fn().mockResolvedValueOnce(existingDraftModule),
      save: vi.fn().mockResolvedValueOnce(savedDraftModule),
    };

    update = vi.spyOn(existingDraftModule, 'update');

    updatePixApiReleaseCache = { onDraftModuleCreatedOrUpdated: vi.fn().mockResolvedValueOnce() };

    draftModule = domainBuilder.buildDraftModule({ id: draftModuleId });
  });

  it('prepares updates existing module and saves it', async () => {
    // when
    const result = updateDraftModule(draftModule, { draftModuleRepository, updatePixApiReleaseCache });

    // then
    await expect(result).resolves.toBe(savedDraftModule);

    expect(update).toHaveBeenCalledExactlyOnceWith(draftModule);
    expect(draftModuleRepository.save).toHaveBeenCalledExactlyOnceWith(existingDraftModule);
    expect(updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated).toHaveBeenCalledExactlyOnceWith(savedDraftModule);
  });
});
