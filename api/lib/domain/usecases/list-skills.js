import { skillRepository } from '../../infrastructure/repositories/index.js';

export async function listSkills({ filter, page, sort }, dependencies = { skillRepository }) {
  if (filter.ids) {
    return dependencies.skillRepository.getManyByAirtableIds(filter.ids);
  }
  if (filter.name) {
    return dependencies.skillRepository.search({ filter, page, sort });
  }
  return dependencies.skillRepository.list();
}
