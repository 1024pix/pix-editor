import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/html/external-urls-serializer.js';

describe('Unit | Serializer | HTML | external-urls-serializer', () => {
  describe('#serialize', () => {
    it('serializes external urls', () => {
      // given
      const externalUrls = [
        {
          id: 'challenge1',
          url: 'https://ui.pix.org',
          type: 'challenge',
        },
        {
          id: 'challenge2, challengePatateDouce123',
          url: 'https://ui.pix.fr',
          type: 'challenge',
        },
        {
          id: 'tutorial1',
          url: 'http://commant-pix-ui-fonctionne.org',
          type: 'tutorial',
        },
      ];

      const expectedHtml = '<!DOCTYPE html><html><body><a href="https://ui.pix.org">c challenge1</a><a href="https://ui.pix.fr">c challenge2</a><a href="http://commant-pix-ui-fonctionne.org">t tutorial1</a></body><style>a{display:block;}</style></html>';

      // when
      const serializedExternalUrls = serialize(externalUrls);

      // then
      expect(serializedExternalUrls).toStrictEqual(expectedHtml);
    });
  });
});
