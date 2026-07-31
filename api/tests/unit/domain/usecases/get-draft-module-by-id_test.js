import { describe, expect, it, vi } from 'vitest';

import { getDraftModuleDiff } from '../../../../lib/domain/usecases/get-draft-module-diff.js';
import { domainBuilder } from '../../../test-helper.js';
import { DraftModuleDiffError } from '../../../../lib/domain/errors.js';
import { DraftModuleDiff } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | getDraftModuleById', () => {
  it('returns draft module retrieved from repository', async () => {
    // given
    const draftModuleId = Symbol('draftModuleId');
    const moduleId = Symbol('moduleId');
    const draftModuleJSON = Symbol('draftModuleJSON');
    const moduleJSON = Symbol('moduleJSON');
    const structuredDiff = Symbol('structuredDiff');

    const draftModule = domainBuilder.buildDraftModule({ id: draftModuleId, moduleId });
    vi.spyOn(draftModule, 'serializeToJSON').mockReturnValueOnce(draftModuleJSON);

    const module = domainBuilder.buildModule({ id: moduleId });
    vi.spyOn(module, 'serializeToJSON').mockReturnValueOnce(moduleJSON);

    const draftModuleRepository = { getById: vi.fn().mockResolvedValueOnce(draftModule) };
    const moduleRepository = { getById: vi.fn().mockResolvedValueOnce(module) };

    const structuredPatch = vi.fn().mockReturnValueOnce(structuredDiff);

    // when
    const result = await getDraftModuleDiff(
      { draftModuleId },
      { draftModuleRepository, moduleRepository, structuredPatch },
    );

    // then
    expect(result).toStrictEqual(new DraftModuleDiff({
      draftModuleId,
      structuredDiff,
    }));
    expect(draftModuleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id: draftModuleId });
    expect(moduleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id: moduleId });
    expect(structuredPatch).toHaveBeenCalledExactlyOnceWith('', '', moduleJSON, draftModuleJSON);
  });

  describe('when draft module doesn’t belong to a module', () => {
    it('throws a DraftModuleDiffError', async () => {
      // given
      const draftModuleId = Symbol('draftModuleId');

      const draftModule = domainBuilder.buildDraftModule({ id: draftModuleId, moduleId: null });

      const draftModuleRepository = { getById: vi.fn().mockResolvedValueOnce(draftModule) };

      const expectedError = new DraftModuleDiffError('cannot generate diff for creation draft');

      // when
      const result = getDraftModuleDiff(
        { draftModuleId },
        { draftModuleRepository },
      );

      // then
      await expect(result).rejects.toStrictEqual(expectedError);
      expect(draftModuleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id: draftModuleId });
    });
  });
});
