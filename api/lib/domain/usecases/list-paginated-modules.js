import { moduleRepository } from '../../infrastructure/repositories/index.js';

export async function listPaginatedModules({ page }, dependencies = { moduleRepository }) {
  const modules = await dependencies.moduleRepository.list({ page });
  const rowCount = await dependencies.moduleRepository.count();
  const meta = {
    page: page.number,
    pageSize: page.size,
    rowCount,
    pageCount: Math.ceil(rowCount / page.size),
  };

  return { modules, meta };
}
