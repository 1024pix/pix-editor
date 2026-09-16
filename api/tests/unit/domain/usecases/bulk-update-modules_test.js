import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bulkUpdateModules } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | bulk-update-modules', () => {
  beforeEach(() => {
  });

  it('saves modules, increments modules major versions and saves them', async () => {
    // given
    const module1 = {
      id: 1,
      version: '1.0',
    };
    const module2 = {
      id: 2,
      version: '2.0',
    };
    const modules = [module1, module2];
    const moduleRepository = { save: vi.fn().mockImplementation(async (module) => module) };
    const moduleVersionRepository = { create: vi.fn() };

    // when
    await bulkUpdateModules(modules, {
      moduleRepository,
      moduleVersionRepository,
    });

    // then
    expect(moduleRepository.save).toHaveBeenCalledTimes(2);
    expect(moduleVersionRepository.create).toHaveBeenCalledTimes(2);
    expect(module1.version).toEqual('2.0');
    expect(module2.version).toEqual('3.0');
  });
});
