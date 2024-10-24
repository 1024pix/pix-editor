import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import {
  deserialize,
  serialize
} from '../../../../../lib/infrastructure/serializers/jsonapi/localized-challenge-serializer.js';
import { LocalizedChallenge } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | JSONAPI | localized-challenge-serializer', () => {
  describe('#deserialize', () => {
    it('should deserialize a Localized Challenge', async () => {
      // Given
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        geography: 'BZ',
        urlsToConsult: ['url-to-consult.org', 'url-to-consult.com', 'url-to-consult.fr'],
      });
      const json = {
        data: {
          type: 'localized-challenges',
          id: `${expectedLocalizedChallenge.id}`,
          attributes: {
            'embed-url': expectedLocalizedChallenge.embedUrl,
            geography: 'Bélize',
            'urls-to-consult': expectedLocalizedChallenge.urlsToConsult,
            locale: expectedLocalizedChallenge.locale,
            status: expectedLocalizedChallenge.status,
            'require-gafam-website-access': expectedLocalizedChallenge.requireGafamWebsiteAccess,
            'is-incompatible-ipad-certif': expectedLocalizedChallenge.isIncompatibleIpadCertif,
            'deaf-and-hard-of-hearing': expectedLocalizedChallenge.deafAndHardOfHearing,
            'is-awareness-challenge': expectedLocalizedChallenge.isAwarenessChallenge,
            'to-rephrase': expectedLocalizedChallenge.toRephrase,
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
        fileIds: ['attachmentId'],
      });

      const json = {
        data: {
          type: 'localized-challenges',
          id: `${expectedLocalizedChallenge.id}`,
          attributes: {
            'embed-url': expectedLocalizedChallenge.embedUrl,
            locale: expectedLocalizedChallenge.locale,
            status: expectedLocalizedChallenge.status,
            'urls-to-consult': expectedLocalizedChallenge.urlsToConsult,
            'require-gafam-website-access': expectedLocalizedChallenge.requireGafamWebsiteAccess,
            'is-incompatible-ipad-certif': expectedLocalizedChallenge.isIncompatibleIpadCertif,
            'deaf-and-hard-of-hearing': expectedLocalizedChallenge.deafAndHardOfHearing,
            'is-awareness-challenge': expectedLocalizedChallenge.isAwarenessChallenge,
            'to-rephrase': expectedLocalizedChallenge.toRephrase,
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
            'urls-to-consult': expectedLocalizedChallenge.urlsToConsult,
            locale: expectedLocalizedChallenge.locale,
            status: expectedLocalizedChallenge.status,
            'require-gafam-website-access': expectedLocalizedChallenge.requireGafamWebsiteAccess,
            'is-incompatible-ipad-certif': expectedLocalizedChallenge.isIncompatibleIpadCertif,
            'deaf-and-hard-of-hearing': expectedLocalizedChallenge.deafAndHardOfHearing,
            'is-awareness-challenge': expectedLocalizedChallenge.isAwarenessChallenge,
            'to-rephrase': expectedLocalizedChallenge.toRephrase,
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
        locale: 'en',
        embedUrl: 'https://example.es/path/to/page.html',
        primaryEmbedUrl: 'https://example.com/path/to/page.html',
        status: LocalizedChallenge.STATUSES.PLAY,
        geography: 'BZ',
        urlsToConsult: ['https://urls.fr', 'pouet.fr'],
        fileIds: ['attachment1', 'attachment2'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
      });
      const expectedSerializedLocalizedChallenge = {
        data: {
          type: 'localized-challenges',
          id: `${localizedChallenge.id}`,
          attributes: {
            locale: localizedChallenge.locale,
            'embed-url': localizedChallenge.embedUrl,
            'default-embed-url': 'https://example.com/path/to/page.html?lang=en',
            geography: 'Belize',
            'urls-to-consult': localizedChallenge.urlsToConsult,
            status: localizedChallenge.status,
            translations: `/api/challenges/${localizedChallenge.challengeId}/translations/${localizedChallenge.locale}`,
            'require-gafam-website-access': true,
            'is-incompatible-ipad-certif': true,
            'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            'is-awareness-challenge': true,
            'to-rephrase': true,
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
