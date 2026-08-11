import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';

import { moduleSchema } from '../../application/modules/zod-validation/module-schema.js';
import { zodErrorParser } from '../../application/modules/zod-error-parser.js';
import { ModulesValidation } from '../models/ModulesValidation.js';

export async function validateDraftModule(draftModule, dependencies = { moduleRepository, draftModuleRepository }) {
  let hasBeenValidated = true;
  const validationErrors = [];

  const draftModuleJSON = draftModule.toModuleValidation();
  const modules = await dependencies.moduleRepository.list();

  const result = await moduleSchema.safeParseAsync(draftModuleJSON);
  if (!result.success) {
    validationErrors.push(
      ...result.error.issues.map((issue) =>
        zodErrorParser.format({
          error: { issues: [issue] },
          data: draftModuleJSON,
          objectErrorSeparator: '',
          visualSeparator: '',
        }),
      ),
    );
    hasBeenValidated = false;
  }

  try {
    const modulesAgg = new ModulesValidation({ modules });
    modulesAgg.validateDraftModuleDoesNotHaveDuplicateIds(draftModule);
  } catch (error) {
    validationErrors.push(error.message);
    hasBeenValidated = false;
  }

  await dependencies.draftModuleRepository.updateValidationStatus({ id: draftModule.id, hasBeenValidated, validationErrors });
  return dependencies.draftModuleRepository.getById({ id: draftModule.id });
}
