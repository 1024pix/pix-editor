import { describe, expect, it } from 'vitest';
import { deserialize } from '../../../../../lib/infrastructure/serializers/ohdear/broken-url-serializer.js';
import { BrokenUrl } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | OHDEAR | broken-url-serializer', () => {
  describe('#deserialize', () => {
    it('deserializes a broken url', async () => {
      // given
      const payload = [
        {
          crawled_url: 'https://example.com/broken-link-2',
          status_code: 404,
        },
      ];

      // when
      const deserializedBrokenUrl = await deserialize(payload);

      // then
      expect(deserializedBrokenUrl).toStrictEqual([
        new BrokenUrl({
          statusCode: 404,
          url: 'https://example.com/broken-link-2',
        }),
      ]);
    });
  });
});
