import { draftModuleRepository } from '../../infrastructure/repositories/index.js';

/**
 *
 * @param {import('../models/index.js').Module} module
 */
export async function createDraftModule(module, dependencies = { draftModuleRepository }) {
  module.prepareForCreation();
  return dependencies.draftModuleRepository.save(module);
}
