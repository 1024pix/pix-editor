import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';

export async function validateDraftModule(draftModule, dependencies = { moduleRepository, draftModuleRepository }) {
  const modules = await dependencies.moduleRepository.list();
  const { validationStatus: hasBeenValidated, validationErrors } = await draftModule.validate({ modules });

  await dependencies.draftModuleRepository.updateValidationStatus({ id: draftModule.id, hasBeenValidated, validationErrors });
  return dependencies.draftModuleRepository.getById({ id: draftModule.id });
}
