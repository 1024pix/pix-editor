import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | broken-url-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a given broken url with challengeIds', async () => {
      // given
      const brokenUrl = domainBuilder.buildBrokenUrl({ localizedChallengeIds: ['recChallenge1', 'recChallenge2'], skillIds: [] });
      const expectedSerializedBrokenUrl = {
        data: {
          type: 'broken-urls',
          id: brokenUrl.id.toString(),
          attributes: {
            'error-message': brokenUrl.errorMessage,
            'status-code': brokenUrl.statusCode,
            url: brokenUrl.url,
          },
          relationships: {
            'localized-challenges': {
              data: [
                {
                  id: brokenUrl.localizedChallengeIds[0],
                  type: 'localizedChallenges',
                },
                {
                  id: brokenUrl.localizedChallengeIds[1],
                  type: 'localizedChallenges',
                },
              ],
            },
            skills: { data: [] },
          },
        },
      };

      // When
      const jsonData = serialize(brokenUrl);

      // Then
      expect(jsonData).to.deep.equal(expectedSerializedBrokenUrl);
    });

    it('should serialize a given broken url with tutorialIds', async () => {
      // given
      const brokenUrl = domainBuilder.buildBrokenUrl({ skillIds: ['recTuto1', 'recTuto2'], localizedChallengeIds: [] });
      const expectedSerializedBrokenUrl = {
        data: {
          type: 'broken-urls',
          id: brokenUrl.id.toString(),
          attributes: {
            'error-message': brokenUrl.errorMessage,
            'status-code': brokenUrl.statusCode,
            url: brokenUrl.url,
          },
          relationships: {
            'localized-challenges': { data: [] },
            skills: {
              data: [
                {
                  id: brokenUrl.skillIds[0],
                  type: 'skills',
                },
                {
                  id: brokenUrl.skillIds[1],
                  type: 'skills',
                },
              ],
            },
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
