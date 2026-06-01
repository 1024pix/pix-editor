import { describe, expect, it, vi } from 'vitest';
import { getDraftModuleById } from '../../../../lib/domain/usecases/get-draft-module-by-id.js';

describe('Unit | Domain | Use Cases | getDraftModuleById', () => {
  it('returns draft module retrieved from repository', async () => {
    // given
    const id = Symbol('id');
    const draftModule = Symbol('draftModule');
    const draftModuleRepository = { getById: vi.fn().mockResolvedValueOnce(draftModule) };

    // when
    const result = await getDraftModuleById(id, { draftModuleRepository });

    // then
    expect(result).toBe(draftModule);
    expect(draftModuleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id });
  });
});
