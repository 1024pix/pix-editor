import { NO_MATCHING_ALTERNATIVE } from './utils.js';

const TYPES_BY_EXPECTED = {
  string: 'string.base',
  number: 'number.base',
  int: 'number.integer',
  boolean: 'boolean.base',
  object: 'object.base',
  array: 'array.base',
};

const BLOCKING_TYPES = [
  'any.required',
  'string.empty',
  ...Object.values(TYPES_BY_EXPECTED).filter((type) => type.endsWith('.base')),
];

const MESSAGES = {
  'alternatives.any': ({ label }) => `"${label}" ne correspond à aucun des types autorisés`,
  'alternatives.match': ({ label }) => `"${label}" ne correspond à aucun des types autorisés`,
  'alternatives.types': ({ label, types }) => `"${label}" doit être l’un des types suivants : [${types.join(', ')}]`,
  'any.only': ({ label, valids }) => `"${label}" doit être ${valids.length === 1 ? '' : 'l’une des valeurs suivantes : '}[${valids.join(', ')}]`,
  'any.required': ({ label }) => `"${label}" est requis`,
  'array.includesRequiredUnknowns': ({ label, unknownMisses }) => `"${label}" ne contient pas ${unknownMisses} valeur(s) requise(s)`,
  'array.base': ({ label }) => `"${label}" doit être un tableau`,
  'array.max': ({ label, limit }) => `"${label}" doit contenir moins de ${limit} élément(s)`,
  'array.min': ({ label, limit }) => `"${label}" doit contenir au moins ${limit} élément(s)`,
  'array.unique': ({ label }) => `"${label}" contient une valeur en double`,
  'boolean.base': ({ label }) => `"${label}" doit être un booléen`,
  'number.base': ({ label }) => `"${label}" doit être un nombre`,
  'number.integer': ({ label }) => `"${label}" doit être un nombre entier`,
  'number.max': ({ label, limit }) => `"${label}" doit être inférieur ou égal à ${limit}`,
  'number.min': ({ label, limit }) => `"${label}" doit être supérieur ou égal à ${limit}`,
  'number.negative': ({ label }) => `"${label}" doit être un nombre négatif`,
  'number.positive': ({ label }) => `"${label}" doit être un nombre positif`,
  'object.base': ({ label }) => `"${label}" doit être de type object`,
  'object.missing': ({ label, peers }) => `"${label}" doit contenir au moins l’un des éléments suivants : [${peers.join(', ')}]`,
  'object.unknown': ({ label }) => `"${label}" n’est pas autorisé`,
  'string.base': ({ label }) => `"${label}" doit être une chaîne de caractères`,
  'string.empty': ({ label }) => `"${label}" ne doit pas être vide`,
  'string.guid': ({ label }) => `"${label}" doit être un GUID valide`,
  'string.isoDate': ({ label }) => `"${label}" doit être au format ISO`,
  'string.length': ({ label, limit }) => `"${label}" doit avoir une longueur de ${limit} caractères`,
  'string.max': ({ label, limit }) => `"${label}" doit avoir une longueur inférieure ou égale à ${limit} caractères`,
  'string.min': ({ label, limit }) => `"${label}" doit avoir une longueur d’au moins ${limit} caractères`,
  'string.pattern.base': ({ label, value, regex }) => `"${label}" avec la valeur ${JSON.stringify(value)} ne respecte pas le format requis : ${regex}`,
  'string.uri': ({ label }) => `"${label}" doit être une URI valide`,
  'string.uriCustomScheme': ({ label, scheme }) => `"${label}" doit être une URI valide correspondant au schéma ${scheme}`,
};

/**
 * Converts Zod issues to Joi-like error details (`{ type, message, path, context }`), with the same
 * French messages as `joi-fr-error-messages.js`, so that stored validation errors stay unchanged.
 * Like Joi, external validations (`type: 'external'`) are only reported when there is no schema error.
 * @param {import('zod').core.$ZodIssue[]} issues - issues of a parse run with `reportInput: true`
 */
export function zodIssuesToJoiDetails(issues) {
  const details = issues.flatMap((issue) => toDetails(issue));
  const schemaDetails = withoutRulesOfInvalidBaseTypes(details.filter(({ type }) => type !== 'external'));
  return schemaDetails.length > 0 ? schemaDetails : details;
}

// Joi does not run the rules of a value which base type is invalid, is missing or is an empty string
function withoutRulesOfInvalidBaseTypes(details) {
  const blockingDetails = details.filter(({ type }) => BLOCKING_TYPES.includes(type));
  const blockedLabels = new Set(blockingDetails.map(({ context }) => context.label));
  return details.filter(
    (detail) => !blockedLabels.has(detail.context.label) || blockingDetails.includes(detail) || detail.type === 'any.only',
  );
}

