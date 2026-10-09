import { draftModuleRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { createDraftModule } from './create-draft-module.js';
import { updateDraftModule } from './update-draft-module.js';
import { validateDraftModule } from './validate-draft-module.js';

export async function bulkUpdateDraftModules({ draftModules, updatedModuleIds }, dependencies = { draftModuleRepository, createDraftModule, updateDraftModule, validateDraftModule }) {
  return DomainTransaction.execute(async () => {
    const validatedDraftModules = [];

    for (const draftModule of draftModules) {
      const isDraftOfUpdatedModule = updatedModuleIds.includes(draftModule.moduleId);
      const savedDraftModule = isDraftOfUpdatedModule
        ? await recreateDraftModule(draftModule, dependencies)
        : await dependencies.updateDraftModule(draftModule);

      validatedDraftModules.push(await dependencies.validateDraftModule(savedDraftModule));
    }

    return validatedDraftModules;
  });
}

// Recreating the draft makes its version start from the new major version of its module (e.g. 2.1 instead of 1.4).
// Removing the draft also removes its history of draft module versions.
async function recreateDraftModule(draftModule, dependencies) {
  await dependencies.draftModuleRepository.remove({ id: draftModule.id });
  return dependencies.createDraftModule(draftModule);
}
