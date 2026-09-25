import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';

import { moduleSchema } from '../../application/modules/validation/module-schema.js';
import { validateAsync } from '../../application/modules/validation/validate.js';
import { validationErrorParser } from '../../application/modules/validation-error-parser.js';
import { ModulesValidation } from '../models/ModulesValidation.js';

export async function validateDraftModule(draftModule, dependencies = { moduleRepository, draftModuleRepository }) {
  let hasBeenValidated = true;
  const validationErrors = [];

  const draftModuleJSON = draftModule.toModuleValidation();
  const modules = await dependencies.moduleRepository.list();

  try {
    await validateAsync(moduleSchema, draftModuleJSON);
  } catch (validationError) {
    validationErrors.push(...validationErrorParser.toStructuredErrors(validationError));
    hasBeenValidated = false;
  }

  try {
    const modulesAgg = new ModulesValidation({ modules });
    modulesAgg.validateDraftModuleDoesNotHaveDuplicateIds(draftModule);
  } catch (error) {
    validationErrors.push({ message: error.message, isSchemaError: false });
    hasBeenValidated = false;
  }

  await dependencies.draftModuleRepository.updateValidationStatus({ id: draftModule.id, hasBeenValidated, validationErrors });
  return dependencies.draftModuleRepository.getById({ id: draftModule.id });
}
