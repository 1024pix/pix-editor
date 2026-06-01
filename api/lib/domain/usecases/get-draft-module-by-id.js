import { draftModuleRepository } from '../../infrastructure/repositories/index.js';

export async function getDraftModuleById(id, dependencies = { draftModuleRepository }) {
  return dependencies.draftModuleRepository.getById({ id });
}
