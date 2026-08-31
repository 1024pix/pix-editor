import { describe, expect, it } from 'vitest';
import { deserialize } from '../../../../../lib/infrastructure/serializers/ohdear/crawled-url-serializer.js';
import { CrawledUrl } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | OHDEAR | crawled-url-serializer', () => {
  describe('#deserialize', () => {
    it('deserializes a crawled url', async () => {
      // given
      const ohdearPayload = {
        run: {
          result_payload: {
            crawled_urls: [
              {
                crawled_url: 'https://example.com/broken-link-2',
                status_code: 404,
              },
            ],
          },
        },
      };

      // when
      const deserializedBrokenUrl = await deserialize(ohdearPayload);

      // then
      expect(deserializedBrokenUrl).toStrictEqual([
        new CrawledUrl({
          statusCode: 404,
          url: 'https://example.com/broken-link-2',
          errorMessage: undefined,
        }),
      ]);
    });
  });
});
