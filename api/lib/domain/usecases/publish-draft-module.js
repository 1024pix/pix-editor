import { draftModuleRepository, moduleRepository, moduleVersionRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { ModuleVersion } from '../models/index.js';

export async function publishDraftModule({ draftModuleId }, dependencies = { draftModuleRepository, moduleRepository, moduleVersionRepository }) {
  return DomainTransaction.execute(async () => {
    const draftModule = await dependencies.draftModuleRepository.getById({ id: draftModuleId, forUpdate: true });

    const module = await dependencies.moduleRepository.save(draftModule.publish());

    await dependencies.draftModuleRepository.remove({ id: draftModuleId });

    await dependencies.moduleVersionRepository.create(ModuleVersion.fromModule(module));

    return module;
  });
}
