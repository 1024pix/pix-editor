import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';

import { logger } from '../../infrastructure/logger.js';
import { moduleSchema } from '../../application/modules/validation/module-schema.js';
import { joiErrorParser } from '../../application/modules/joi-error-parser.js';
import { ModulesValidation } from '../models/ModulesValidation.js';

export async function validateDraftModule(draftModule, dependencies = { moduleRepository, draftModuleRepository, moduleSchema }) {
  let hasBeenValidated = true;
  const validationErrors = [];

  const draftModuleJSON = draftModule.toModuleValidation();
  const modules = await dependencies.moduleRepository.list();

  try {
    await dependencies.moduleSchema.validateAsync(draftModuleJSON, { abortEarly: false });
  } catch (joiError) {
    // `.external()` validators (HTML content check, grain business rules) can throw a plain, non-Joi
    // exception on unexpected input. When that happens, `joiError.details` is undefined: fall back to a
    // generic error instead of crashing the whole request.
    if (Array.isArray(joiError.details)) {
      validationErrors.push(...joiErrorParser.toStructuredErrors(joiError));
    } else {
      logger.error(joiError);
      validationErrors.push({
        message: 'Une erreur inattendue est survenue lors de la validation du module.',
        isSchemaError: false,
      });
    }
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
