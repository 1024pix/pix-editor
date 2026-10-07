import { describe, expect, it, vi } from 'vitest';
import { bulkUpdateModules } from '../../../../lib/domain/usecases/index.js';
import { ModuleVersion } from '../../../../lib/domain/models/index.js';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Use Cases | bulk-update-modules', () => {
  it('increments major version of modules, saves them, creates their module versions and returns them', async () => {
    // given
    const module1 = domainBuilder.buildModule({
      id: 'module-1',
      shortId: 'module01',
      version: '1.0',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    const module2 = domainBuilder.buildModule({
      id: 'module-2',
      shortId: 'module02',
      version: '2.0',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    const moduleRepository = { save: vi.fn(async (module) => module) };
    const moduleVersionRepository = { create: vi.fn() };

    // when
    const result = await bulkUpdateModules([module1, module2], { moduleRepository, moduleVersionRepository });

    // then
    expect(moduleRepository.save).toHaveBeenCalledTimes(2);
    const expectedModule1 = domainBuilder.buildModule(
      {
        id: 'module-1',
        shortId: 'module01',
        version: '2.0',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    );
    const expectedModule2 = domainBuilder.buildModule(
      {
        id: 'module-2',
        shortId: 'module02',
        version: '3.0',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    );
    expect(moduleRepository.save).toHaveBeenNthCalledWith(1, expectedModule1);
    expect(moduleRepository.save).toHaveBeenNthCalledWith(2, expectedModule2);
    expect(moduleVersionRepository.create).toHaveBeenCalledTimes(2);
    expect(moduleVersionRepository.create).toHaveBeenNthCalledWith(1, ModuleVersion.fromModule(expectedModule1));
    expect(moduleVersionRepository.create).toHaveBeenNthCalledWith(2, ModuleVersion.fromModule(expectedModule2));
    expect(result).toStrictEqual([expectedModule1, expectedModule2]);
  });
});
