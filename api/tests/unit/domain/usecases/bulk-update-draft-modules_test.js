import { describe, expect, it, vi } from 'vitest';
import { bulkUpdateDraftModules } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | bulk-update-draft-modules', () => {
  it('removes drafts whose module has been updated, creates them again and returns them validated', async () => {
    // given
    const draftModule = {
      id: 1,
      moduleId: 1,
      version: '1.3',
    };
    const createdDraftModule = Symbol('createdDraftModule');
    const draftModuleRepository = { remove: vi.fn() };
    const createDraftModuleUsecase = vi.fn().mockResolvedValue(createdDraftModule);
    const updateDraftModuleUsecase = vi.fn();
    const validatedDraftModule = Symbol('validatedDraftModule');
    const validateDraftModuleUsecase = vi.fn().mockResolvedValue(validatedDraftModule);

    // when
    const result = await bulkUpdateDraftModules({ draftModules: [draftModule], updatedModuleIds: [1] }, {
      draftModuleRepository,
      createDraftModule: createDraftModuleUsecase,
      updateDraftModule: updateDraftModuleUsecase,
      validateDraftModule: validateDraftModuleUsecase,
    });

    // then
    expect(result).toStrictEqual([validatedDraftModule]);
    expect(draftModuleRepository.remove).toHaveBeenCalledExactlyOnceWith({ id: 1 });
    expect(createDraftModuleUsecase).toHaveBeenCalledExactlyOnceWith(draftModule);
    expect(validateDraftModuleUsecase).toHaveBeenCalledExactlyOnceWith(createdDraftModule);
    expect(updateDraftModuleUsecase).not.toHaveBeenCalled();
  });

  it('updates drafts whose module has not been updated and returns them validated', async () => {
    // given
    const draftModule = {
      id: 1,
      moduleId: 1,
      version: '1.3',
    };
    const updatedDraftModule = Symbol('updatedDraftModule');
    const draftModuleRepository = { remove: vi.fn() };
    const createDraftModuleUsecase = vi.fn();
    const updateDraftModuleUsecase = vi.fn().mockResolvedValue(updatedDraftModule);
    const validatedDraftModule = Symbol('validatedDraftModule');
    const validateDraftModuleUsecase = vi.fn().mockResolvedValue(validatedDraftModule);

    // when
    const result = await bulkUpdateDraftModules({ draftModules: [draftModule], updatedModuleIds: [2] }, {
      draftModuleRepository,
      createDraftModule: createDraftModuleUsecase,
      updateDraftModule: updateDraftModuleUsecase,
      validateDraftModule: validateDraftModuleUsecase,
    });

    // then
    expect(result).toStrictEqual([validatedDraftModule]);
    expect(updateDraftModuleUsecase).toHaveBeenCalledExactlyOnceWith(draftModule);
    expect(validateDraftModuleUsecase).toHaveBeenCalledExactlyOnceWith(updatedDraftModule);
    expect(draftModuleRepository.remove).not.toHaveBeenCalled();
    expect(createDraftModuleUsecase).not.toHaveBeenCalled();
  });

  it('updates creation drafts and returns them validated', async () => {
    // given
    const creationDraftModule = {
      id: 1,
      moduleId: null,
      version: '0.3',
    };
    const updatedDraftModule = Symbol('updatedDraftModule');
    const draftModuleRepository = { remove: vi.fn() };
    const createDraftModuleUsecase = vi.fn();
    const updateDraftModuleUsecase = vi.fn().mockResolvedValue(updatedDraftModule);
    const validatedDraftModule = Symbol('validatedDraftModule');
    const validateDraftModuleUsecase = vi.fn().mockResolvedValue(validatedDraftModule);

    // when
    const result = await bulkUpdateDraftModules({ draftModules: [creationDraftModule], updatedModuleIds: [2] }, {
      draftModuleRepository,
      createDraftModule: createDraftModuleUsecase,
      updateDraftModule: updateDraftModuleUsecase,
      validateDraftModule: validateDraftModuleUsecase,
    });

    // then
    expect(result).toStrictEqual([validatedDraftModule]);
    expect(updateDraftModuleUsecase).toHaveBeenCalledExactlyOnceWith(creationDraftModule);
    expect(validateDraftModuleUsecase).toHaveBeenCalledExactlyOnceWith(updatedDraftModule);
    expect(draftModuleRepository.remove).not.toHaveBeenCalled();
    expect(createDraftModuleUsecase).not.toHaveBeenCalled();
  });
});
