import { z } from 'zod';

import { conditionalRegistry, renderAsRegistry, requiredKeysRegistry } from '../../application/modules/validation/utils.js';

/**
 * Converts a module Zod schema to the JSON Schema consumed by Modulix Editor.
 * `z.toJSONSchema` does the conversion, the override only applies the editor's conventions:
 * - `options.infoText` holds the field description, `options` and `format` are always present
 * - array items are titled after their property name (JSON Editor dynamic headers)
 * - JSON Schema keywords not supported by the editor are omitted
 */
export function convertZodModuleSchemaToJsonSchema(zodSchema) {
  const jsonSchema = z.toJSONSchema(zodSchema, {
    target: 'draft-07',
    io: 'output',
    unrepresentable: 'throw',
    override: applyEditorConventions,
  });
  Reflect.deleteProperty(jsonSchema, '$schema');
  return jsonSchema;
}

function applyEditorConventions({ zodSchema, jsonSchema, path }) {
  const renderAs = renderAsRegistry.get(zodSchema);
  if (renderAs) {
    Object.assign(jsonSchema, convertZodModuleSchemaToJsonSchema(renderAs.schema));
  }

  const conditional = conditionalRegistry.get(zodSchema);
  if (conditional) {
    jsonSchema.if = conditional.if;
    jsonSchema.then = { properties: convertZodModuleSchemaToJsonSchema(conditional.then).properties };
  }

  const requiredKeys = requiredKeysRegistry.get(zodSchema)?.keys;
  if (requiredKeys) {
    const required = new Set([...(jsonSchema.required ?? []), ...requiredKeys]);
    jsonSchema.required = Object.keys(jsonSchema.properties).filter((key) => required.has(key));
  }

  if (Array.isArray(jsonSchema.type)) {
    throw new Error(`Unsupported JSON Schema type ${jsonSchema.type} at ${path.join('.')}`);
  }

  if (zodSchema._zod.def.type === 'union' && jsonSchema.anyOf) {
    jsonSchema.oneOf = jsonSchema.anyOf;
    Reflect.deleteProperty(jsonSchema, 'anyOf');
  }

  switch (jsonSchema.type) {
    case 'boolean':
      keepOnly(jsonSchema, ['type']);
      break;
    case 'string':
      applyStringConventions(jsonSchema);
      break;
    case 'number':
    case 'integer':
      applyNumberConventions(jsonSchema);
      break;
    case 'array':
      applyArrayConventions(jsonSchema, path);
      break;
    case 'object':
      applyObjectConventions(jsonSchema);
      break;
    default:
      Reflect.deleteProperty(jsonSchema, 'infoText');
  }
}

function applyStringConventions(jsonSchema) {
  if (jsonSchema.format) {
    // Zod adds its own validation pattern to formats (uuid, email, date…)
    Reflect.deleteProperty(jsonSchema, 'pattern');
  }
  if (jsonSchema.anyOf === undefined) {
    jsonSchema.format ??= null;
  }
  if (jsonSchema.enum) {
    jsonSchema.enum = jsonSchema.enum.filter((value) => value !== '');
  }
  if (jsonSchema.pattern !== undefined) {
    jsonSchema.pattern = jsonSchema.pattern.replace(/\\d/g, '[0-9]');
  }
  moveInfoTextToOptions(jsonSchema);
}

function applyNumberConventions(jsonSchema) {
  if (jsonSchema.minimum === Number.MIN_SAFE_INTEGER) {
    Reflect.deleteProperty(jsonSchema, 'minimum');
  }
  if (jsonSchema.maximum === Number.MAX_SAFE_INTEGER) {
    Reflect.deleteProperty(jsonSchema, 'maximum');
  }
  if (jsonSchema.exclusiveMinimum === 0) {
    Reflect.deleteProperty(jsonSchema, 'exclusiveMinimum');
    jsonSchema.minimum = 1;
  }
  if (jsonSchema.exclusiveMaximum === 0) {
    Reflect.deleteProperty(jsonSchema, 'exclusiveMaximum');
    jsonSchema.maximum = -1;
  }
  moveInfoTextToOptions(jsonSchema);
}

function applyArrayConventions(jsonSchema, path) {
  if (isAnySchema(jsonSchema.items)) {
    Reflect.deleteProperty(jsonSchema, 'items');
  }

  const key = path.at(-2) === 'properties' ? String(path.at(-1)) : '';
  const itemTitle = key.endsWith('s') ? key.slice(0, -1) : key;
  if (itemTitle && jsonSchema.items) {
    // Add headerTemplate for JSON Editor lib
    // See {@link https://github.com/json-editor/json-editor#dynamic-headers}
    jsonSchema.items = { ...jsonSchema.items, title: itemTitle, headerTemplate: `${itemTitle} {{i0}}` };
  }

  moveInfoTextToOptions(jsonSchema);
}

function applyObjectConventions(jsonSchema) {
  if (jsonSchema.properties) {
    jsonSchema.additionalProperties = jsonSchema.additionalProperties === false ? false : true;
  }
  for (const [key, property] of Object.entries(jsonSchema.properties ?? {})) {
    if (isAnySchema(property)) {
      Reflect.deleteProperty(jsonSchema.properties, key);
    }
  }
  if (jsonSchema.properties && Object.keys(jsonSchema.properties).length === 0) {
    Reflect.deleteProperty(jsonSchema, 'properties');
  }
  Reflect.deleteProperty(jsonSchema, 'infoText');
}

function moveInfoTextToOptions(jsonSchema) {
  if (jsonSchema.infoText !== undefined) {
    jsonSchema.options = { infoText: jsonSchema.infoText };
    Reflect.deleteProperty(jsonSchema, 'infoText');
  }
  jsonSchema.options ??= null;
}

function keepOnly(jsonSchema, keys) {
  for (const key of Object.keys(jsonSchema)) {
    if (!keys.includes(key)) {
      Reflect.deleteProperty(jsonSchema, key);
    }
  }
}

function isAnySchema(jsonSchema) {
  return jsonSchema !== undefined && Object.keys(jsonSchema).length === 0;
}
