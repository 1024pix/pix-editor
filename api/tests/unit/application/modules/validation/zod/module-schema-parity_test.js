import { describe, expect, it } from 'vitest';

import { moduleSchema as joiModuleSchema } from '../../../../../../lib/application/modules/validation/module-schema.js';
import { moduleSchema as zodModuleSchema } from '../../../../../../lib/application/modules/validation/zod/module-schema.js';
import { validateAsync } from '../../../../../../lib/application/modules/validation/zod/validate.js';
import { buildFullModule } from './full-module-fixture.js';
import { mutate } from './mutations.js';

// Compares Joi and Zod module schemas validation errors on thousands of invalid modules.
// It takes several minutes, run it with: MODULE_SCHEMA_PARITY=1 npm run test:api:unit -- module-schema-parity
const COMPONENTS_PATH = [
  'sections',
  0,
  'grains',
  0,
  'components',
];
const CUSTOM_ELEMENT_MUTATIONS = [
  'delete',
  'empty string',
  'number',
  'null',
  'string',
  'empty array',
  'empty object',
  'unknown key',
];

// Joi crashes when validating a grain without components (its external validations do not handle undefined)
const KNOWN_JOI_CRASHES = ['sections.0.grains.1.components → delete'];

describe.runIf(process.env.MODULE_SCHEMA_PARITY)('Unit | Application | Modules | Validation | Zod | Module schema parity with Joi', function() {
  it('should report the same errors as the Joi module schema', { timeout: 60 * 60 * 1000 }, async function() {
    const mismatches = [];
    for (const { name, value } of invalidModules()) {
      if (KNOWN_JOI_CRASHES.includes(name)) {
        continue;
      }
      const [joiErrors, zodErrors] = [await validateWithJoi(value), await validateWithZod(value)];
      if (JSON.stringify(joiErrors) !== JSON.stringify(zodErrors)) {
        mismatches.push({ name, joiErrors, zodErrors });
      }
    }

    expect(mismatches).to.deep.equal([]);
  });
});

function* invalidModules() {
  const module = buildFullModule();
  yield { name: 'valid module', value: module };
  yield* mutate(module, { skip: [COMPONENTS_PATH] });

  for (const component of module.sections[0].grains[0].components) {
    const moduleWithSingleComponent = structuredClone(module);
    moduleWithSingleComponent.sections[0].grains[0].components = [component];
    const mutations = component.element.type === 'custom' ? CUSTOM_ELEMENT_MUTATIONS : undefined;
    yield* mutate(moduleWithSingleComponent, { under: [...COMPONENTS_PATH, 0], mutations });
  }
}

async function validateWithJoi(value) {
  try {
    await joiModuleSchema.validateAsync(value, { abortEarly: false });
    return [];
  } catch (error) {
    return toComparableErrors(error);
  }
}

async function validateWithZod(value) {
  try {
    await validateAsync(zodModuleSchema, value);
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
