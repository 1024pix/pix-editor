import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { moduleSchema } from '../../../../lib/application/modules/validation/zod/module-schema.js';
import { describe as withDescription, htmlSchema, maxItems, string, unique, uri, uuidSchema } from '../../../../lib/application/modules/validation/zod/utils.js';
import { convertZodModuleSchemaToJsonSchema } from '../../../../lib/domain/services/convert-zod-module-schema-to-json-schema.js';

describe('Unit | Domain | Service | convert-zod-module-schema-to-json-schema', function() {
  it('should convert the module schema to the reference module JSON schema', async function() {
    const referenceJsonSchema = JSON.parse(await readFile(new URL('./__snapshots__/module-json-schema.json', import.meta.url), 'utf8'));

    const jsonSchema = convertZodModuleSchemaToJsonSchema(moduleSchema);

    expect(jsonSchema).to.deep.equal(referenceJsonSchema);
  });

  it('should always set format and options on strings, and move the description to options.infoText', function() {
    const jsonSchema = convertZodModuleSchemaToJsonSchema(z.strictObject({
      plain: string(),
      described: withDescription(string(), 'Une description'),
      html: htmlSchema(),
      uuid: uuidSchema,
    }));

    expect(jsonSchema.properties).to.deep.equal({
      plain: { type: 'string', format: null, options: null },
      described: { type: 'string', format: null, options: { infoText: 'Une description' } },
      html: { type: 'string', format: 'jodit', options: null },
      uuid: { type: 'string', format: 'uuid', options: null },
    });
  });

  it('should render an uri allowing empty string with anyOf', function() {
    const jsonSchema = convertZodModuleSchemaToJsonSchema(uri({ allowEmpty: true }));

    expect(jsonSchema).to.deep.equal({ type: 'string', options: null, anyOf: [{ format: 'uri' }, { maxLength: 0 }] });
  });

  it('should replace \\d with [0-9] in patterns', function() {
    const jsonSchema = convertZodModuleSchemaToJsonSchema(string().regex(/^\d+$/));

    expect(jsonSchema.pattern).to.equal('^[0-9]+$');
  });

  it('should render numbers without Zod safe integer bounds, and positive as minimum 1', function() {
    const jsonSchema = convertZodModuleSchemaToJsonSchema(z.strictObject({ integer: z.int(), positive: z.number().positive() }));

    expect(jsonSchema.properties).to.deep.equal({
      integer: { type: 'integer', options: null },
      positive: { type: 'number', minimum: 1, options: null },
    });
  });

  it('should render booleans without default', function() {
    const jsonSchema = convertZodModuleSchemaToJsonSchema(z.boolean().default(false));

    expect(jsonSchema).to.deep.equal({ type: 'boolean' });
  });

  it('should title array items after their property name', function() {
    const jsonSchema = convertZodModuleSchemaToJsonSchema(z.strictObject({ proposals: unique(maxItems(z.array(z.strictObject({ id: string() })).min(1), 2)) }));

    expect(jsonSchema.properties.proposals).to.deep.equal({
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      options: null,
      items: {
        type: 'object',
        properties: { id: { type: 'string', format: null, options: null } },
        required: ['id'],
        additionalProperties: false,
        title: 'proposal',
        headerTemplate: 'proposal {{i0}}',
      },
    });
  });

  it('should render unions as oneOf', function() {
    const jsonSchema = convertZodModuleSchemaToJsonSchema(z.union([string().min(1), z.number().min(1)]));

    expect(jsonSchema).to.deep.equal({ oneOf: [{ type: 'string', format: null, minLength: 1, options: null }, { type: 'number', minimum: 1, options: null }] });
  });
});
