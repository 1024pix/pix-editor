import { uriRegex } from '@hapi/address';
import { HtmlValidate } from 'html-validate';
import { z } from 'zod';

// Module schemas helpers.
// Module schemas were written with Joi: each helper mimics the Joi rule it replaces, both for validation
// (`params.joiType` is used to render the former Joi messages, see zod-issues-to-joi-details.js) and for
// JSON Schema generation (metadata is read by convert-zod-module-schema-to-json-schema.js).

const HTML_NOT_ALLOWED_TEMPLATE = '{{label}} failed custom validation because HTML is not allowed in this field';
const HTML_TAG_REGEX = /<.*?>/;
const GUID_REGEX = /^([[{(]?)[0-9a-f]{8}([:-]?)[0-9a-f]{4}\2?4[0-9a-f]{3}\2?[89ab][0-9a-f]{3}\2?[0-9a-f]{12}([\]})]?)$/i;
const GUID_BRACKETS = { '': '', '[': ']', '{': '}', '(': ')' };
const URI_REGEX = uriRegex().regex;

export const NO_MATCHING_ALTERNATIVE = 'alternatives.any';

/**
 * Registry holding the JSON Schema `if`/`then` conditions of schemas mimicking Joi's
 * `alternatives().conditional(condition, { then, otherwise })`.
 * @type {import('zod').ZodRegistry<{ if: object, then: import('zod').ZodType }>}
 */
export const conditionalRegistry = z.registry();

/**
 * Registry of schemas rendered as another schema in the JSON Schema, for constraints validated by a
 * parent refinement (e.g. Joi alternatives depending on a sibling key).
 * @type {import('zod').ZodRegistry<{ schema: import('zod').ZodType }>}
 */
export const renderAsRegistry = z.registry();

/**
 * Registry of object schemas keys rendered as required in the JSON Schema while being validated by a
 * parent refinement.
 * @type {import('zod').ZodRegistry<{ keys: string[] }>}
 */
export const requiredKeysRegistry = z.registry();

const htmlValidate = new HtmlValidate({
  rules: {
    'no-style-tag': 'error',
    'element-name': [
      'error',
      {
        pattern: '[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$',
        whitelist: [],
        blacklist: ['iframe'],
      },
    ],
  },
});

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function describe(schema, infoText) {
  return schema.meta({ infoText });
}

export function string({ allowEmpty = false } = {}) {
  const schema = z.string();
  if (allowEmpty) {
    return schema;
  }
  return schema.refine((value) => value !== '', { params: { joiType: 'string.empty' } });
}

export const uuidSchema = string()
  .refine(isGuid, { params: { joiType: 'string.guid' } })
  .meta({ format: 'uuid' });

export function proposalIdSchema() {
  return string().regex(/^\d+$/);
}

export function uri({ allowEmpty = false, scheme, htmlNotAllowed = false } = {}) {
  const schemeRegex = scheme ? uriRegex({ scheme }).regex : URI_REGEX;
  const joiIssue = scheme ? { joiType: 'string.uriCustomScheme', scheme } : { joiType: 'string.uri' };

  let schema = string({ allowEmpty });
  if (htmlNotAllowed) {
    schema = withHtmlNotAllowed(schema);
  }
  schema = schema.refine((value) => (allowEmpty && value === '') || schemeRegex.test(value), { params: joiIssue });

  if (allowEmpty) {
    return schema.meta({ anyOf: [{ format: 'uri' }, { maxLength: 0 }] });
  }
  return schema.meta({ format: 'uri' });
}

export function htmlNotAllowedSchema({ allowEmpty = false } = {}) {
  return withHtmlNotAllowed(string({ allowEmpty }));
}

export function htmlSchema({ allowEmpty = false } = {}) {
  return string({ allowEmpty })
    .superRefine(htmlValidation)
    .meta({ format: 'jodit' });
}

/**
 * Plain string rendered like an HTML field in the JSON Schema.
 * Content validation is delegated to a parent refinement.
 */
