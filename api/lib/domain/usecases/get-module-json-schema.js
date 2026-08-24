import { createHash } from 'node:crypto';

import { convertJoiToJsonSchema } from '../services/convert-joi-rules-to-json-schema.js';
import { moduleSchema } from '../../application/modules/validation/module-schema.js';

/**
 * Cached module JSON Schema, to avoid re-serializing it for every request
 * @type {string}
 */
let jsonSchema;

/**
 * Cached module JSON Schema's checksum, to avoid re-computing it for every request
 * @type {string}
 */
let jsonSchemaChecksum;

export function getModuleJsonSchema({ generateChecksum = generateMd5Checksum } = {}) {
  jsonSchema = jsonSchema ?? JSON.stringify(convertJoiToJsonSchema(moduleSchema));
  jsonSchemaChecksum = jsonSchemaChecksum ?? generateChecksum(jsonSchema);

  return { jsonSchema, jsonSchemaChecksum };
}

function generateMd5Checksum(stringToHash) {
  return createHash('md5').update(stringToHash).digest('hex');
}
