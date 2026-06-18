import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';

/**
 *
 * @param {import('../models/index.js').DraftModule} draftModule
 */
export async function createDraftModule(draftModule, dependencies = { draftModuleRepository, moduleRepository }) {
  const module = draftModule.moduleId
    ? await dependencies.moduleRepository.getById({ id: draftModule.moduleId })
    : undefined;

  draftModule.prepareForCreation(module);
  return dependencies.draftModuleRepository.save(draftModule);
}
