import { describe, expect, it, vi } from 'vitest';
import { getModuleById } from '../../../../lib/domain/usecases/get-module-by-id.js';

describe('Unit | Domain | Use Cases | getModuleById', () => {
  it('returns module retrieved from repository', async () => {
    // given
    const id = Symbol('id');
    const module = Symbol('module');
    const moduleRepository = { getById: vi.fn().mockResolvedValueOnce(module) };

    // when
    const result = await getModuleById(id, { moduleRepository });

    // then
    expect(result).toBe(module);
    expect(moduleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id });
  });
});
