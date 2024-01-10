import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { deserialize } from '../../../../../lib/infrastructure/serializers/jsonapi/localized-challenge-serializer.js';

describe('Unit | Serializer | JSONAPI | localized-challenge-serializer', () => {
  describe('#deserialize', () => {
    it('should deserialize a Localized Challenge', async () => {
      // Given
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({});
      const json = {
        data: {
          type: 'localized-challenges',
          id: `${expectedLocalizedChallenge.id}`,
          attributes: {
            'embed-url': expectedLocalizedChallenge.embedUrl,
            locale: expectedLocalizedChallenge.locale,
            status: expectedLocalizedChallenge.status,
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: expectedLocalizedChallenge.challengeId,
              },
            },
          },
        },
      };

      // When
      const localizedChallenge = await deserialize(json);

      // Then
      expect(localizedChallenge).to.deep.equal(expectedLocalizedChallenge);
    });

    it('should deserialize empty embed URL as null', async () => {
      // Given
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        embedUrl: null,
      });
      const json = {
        data: {
          type: 'localized-challenges',
          id: `${expectedLocalizedChallenge.id}`,
          attributes: {
            'embed-url': '',
            locale: expectedLocalizedChallenge.locale,
            status: expectedLocalizedChallenge.status,
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: expectedLocalizedChallenge.challengeId,
              },
            },
          },
        },
      };

      // When
      const localizedChallenge = await deserialize(json);

      // Then
      expect(localizedChallenge).to.deep.equal(expectedLocalizedChallenge);
    });
  });
});
