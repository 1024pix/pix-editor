import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';

import { moduleSchema } from '../../application/modules/validation/module-schema.js';
import { joiErrorParser } from '../../application/modules/joi-error-parser.js';
import { Modules } from '../models/Modules.js';

export async function validateDraftModule(draftModule, dependencies = { moduleRepository, draftModuleRepository }) {
  let hasBeenValidated = true;
  const validationErrors = [];

  const draftModuleJSON = draftModule.toModuleValidation();
  const modules = await dependencies.moduleRepository.list();

  try {
    await moduleSchema.validateAsync(draftModuleJSON, { abortEarly: false });
  } catch (joiError) {
    validationErrors.push(
      ...joiError.details.map((errorDetail) =>
        joiErrorParser.format({
          error: { details: [errorDetail] },
          objectErrorSeparator: '',
          visualSeparator: '',
        }),
      ),
    );
    hasBeenValidated = false;
  }

  try {
    const modulesAgg = new Modules({ modules });
    modulesAgg.validateDraftModuleDoesNotHaveDuplicateIds(draftModule);
  } catch (error) {
    validationErrors.push(error.message);
    hasBeenValidated = false;
  }

  await dependencies.draftModuleRepository.updateValidationStatus({ id: draftModule.id, hasBeenValidated, validationErrors });
  return dependencies.draftModuleRepository.getById({ id: draftModule.id });
}
