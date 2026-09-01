import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { buildBrokenUrl } from '../../../../tooling/domain-builder/factory/index.js';

describe('Unit | Serializer | JSONAPI | broken-url-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a given broken url', async () => {
      // given
      const brokenUrl = buildBrokenUrl();
      const expectedSerializedBrokenUrl = {
        data: {
          type: 'broken-urls',
          id: brokenUrl.id.toString(),
          attributes: {
            'error-message': brokenUrl.errorMessage,
            'status-code': brokenUrl.statusCode,
            url: brokenUrl.url,
          },
        },
      };

      // When
      const jsonData = serialize(brokenUrl);

      // Then
      expect(jsonData).to.deep.equal(expectedSerializedBrokenUrl);
    });
  });
});
