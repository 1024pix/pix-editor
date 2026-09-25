import Joi from 'joi';
import { z } from 'zod';

import { alternatives, forwardIssues, isPlainObject, maxItems, renderAsRegistry, requiredKeysRegistry, string, switchOn, withRequiredItem } from '../utils.js';

// TEMPORARY ADAPTER
// `@1024pix/epreuves-components` only exposes Joi schemas for custom elements props.
// This adapter converts them to Zod until the package exposes Zod schemas, then it must be removed.
// It only supports the Joi features used by the package, and throws on any other one so that
// a package upgrade relying on a new feature is detected by the tests.

const isoDateSchema = Joi.string().isoDate();

export function joiPropsToZod(joiSchema) {
  return convert(joiSchema.describe());
}

export function isRequired(joiSchema) {
  return joiSchema.describe().flags?.presence === 'required';
}

function convert(description) {
  switch (description.type) {
    case 'string':
      return convertString(description);
    case 'number':
      return convertNumber(description);
    case 'boolean':
      assertOnly(description, { flags: ['presence'] });
      return z.boolean();
    case 'array':
      return convertArray(description);
    case 'object':
      return convertObject(description);
    case 'alternatives':
      return convertAlternatives(description);
    default:
      throw unsupported(description);
  }
}

function convertString(description) {
  assertOnly(description, {
    flags: [
      'presence',
      'only',
      'empty',
    ], rules: ['isoDate'], allow: true,
  });
  const allowsEmptyString = isEmptyStringAllowed(description);
  const values = (description.allow ?? []).filter((value) => value !== '');

  if (description.flags?.only) {
    return z.enum(allowsEmptyString ? [...values, ''] : values);
  }

  let schema = string({ allowEmpty: allowsEmptyString });
  if (hasRule(description, 'isoDate')) {
    schema = schema
      .refine((value) => (allowsEmptyString && value === '') || !isoDateSchema.validate(value).error, { params: { joiType: 'string.isoDate' } })
      .meta({ format: 'date' });
  }
  return schema;
}

function convertNumber(description) {
  assertOnly(description, {
    flags: ['presence', 'default'], rules: [
      'integer',
      'min',
      'sign',
    ],
  });
  let schema = hasRule(description, 'integer') ? z.int() : z.number();
  for (const rule of description.rules ?? []) {
    if (rule.name === 'min') {
      schema = schema.min(rule.args.limit);
    } else if (rule.name === 'sign') {
      schema = rule.args.sign === 'positive' ? schema.positive() : schema.negative();
    }
  }
  return schema;
}

function convertArray(description) {
  assertOnly(description, { flags: ['presence'], rules: ['min', 'max'], items: true });
  if ((description.items ?? []).length > 1) {
    throw unsupported(description);
  }

  const [itemDescription] = description.items ?? [];
  const itemSchema = itemDescription ? convert(itemDescription) : z.any();
  let schema = z.array(itemSchema);
  if (itemDescription?.flags?.presence === 'required') {
    schema = withRequiredItem(schema);
  }
  for (const rule of description.rules ?? []) {
    if (rule.name === 'min') {
      schema = schema.min(rule.args.limit);
    } else if (rule.name === 'max') {
      schema = maxItems(schema, rule.args.limit);
    }
  }
  return schema;
}

function convertObject(description) {
  assertOnly(description, { flags: ['presence', 'unknown'], keys: true, metas: true });
  if (!description.keys) {
    throw unsupported(description);
  }

  const shape = {};
  const siblingSwitches = [];
  for (const [key, keyDescription] of Object.entries(description.keys)) {
    const siblingSwitch = getSiblingSwitch(keyDescription);
    if (siblingSwitch) {
      siblingSwitches.push({ key, ...siblingSwitch });
      shape[key] = siblingSwitch.placeholder.optional();
      continue;
    }
    const schema = convert(keyDescription);
    shape[key] = keyDescription.flags?.presence === 'required' ? schema : schema.optional();
  }

  const objectSchema = description.flags?.unknown === true ? z.looseObject(shape) : z.strictObject(shape);
  if (siblingSwitches.length === 0) {
    return objectSchema;
  }

  const refinedObjectSchema = objectSchema.superRefine(async (value, ctx) => {
    for (const { key, ref, cases, required } of siblingSwitches) {
      if (value[key] === undefined) {
        if (required) {
          ctx.addIssue({ code: 'invalid_type', expected: 'any', path: [key], input: undefined });
        }
        continue;
      }
      const matchingCase = cases.find(({ is }) => is === value[ref]);
      if (!matchingCase) {
        ctx.addIssue({ code: 'custom', path: [key], params: { joiType: 'alternatives.any' }, input: value[key] });
        continue;
      }
      await forwardIssues(ctx, matchingCase.schema, value[key], [key]);
    }
  }, { when: ({ value }) => isPlainObject(value) });

  requiredKeysRegistry.add(refinedObjectSchema, { keys: siblingSwitches.filter(({ required }) => required).map(({ key }) => key) });
  return refinedObjectSchema;
}