export function htmlLikeString() {
  return z.string().meta({ format: 'jodit' });
}

export function exactLength(schema, limit) {
  return schema.refine((value) => value.length === limit, { params: { joiType: 'string.length', limit } });
}

// Joi's `array.max` is not exposed in the JSON Schema: keep it as a refinement
export function maxItems(schema, limit) {
  return schema.refine((value) => value.length <= limit, { params: { joiType: 'array.max', limit } });
}

export function unique(schema, isDuplicate = (a, b) => a === b) {
  return schema
    .superRefine((values, ctx) => {
      values.forEach((value, index) => {
        if (values.slice(0, index).some((previous) => isDuplicate(previous, value))) {
          ctx.addIssue({ code: 'custom', path: [index], params: { joiType: 'array.unique' }, input: value });
        }
      });
    }, { when: ({ value }) => Array.isArray(value) })
    .meta({ uniqueItems: true });
}

export function external(schema, check) {
  return schema.superRefine(async (value, ctx) => {
    const message = await check(value);
    if (message) {
      ctx.addIssue({ code: 'custom', message, params: { joiType: 'external' }, input: value });
    }
  });
}

/**
 * Forwards the issues of `schema` for `value` at `path` into the current refinement context.
 */
export async function forwardIssues(ctx, schema, value, path) {
  const result = await schema.safeParseAsync(value, { reportInput: true });
  for (const issue of result.error?.issues ?? []) {
    ctx.addIssue({ ...issue, path: [...path, ...issue.path] });
  }
}

function withHtmlNotAllowed(schema) {
  return schema.refine((value) => !HTML_TAG_REGEX.test(value), { params: { joiType: 'string.pattern.invert.base', template: HTML_NOT_ALLOWED_TEMPLATE } });
}

function isGuid(value) {
  const match = GUID_REGEX.exec(value);
  return Boolean(match) && GUID_BRACKETS[match[1]] === match[3];
}

async function htmlValidation(value, ctx) {
  if (!value) {
    return;
  }

  const report = await htmlValidate.validateString(value);

  if (!report.valid) {
    ctx.addIssue({ code: 'custom', message: 'htmlvalidationerror', params: { joiType: 'external', report }, input: value });
  }
}

/**
 * Mimics Joi's `alternatives().conditional('.<discriminator>', { switch: [...] })`.
 */
export function switchOn(discriminator, options) {
  return z.discriminatedUnion(discriminator, options, { error: (issue) => (issue.code === 'invalid_type' && issue.input !== undefined ? NO_MATCHING_ALTERNATIVE : undefined) });
}

/**
 * Mimics Joi's `array().items(itemSchema.required())`: the array must contain at least one valid item.
 * Items only failing on external validations are considered valid, as Joi runs them afterwards.
 */
export function withRequiredItem(arraySchema) {
  return arraySchema.superRefine((items, ctx) => {
    ctx.addIssue({ code: 'custom', params: { joiType: 'array.includesRequiredUnknowns', unknownMisses: 1 }, input: items });
  }, { when: ({ value, issues }) => Array.isArray(value) && value.every((_, index) => hasSchemaIssue(issues, index)) });
}

function hasSchemaIssue(issues, index) {
  return issues.some(({ path, params }) => path[0] === index && params?.joiType !== 'external');
}

/**
 * Mimics Joi's `alternatives(...schemas)`: unlike `z.union`, every option is always tried and the
 * failures of all options are reported, so that errors can be rendered like Joi.
 */
export function alternatives(options) {
  const schema = z.any().superRefine(async (value, ctx) => {
    if (value === undefined) {
      return;
    }
    const errors = [];
    for (const option of options) {
      const result = await option.safeParseAsync(value, { reportInput: true });
      if (result.success) {
        return;
      }
      errors.push(result.error.issues);
    }
    ctx.addIssue({ code: 'invalid_union', errors, input: value });
  });
  renderAsRegistry.add(schema, { schema: z.union(options) });
  return schema;
}
