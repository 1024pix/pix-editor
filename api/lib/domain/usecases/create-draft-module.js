import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

/**
 *
 * @param {import('../models/index.js').DraftModule} draftModule
 */
export async function createDraftModule(draftModule, dependencies = { draftModuleRepository, moduleRepository, updatePixApiReleaseCache }) {
  const module = draftModule.moduleId
    ? await dependencies.moduleRepository.getById({ id: draftModule.moduleId })
    : undefined;

  draftModule.prepareForCreation(module);
  const savedDraftModule = await dependencies.draftModuleRepository.save(draftModule);

  await dependencies.updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated(savedDraftModule);

  return savedDraftModule;
}
