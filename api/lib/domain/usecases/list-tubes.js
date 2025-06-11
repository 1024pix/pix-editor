import { tubeRepository } from '../../infrastructure/repositories/index.js';

export async function listTubes({ filter }, dependencies = { tubeRepository }) {
  if (filter.ids) {
    return dependencies.tubeRepository.getManyByAirtableIds(filter.ids);
  }
  return dependencies.tubeRepository.list();
}
