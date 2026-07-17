import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { publishDraftModule } from '../../../../lib/domain/usecases/index.js';
import { ModuleVersion } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | publish-draft-module', () => {
  const publishedModule = Symbol('publishedModule');
  const savedModule = Symbol('savedModule');
  const moduleVersion = Symbol('moduleVersion');

  let moduleRepository, draftModuleRepository, moduleVersionRepository, draftModule, publish, fromModule;

  beforeEach(() => {
    draftModule = domainBuilder.buildDraftModule();
    publish = vi.spyOn(draftModule, 'publish').mockReturnValueOnce(publishedModule);
    fromModule = vi.spyOn(ModuleVersion, 'fromModule').mockReturnValueOnce(moduleVersion);

    draftModuleRepository = { getById: vi.fn().mockResolvedValueOnce(draftModule), remove: vi.fn().mockResolvedValueOnce() };
    moduleRepository = { save: vi.fn().mockResolvedValueOnce(savedModule) };
    moduleVersionRepository = { create: vi.fn().mockResolvedValueOnce() };
  });

  it('saves draft module as a module then removes draft module', async () => {
    // when
    const result = await publishDraftModule({ draftModuleId: draftModule.id }, { draftModuleRepository, moduleRepository, moduleVersionRepository });

    // then
    expect(result).toBe(savedModule);

    expect(draftModuleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id: draftModule.id, forUpdate: true });
    expect(publish).toHaveBeenCalledExactlyOnceWith();
    expect(moduleRepository.save).toHaveBeenCalledExactlyOnceWith(publishedModule);
    expect(draftModuleRepository.remove).toHaveBeenCalledExactlyOnceWith({ id: draftModule.id });
    expect(fromModule).toHaveBeenCalledExactlyOnceWith(savedModule);
    expect(moduleVersionRepository.create).toHaveBeenCalledExactlyOnceWith(moduleVersion);
  });
});
