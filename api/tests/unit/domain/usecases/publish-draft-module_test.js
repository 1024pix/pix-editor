import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { publishDraftModule } from '../../../../lib/domain/usecases/index.js';
import { DraftModuleValidationError } from '../../../../lib/domain/errors.js';
import { ModuleVersion } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | publish-draft-module', () => {
  const publishedModule = Symbol('publishedModule');
  const savedModule = Symbol('savedModule');
  const moduleVersion = Symbol('moduleVersion');

  let moduleRepository, draftModuleRepository, moduleVersionRepository, draftModule, validatedDraftModule, publish, fromModule, validateDraftModule;

  beforeEach(() => {
    draftModule = domainBuilder.buildDraftModule();
    validatedDraftModule = domainBuilder.buildDraftModule({ hasBeenValidated: true, validationErrors: [] });
    publish = vi.spyOn(validatedDraftModule, 'publish').mockReturnValueOnce(publishedModule);
    fromModule = vi.spyOn(ModuleVersion, 'fromModule').mockReturnValueOnce(moduleVersion);

    draftModuleRepository = { getById: vi.fn().mockResolvedValueOnce(draftModule), remove: vi.fn().mockResolvedValueOnce() };
    moduleRepository = { save: vi.fn().mockResolvedValueOnce(savedModule) };
    moduleVersionRepository = { create: vi.fn().mockResolvedValueOnce() };

    validateDraftModule = vi.fn().mockResolvedValueOnce(validatedDraftModule);
  });

  it('validates the draft module, then saves it as a module and removes the draft module', async () => {
    // when
    const dependencies = { draftModuleRepository, moduleRepository, moduleVersionRepository, validateDraftModule };
    const result = await publishDraftModule({ draftModuleId: draftModule.id }, dependencies);

    // then
    expect(result).toBe(savedModule);

    expect(draftModuleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id: draftModule.id, forUpdate: true });
    expect(validateDraftModule).toHaveBeenCalledExactlyOnceWith(draftModule, dependencies);
    expect(publish).toHaveBeenCalledExactlyOnceWith();
    expect(moduleRepository.save).toHaveBeenCalledExactlyOnceWith(publishedModule);
    expect(draftModuleRepository.remove).toHaveBeenCalledExactlyOnceWith({ id: draftModule.id });
    expect(fromModule).toHaveBeenCalledExactlyOnceWith(savedModule);
    expect(moduleVersionRepository.create).toHaveBeenCalledExactlyOnceWith(moduleVersion);
  });

  it('throws a DraftModuleValidationError and does not publish when the draft module is invalid', async () => {
    // given
    const invalidatedDraftModule = domainBuilder.buildDraftModule({ hasBeenValidated: false, validationErrors: ['error'] });
    validateDraftModule.mockReset().mockResolvedValueOnce(invalidatedDraftModule);

    // when
    const error = await publishDraftModule(
      { draftModuleId: draftModule.id },
      { draftModuleRepository, moduleRepository, moduleVersionRepository, validateDraftModule },
    ).catch((error) => error);

    // then
    expect(error).toBeInstanceOf(DraftModuleValidationError);
    expect(moduleRepository.save).not.toHaveBeenCalled();
    expect(draftModuleRepository.remove).not.toHaveBeenCalled();
  });
});
