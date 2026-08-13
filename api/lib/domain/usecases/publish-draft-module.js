import { draftModuleRepository, moduleRepository, moduleVersionRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { DraftModuleValidationError } from '../errors.js';
import { ModuleVersion } from '../models/index.js';
import { validateDraftModule } from './validate-draft-module.js';

export async function publishDraftModule({ draftModuleId }, dependencies = { draftModuleRepository, moduleRepository, moduleVersionRepository, validateDraftModule }) {
  const draftModule = await dependencies.draftModuleRepository.getById({ id: draftModuleId, forUpdate: true });

  const validatedDraftModule = await dependencies.validateDraftModule(draftModule, dependencies);
  if (!validatedDraftModule.hasBeenValidated) {
    throw new DraftModuleValidationError();
  }

  return DomainTransaction.execute(async () => {
    const module = await dependencies.moduleRepository.save(validatedDraftModule.publish());

    await dependencies.draftModuleRepository.remove({ id: draftModuleId });

    await dependencies.moduleVersionRepository.create(ModuleVersion.fromModule(module));

    return module;
  });
}
