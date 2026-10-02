import { draftModuleRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { createDraftModule } from './create-draft-module.js';
import { updateDraftModule } from './update-draft-module.js';
import { validateDraftModule } from './validate-draft-module.js';

export async function bulkUpdateDraftModules({ draftModules, updatedModuleIds }, dependencies = { draftModuleRepository, createDraftModule, updateDraftModule, validateDraftModule }) {
  return DomainTransaction.execute(async () => {
    for (const draftModule of draftModules) {
      let savedDraftModule;
      if (updatedModuleIds.includes(draftModule.moduleId)) {
        await dependencies.draftModuleRepository.remove({ id: draftModule.id });
        savedDraftModule = await dependencies.createDraftModule(draftModule);
      } else {
        savedDraftModule = await dependencies.updateDraftModule(draftModule);
      }
      await dependencies.validateDraftModule(savedDraftModule);
    }
  });
}
