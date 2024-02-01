import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/localized-challenge-serializer.js';

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

    it('should deserialize a Localized Challenge with files', async () => {
      // Given
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        fileIds: ['attachmentId']
      });

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
            files: {
              data: [{
                type: 'attachments',
                id: 'attachmentId'
              }]
            }
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
  describe('#serialize', () => {
    it('should serialize a localized challenge with its attachments', async () => {
      // given
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        embedUrl: null,
        status: 'validé',
        fileIds: ['attachment1', 'attachment2']
      });
      const expectedSerializedLocalizedChallenge = {
        data: {
          type: 'localized-challenges',
          id: `${localizedChallenge.id}`,
          attributes: {
            locale: localizedChallenge.locale,
            'embed-url': null,
            status: localizedChallenge.status,
          },
          relationships: {
            files: {
              data: [
                {
                  type: 'attachments',
                  id: 'attachment1',
                },
                {
                  type: 'attachments',
                  id: 'attachment2',
                }
              ],
            },
            challenge: {
              data: {
                id: 'persistant id',
                type: 'challenges',
              },
            }
          }
        }
      };

      // When
      const json = serialize(localizedChallenge);

      // Then
      expect(json).to.deep.equal(expectedSerializedLocalizedChallenge);
    });
  });
});
