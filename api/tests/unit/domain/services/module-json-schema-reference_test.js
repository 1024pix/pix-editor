import { describe, expect, it } from 'vitest';

import { moduleSchema } from '../../../../lib/application/modules/validation/module-schema.js';
import { convertJoiToJsonSchema } from '../../../../lib/domain/services/convert-joi-rules-to-json-schema.js';

describe('Unit | Domain | Service | module JSON schema reference', function() {
  it('should match the reference module JSON schema', async function() {
    const jsonSchema = JSON.parse(JSON.stringify(convertJoiToJsonSchema(moduleSchema)));

    await expect(JSON.stringify(jsonSchema, null, 2)).toMatchFileSnapshot('./__snapshots__/module-json-schema.json');
  });
});
