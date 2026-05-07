import { vi, it, describe, expect } from 'vitest';
import { listPaginatedModules } from '../../../../lib/domain/usecases/list-paginated-modules.js';

describe('Unit | Domain | Use Cases | list-paginated-modules', () => {
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
    const expectedData = Symbol('modules');
    const moduleRepository = {
      list: vi.fn().mockResolvedValueOnce(expectedData),
      count: vi.fn().mockResolvedValueOnce(expectedPaginationMetadata.rowCount),
    };

    // when
    const result = await listPaginatedModules({ page, sort }, { moduleRepository });

    // then
    expect(moduleRepository.list).toHaveBeenCalledExactlyOnceWith({ page, sort });
    expect(moduleRepository.count).toHaveBeenCalledExactlyOnceWith();
    expect(result).toStrictEqual({
      modules: expectedData,
      meta: expectedPaginationMetadata,
    });
  });
});
