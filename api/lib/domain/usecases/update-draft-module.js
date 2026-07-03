import { draftModuleRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

/**
 * @param {import('../models/index.js').DraftModule} draftModule
 */
export async function updateDraftModule(draftModule, dependencies = { draftModuleRepository, updatePixApiReleaseCache }) {
  const existingDraftModule = await dependencies.draftModuleRepository.getById({ id: draftModule.id });
  existingDraftModule.update(draftModule);

  const updatedDraftModule = await dependencies.draftModuleRepository.save(existingDraftModule);
  await dependencies.updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated(updatedDraftModule);
  return updatedDraftModule;
}
