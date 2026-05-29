import { moduleRepository } from '../../infrastructure/repositories/index.js';

export async function getModuleById(id, dependencies = { moduleRepository }) {
  return dependencies.moduleRepository.getById({ id });
}
