import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createDraftModule } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | create-draft-module', () => {
  const savedDraftModule = Symbol('savedDraftModule');

  let draftModuleRepository, draftModule, prepareForCreation;

  beforeEach(() => {
    draftModuleRepository = { save: vi.fn() };

    draftModule = domainBuilder.buildDraftModule({
      id: null,
      shortId: null,
      moduleId: null,
    });
    prepareForCreation = vi.spyOn(draftModule, 'prepareForCreation');

    draftModuleRepository.save.mockResolvedValueOnce(savedDraftModule);
  });

  it('prepares module for creation and saves it', async () => {
    // when
    const result = createDraftModule(draftModule, { draftModuleRepository });

    // then
    await expect(result).resolves.toBe(savedDraftModule);

    expect(prepareForCreation).toHaveBeenCalledExactlyOnceWith();
    expect(draftModuleRepository.save).toHaveBeenCalledExactlyOnceWith(draftModule);
  });
});
