import { moduleRepository } from '../../infrastructure/repositories/index.js';
import { NotFoundError } from '../errors.js';

export async function getModulesDiff({ oldId, newId }, dependencies = { moduleRepository }) {
  const oldModule = await dependencies.moduleRepository.getById({ id: oldId });
  if (!oldModule) throw new NotFoundError();
  const newModule = await dependencies.moduleRepository.getById({ id: newId });
  if (!newModule) throw new NotFoundError();

  return oldModule.diffWith(newModule);
}
