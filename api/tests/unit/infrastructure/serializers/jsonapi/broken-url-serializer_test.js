import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | broken-url-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a given broken url with challengeIds', async () => {
      // given
      const brokenUrl = domainBuilder.buildBrokenUrl({ challengeIds: ['recChallenge1', 'recChallenge2'], tutorialIds: [] });
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
            challenges: {
              data: [
                {
                  id: brokenUrl.challengeIds[0],
                  type: 'challenges',
                },
                {
                  id: brokenUrl.challengeIds[1],
                  type: 'challenges',
                },
              ],
            },
            tutorials: { data: [] },
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
      const brokenUrl = domainBuilder.buildBrokenUrl({ tutorialIds: ['recTuto1', 'recTuto2'], challengeIds: [] });
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
            challenges: { data: [] },
            tutorials: {
              data: [
                {
                  id: brokenUrl.tutorialIds[0],
                  type: 'tutorials',
                },
                {
                  id: brokenUrl.tutorialIds[1],
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
});
