import { skillRepository } from '../../infrastructure/repositories/index.js';

export async function listSkills({ filter }, dependencies = { skillRepository }) {
  if (filter.ids) {
    return dependencies.skillRepository.getManyByAirtableIds(filter.ids);
  }
  return dependencies.skillRepository.list();
}
