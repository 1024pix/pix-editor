import { draftModuleRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { createDraftModule } from './create-draft-module.js';
import { updateDraftModule } from './update-draft-module.js';

export async function bulkUpdateDraftModules({ draftModules, updatedModuleIds }, dependencies = { draftModuleRepository, createDraftModule, updateDraftModule }) {
  return DomainTransaction.execute(async () => {
    for (const draftModule of draftModules) {
      if (updatedModuleIds.includes(draftModule.moduleId)) {
        await dependencies.draftModuleRepository.remove({ id: draftModule.id });
        await dependencies.createDraftModule(draftModule);
      } else {
        await dependencies.updateDraftModule(draftModule);
      }
    }
  });
}
