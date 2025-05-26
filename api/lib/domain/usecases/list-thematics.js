import { thematicRepository } from '../../infrastructure/repositories/index.js';

export async function listThematics({ filter }, dependencies = { thematicRepository }) {
  if (filter.ids) {
    return dependencies.thematicRepository.getManyByAirtableIds(filter.ids);
  }
  return dependencies.thematicRepository.list();
}
