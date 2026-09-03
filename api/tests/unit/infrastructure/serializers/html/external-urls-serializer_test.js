import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/html/external-urls-serializer.js';

describe('Unit | Serializer | HTML | external-urls-serializer', () => {
  describe('#serialize', () => {
    it('serializes external urls', () => {
      // given
      const externalUrls = [
        {
          id: 1001,
          url: 'https://ui.pix.org',
        },
        {
          id: 1002,
          url: 'https://ui.pix.fr',
        },
        {
          id: 1003,
          url: 'http://commant-pix-ui-fonctionne.org',
        },
      ];

      const expectedHtml = '<!DOCTYPE html><html><body><a href="https://ui.pix.org">1001</a><a href="https://ui.pix.fr">1002</a><a href="http://commant-pix-ui-fonctionne.org">1003</a></body><style>a{display:block;}</style></html>';

      // when
      const serializedExternalUrls = serialize(externalUrls);

      // then
      expect(serializedExternalUrls).toStrictEqual(expectedHtml);
    });
  });
});
