import { describe, expect, it } from 'vitest';
import { serialize, deserialize } from '../../../../../lib/infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | broken-url-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a given broken url with challengeIds', async () => {
      // given
      const brokenUrl = domainBuilder.buildBrokenUrl({ localizedChallengeIds: ['recChallenge1', 'recChallenge2'], skillIds: [], tutorialIds: ['tutorialId1'], frameworkNames: ['frameworkName'] });
      const expectedSerializedBrokenUrl = {
        data: {
          type: 'broken-urls',
          id: brokenUrl.id.toString(),
          attributes: {
            'error-message': brokenUrl.errorMessage,
            'status-code': brokenUrl.statusCode,
            url: brokenUrl.url,
            frameworks: ['frameworkName'],
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
            tutorials: {
              data: [
                {
                  id: brokenUrl.tutorialIds[0],
                  type: 'tutorials',
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

    it('should serialize a given broken url with tutorialIds', async () => {
      // given
      const brokenUrl = domainBuilder.buildBrokenUrl({ skillIds: ['recTuto1', 'recTuto2'], localizedChallengeIds: [], tutorialIds: ['tutorialId2'], frameworkNames: ['frameworkName'] });
      const expectedSerializedBrokenUrl = {
        data: {
          type: 'broken-urls',
          id: brokenUrl.id.toString(),
          attributes: {
            'error-message': brokenUrl.errorMessage,
            'status-code': brokenUrl.statusCode,
            url: brokenUrl.url,
            frameworks: ['frameworkName'],
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
            tutorials: {
              data: [
                {
                  id: brokenUrl.tutorialIds[0],
                  type: 'tutorials',
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

  describe('#deserialize', () => {
    it('should deserialize from a json-api object', async () => {
      // given
      const payload = {
        data: {
          type: 'broken-url',
          attributes: {
            'error-message': 'message d\'erreur',
            'status-code': 403,
            url: 'https://superurl.com',
            frameworks: ['frameworkName'],
            ignored: true,
          },
        },
      };

      // when
      const deserializedTag = await deserialize(payload);

      // then
      expect(deserializedTag).toStrictEqual(
        {
          errorMessage: 'message d\'erreur',
          statusCode: 403,
          url: 'https://superurl.com',
          frameworks: ['frameworkName'],
          ignored: true,
        },
      );
    });
  });
});