function toDetails(issue) {
  switch (issue.code) {
    case 'unrecognized_keys':
      return issue.keys.map((key) => detail('object.unknown', [...issue.path, key]));
    case 'invalid_union':
      return invalidUnionDetails(issue);
    case 'custom':
      return [customDetail(issue)];
    case 'invalid_value':
      return invalidValueDetails(issue);
    default:
      return [detail(joiType(issue), issue.path, joiContext(issue))];
  }
}

// Joi's `string().valid(...)` also reports the string base type errors
function invalidValueDetails(issue) {
  if (issue.input === undefined) {
    return [detail('any.required', issue.path)];
  }
  const details = [detail('any.only', issue.path, joiContext(issue))];
  if (issue.input === '') {
    details.push(detail('string.empty', issue.path, { value: issue.input }));
  } else if (typeof issue.input !== 'string') {
    details.push(detail('string.base', issue.path, { value: issue.input }));
  }
  return details;
}

// Reproduces Joi's alternatives error reporting (see `internals.errors` in joi/lib/types/alternatives.js)
function invalidUnionDetails(issue) {
  if (issue.note === 'No matching discriminator') {
    return [detail('alternatives.any', issue.path.slice(0, -1))];
  }

  const failures = issue.errors.map((optionIssues) => withoutRulesOfInvalidBaseTypes(
    optionIssues.flatMap((optionIssue) => toDetails({ ...optionIssue, path: [...issue.path, ...optionIssue.path] })),
  ));
  if (failures.length === 1) {
    return failures[0];
  }

  const types = new Set();
  const complexDetails = [];
  for (const details of failures) {
    if (details.length > 1) {
      return [detail('alternatives.match', issue.path)];
    }
    const [optionDetail] = details;
    if (optionDetail.path.length !== issue.path.length) {
      complexDetails.push(optionDetail);
    } else if (optionDetail.type === 'any.only') {
      optionDetail.context.valids.forEach((valid) => types.add(valid));
    } else if (optionDetail.type.endsWith('.base')) {
      types.add(optionDetail.type.split('.')[0]);
    } else {
      complexDetails.push(optionDetail);
    }
  }

  if (complexDetails.length === 0) {
    return [detail('alternatives.types', issue.path, { types: [...types] })];
  }
  if (complexDetails.length === 1) {
    return complexDetails;
  }
  return [detail('alternatives.match', issue.path)];
}

function customDetail(issue) {
  const { joiType: type, template, ...context } = issue.params ?? {};
  const label = formatLabel(issue.path);

  if (type === 'external') {
    return { type, message: issue.message, path: issue.path, context: { label, value: context.report ?? issue.input } };
  }
  if (template) {
    return { type, message: template.replace('{{label}}', `"${label}"`), path: issue.path, context: { label, value: issue.input } };
  }
  return detail(type, issue.path, { ...context, value: issue.input });
}

function joiType(issue) {
  switch (issue.code) {
    case 'invalid_type':
      if (issue.message === NO_MATCHING_ALTERNATIVE) {
        return NO_MATCHING_ALTERNATIVE;
      }
      if (issue.input === undefined) {
        return 'any.required';
      }
      return TYPES_BY_EXPECTED[issue.expected] ?? 'any.invalid';
    case 'invalid_format':
      return issue.format === 'regex' ? 'string.pattern.base' : 'string.base';
    case 'too_small':
      if (issue.origin === 'number') {
        return issue.inclusive ? 'number.min' : 'number.positive';
      }
      return `${issue.origin}.min`;
    case 'too_big':
      if (issue.origin === 'number') {
        return issue.inclusive ? 'number.max' : 'number.negative';
      }
      return `${issue.origin}.max`;
    default:
      return 'any.invalid';
  }
}

function joiContext(issue) {
  return {
    value: issue.input,
    limit: issue.minimum ?? issue.maximum,
    valids: issue.values?.filter((value) => value !== ''),
    regex: issue.pattern,
  };
}

function detail(type, path, context = {}) {
  const label = formatLabel(path);
  const message = MESSAGES[type]?.({ ...context, label }) ?? `"${label}" est invalide`;
  return { type, message, path, context: { ...context, label } };
}

function formatLabel(path) {
  if (path.length === 0) {
    return 'value';
  }
  return path
    .map((segment, index) => (typeof segment === 'number' ? `[${segment}]` : `${index === 0 ? '' : '.'}${segment}`))
    .join('');
}
