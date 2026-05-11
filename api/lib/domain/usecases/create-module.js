import { moduleRepository } from '../../infrastructure/repositories/index.js';

/**
 *
 * @param {import('../models/index.js').Module} module
 */
export async function createModule(module, dependencies = { moduleRepository }) {
  module.prepareForCreation();
  return dependencies.moduleRepository.save(module);
}
