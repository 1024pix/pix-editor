import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createModule } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | create-module', () => {
  const savedModule = Symbol('savedModule');

  let moduleRepository, module, prepareForCreation;

  beforeEach(() => {
    moduleRepository = { save: vi.fn() };

    module = domainBuilder.buildModule({
      id: null,
      shortId: null,
    });
    prepareForCreation = vi.spyOn(module, 'prepareForCreation');

    moduleRepository.save.mockResolvedValueOnce(savedModule);
  });

  it('prepares module for creation and saves it', async () => {
    // when
    const result = createModule(module, { moduleRepository });

    // then
    await expect(result).resolves.toBe(savedModule);

    expect(prepareForCreation).toHaveBeenCalledExactlyOnceWith();
    expect(moduleRepository.save).toHaveBeenCalledExactlyOnceWith(module);
  });
});
