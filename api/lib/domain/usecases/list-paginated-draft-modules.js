import { draftModuleRepository } from '../../infrastructure/repositories/index.js';

export async function listPaginatedDraftModules({ page, sort }, dependencies = { draftModuleRepository }) {
  const draftModules = await dependencies.draftModuleRepository.list({ page, sort });
  const rowCount = await dependencies.draftModuleRepository.count();
  const meta = {
    page: page.number,
    pageSize: page.size,
    rowCount,
    pageCount: Math.ceil(rowCount / page.size),
  };

  return { draftModules, meta };
}
