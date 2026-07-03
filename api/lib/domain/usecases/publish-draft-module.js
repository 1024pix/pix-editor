import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';

export async function publishDraftModule({ draftModuleId }, dependencies = { draftModuleRepository, moduleRepository }) {
  return DomainTransaction.execute(async () => {
    const draftModule = await dependencies.draftModuleRepository.getById({ id: draftModuleId, forUpdate: true });

    const module = await dependencies.moduleRepository.save(draftModule.publish());

    await dependencies.draftModuleRepository.remove({ id: draftModuleId });

    return module;
  });
}
