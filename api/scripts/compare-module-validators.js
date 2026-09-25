import { moduleSchema as joiModuleSchema } from '../lib/application/modules/validation/module-schema.js';
import { moduleSchema as zodModuleSchema } from '../lib/application/modules/validation/zod/module-schema.js';
import { validateAsync } from '../lib/application/modules/validation/zod/validate.js';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { draftModuleRepository, moduleRepository } from '../lib/infrastructure/repositories/index.js';

export class CompareModuleValidators extends Script {
  constructor() {
    super({
      description: 'Compare Joi and Zod module schemas validation results on stored modules and draft modules (read only)',
      permanent: false,
    });
  }

  async handle({ logger }, dependencies = { moduleRepository, draftModuleRepository }) {
    const modules = [...(await dependencies.moduleRepository.list()).map((module) => ({ kind: 'module', module })), ...(await dependencies.draftModuleRepository.list()).map((module) => ({ kind: 'draft-module', module }))];

    let mismatches = 0;
    for (const { kind, module } of modules) {
      const payload = toModuleValidation(module);
      const [joiErrors, zodErrors] = [await validateWithJoi(payload), await validateWithZod(payload)];
      if (JSON.stringify(joiErrors) !== JSON.stringify(zodErrors)) {
        mismatches++;
        logger.warn({ kind, id: module.id, joiErrors, zodErrors }, 'Joi and Zod validation results differ');
      }
    }

    logger.info({ total: modules.length, mismatches }, 'Comparison done');
    return { total: modules.length, mismatches };
  }
}

function toModuleValidation({ id, details, glossary, isBeta, sections, shortId, slug, title, visibility }) {
  return { id, details, glossary, isBeta, sections, shortId, slug, title, visibility };
}

async function validateWithJoi(payload) {
  try {
    await joiModuleSchema.validateAsync(payload, { abortEarly: false });
    return [];
  } catch (error) {
    return toComparableErrors(error);
  }
}

async function validateWithZod(payload) {
  try {
    await validateAsync(zodModuleSchema, payload);
    return [];
  } catch (error) {
    return toComparableErrors(error);
  }
}

function toComparableErrors(error) {
  if (!error.details) {
    return [`Unexpected error: ${error.message}`];
  }
  return error.details.map(({ type, message, context }) => {
    const isHtmlValidationError = type === 'external' && Array.isArray(context?.value?.results);
    return isHtmlValidationError ? `HTML validation error at ${context.label}` : message;
  });
}

await ScriptRunner.execute(import.meta.url, CompareModuleValidators);
