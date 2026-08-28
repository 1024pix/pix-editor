import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { BrokenUrl } from '../../../../../lib/domain/readmodels/index.js';

describe('Unit | Serializer | JSONAPI | broken-url', () => {
  describe('#serialize', () => {
    it('serializes a broken url', () => {
      // given
      const brokenUrl = new BrokenUrl({
        id: 123,
        statusCode: 404,
        url: 'https://example.com/broken-link-2',
        errorMessage: null,
      });

      // when
      const serializedBrokenUrl = serialize(brokenUrl);

      // then
      expect(serializedBrokenUrl).toStrictEqual({
        data: {
          attributes: {
            challenges: [],
            'error-message': null,
            'status-code': 404,
            tutorials: [],
            url: 'https://example.com/broken-link-2',
          },
          id: '123',
          type: 'broken-urls',
        },
      });
    });
  });
});
