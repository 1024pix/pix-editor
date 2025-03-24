import { skillRepository } from '../../infrastructure/repositories/index.js';

export async function listSkills({ filter, page, sort }, dependencies = { skillRepository }) {
  if (filter.ids) {
    return dependencies.skillRepository.getManyByAirtableIds(filter.ids);
  }
  if (filter.name) {
    return dependencies.skillRepository.search({ filter, page, sort });
  }
  if (filter.pixId) {
    const skill = await dependencies.skillRepository.get(filter.pixId);
    return skill ? [skill] : [];
  }
  return dependencies.skillRepository.list();
}
