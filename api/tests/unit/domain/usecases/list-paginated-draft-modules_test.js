import { vi, it, describe, expect } from 'vitest';
import { listPaginatedDraftModules } from '../../../../lib/domain/usecases/list-paginated-draft-modules.js';

describe('Unit | Domain | Use Cases | list-paginated-draft-modules', () => {
  it('returns data and pagination metadata', async () => {
    // given
    const page = {
      size: 10,
      number: 2,
    };
    const sort = Symbol('sort');
    const expectedPaginationMetadata = {
      page: 2,
      pageSize: 10,
      rowCount: 70,
      pageCount: 7,
    };
    const expectedData = Symbol('draft-modules');
    const draftModuleRepository = {
      list: vi.fn().mockResolvedValueOnce(expectedData),
      count: vi.fn().mockResolvedValueOnce(expectedPaginationMetadata.rowCount),
    };

    // when
    const result = await listPaginatedDraftModules({ page, sort }, { draftModuleRepository });

    // then
    expect(draftModuleRepository.list).toHaveBeenCalledExactlyOnceWith({ page, sort });
    expect(draftModuleRepository.count).toHaveBeenCalledExactlyOnceWith();
    expect(result).toStrictEqual({
      draftModules: expectedData,
      meta: expectedPaginationMetadata,
    });
  });
});
