import { describe, expect, it, vi } from 'vitest';
import { bulkUpdateDraftModules } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | bulk-update-draft-modules', () => {
  it('removes drafts whose module has been updated and creates them again', async () => {
    // given
    const draftModuleRepository = { remove: vi.fn() };
    const createDraftModule = vi.fn();
    const updateDraftModule = vi.fn();

    // when
    await bulkUpdateDraftModules({ draftModules: [{ id: 'module-1', moduleId: 'module-1', version: '1.3' }], updatedModuleIds: ['module-1'] }, { draftModuleRepository, createDraftModule, updateDraftModule });

    // then
    expect(draftModuleRepository.remove).toHaveBeenCalledExactlyOnceWith({ id: 'module-1' });
    expect(createDraftModule).toHaveBeenCalledExactlyOnceWith({ id: 'module-1', moduleId: 'module-1', version: '1.3' });
    expect(updateDraftModule).not.toHaveBeenCalled();
  });

  it('updates drafts whose module has not been updated', async () => {
    // given
    const draftModuleRepository = { remove: vi.fn() };
    const createDraftModule = vi.fn();
    const updateDraftModule = vi.fn();

    // when
    await bulkUpdateDraftModules({ draftModules: [{ id: 'module-1', moduleId: 'module-1', version: '1.3' }], updatedModuleIds: ['module-2'] }, { draftModuleRepository, createDraftModule, updateDraftModule });

    // then
    expect(updateDraftModule).toHaveBeenCalledExactlyOnceWith({ id: 'module-1', moduleId: 'module-1', version: '1.3' });
    expect(draftModuleRepository.remove).not.toHaveBeenCalled();
    expect(createDraftModule).not.toHaveBeenCalled();
  });

  it('updates creation drafts', async () => {
    // given
    const draftModuleRepository = { remove: vi.fn() };
    const createDraftModule = vi.fn();
    const updateDraftModule = vi.fn();

    // when
    await bulkUpdateDraftModules({ draftModules: [{ id: 'draft-1', moduleId: null, version: '0.3' }], updatedModuleIds: ['module-1'] }, { draftModuleRepository, createDraftModule, updateDraftModule });

    // then
    expect(updateDraftModule).toHaveBeenCalledExactlyOnceWith({ id: 'draft-1', moduleId: null, version: '0.3' });
    expect(draftModuleRepository.remove).not.toHaveBeenCalled();
    expect(createDraftModule).not.toHaveBeenCalled();
  });
});
