import { moduleRepository } from '../../infrastructure/repositories/index.js';

export async function listPaginatedModules({ page, sort }, dependencies = { moduleRepository }) {
  const modules = await dependencies.moduleRepository.list({ page, sort });
  const rowCount = await dependencies.moduleRepository.count();
  const meta = {
    page: page.number,
    pageSize: page.size,
    rowCount,
    pageCount: Math.ceil(rowCount / page.size),
  };

  return { modules, meta };
}