function convertAlternatives(description) {
  assertOnly(description, { flags: ['presence'], matches: true });
  const matches = description.matches;

  if (matches.every((match) => match.schema)) {
    return alternatives(matches.map((match) => convert(match.schema)));
  }

  if (matches.length === 1 && isOwnKeySwitch(matches[0])) {
    const [{ ref, switch: cases }] = matches;
    return switchOn(ref.path[0], cases.map((switchCase) => {
      const is = getSwitchValue(switchCase);
      if (switchCase.then.keys?.[ref.path[0]]?.allow?.[0] !== is) {
        throw unsupported(description);
      }
      return convert(switchCase.then).meta({ title: getSwitchCaseTitle(switchCase) });
    }));
  }

  throw unsupported(description);
}

// Mimics Joi's `alternatives().conditional('<sibling key>', { switch: [...] })`
function getSiblingSwitch(description) {
  if (description.type !== 'alternatives') {
    return undefined;
  }
  const [match, ...otherMatches] = description.matches;
  if (otherMatches.length > 0 || !match.switch || match.ref?.ancestor !== undefined || match.ref.path.length !== 1) {
    return undefined;
  }
  assertOnly(description, { flags: ['presence'], matches: true });

  const cases = match.switch.map((switchCase) => ({
    is: getSwitchValue(switchCase),
    schema: convert(switchCase.then).meta({ title: getSwitchCaseTitle(switchCase) }),
  }));
  const placeholder = z.any();
  renderAsRegistry.add(placeholder, { schema: z.union(cases.map(({ schema }) => schema)) });

  return { ref: match.ref.path[0], cases, placeholder, required: description.flags?.presence === 'required' };
}

function isOwnKeySwitch(match) {
  return match.switch && match.ref?.ancestor === 0 && match.ref.path.length === 1;
}

function getSwitchValue(switchCase) {
  const { is } = switchCase;
  if (is.type !== 'any' || !is.flags?.only || is.allow.length !== 2 || switchCase.otherwise) {
    throw unsupported(switchCase);
  }
  return is.allow[1];
}

function getSwitchCaseTitle(switchCase) {
  return switchCase.then.metas?.find(({ title }) => title)?.title
    ?? switchCase.then.keys?.type?.allow?.[0]
    ?? switchCase.is.allow[1];
}

function isEmptyStringAllowed(description) {
  return (description.allow ?? []).includes('') || description.flags?.empty?.allow?.[0] === '';
}

function hasRule(description, name) {
  return (description.rules ?? []).some((rule) => rule.name === name);
}

function assertOnly(description, { flags = [], rules = [], ...properties }) {
  const unsupportedFlags = Object.keys(description.flags ?? {}).filter((flag) => !flags.includes(flag));
  const unsupportedRules = (description.rules ?? []).filter(({ name }) => !rules.includes(name));
  const unsupportedProperties = Object.keys(description).filter(
    (property) => ![
      'type',
      'flags',
      'rules',
    ].includes(property) && !properties[property],
  );
  if (unsupportedFlags.length > 0 || unsupportedRules.length > 0 || unsupportedProperties.length > 0) {
    throw unsupported(description);
  }
}

function unsupported(description) {
  return new Error(`Unsupported Joi schema in custom element props: ${JSON.stringify(description)}`);
}
