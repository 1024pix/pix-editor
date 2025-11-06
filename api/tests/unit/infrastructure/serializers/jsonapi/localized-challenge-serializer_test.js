import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import {
  deserialize,
  serialize,
  serializeRead,
} from '../../../../../lib/infrastructure/serializers/jsonapi/localized-challenge-serializer.js';
import { LocalizedChallenge } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | JSONAPI | localized-challenge-serializer', () => {
  describe('#deserialize', () => {
    it('should deserialize a Localized Challenge', async () => {
      // Given
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        geography: 'BZ',
        urlsToConsult: [
          'url-to-consult.org',
          'url-to-consult.com',
          'url-to-consult.fr',
        ],
      });
      const json = {
        data: {
          type: 'localized-challenges',
          id: `${expectedLocalizedChallenge.id}`,
          attributes: {
            'embed-url': expectedLocalizedChallenge.embedUrl,
            geography: 'BZ',
            'urls-to-consult': expectedLocalizedChallenge.urlsToConsult,
            locale: expectedLocalizedChallenge.locale,
            status: expectedLocalizedChallenge.status,
            'require-gafam-website-access': expectedLocalizedChallenge.requireGafamWebsiteAccess,
            'is-incompatible-ipad-certif': expectedLocalizedChallenge.isIncompatibleIpadCertif,
            'deaf-and-hard-of-hearing': expectedLocalizedChallenge.deafAndHardOfHearing,
            'is-awareness-challenge': expectedLocalizedChallenge.isAwarenessChallenge,
            'to-rephrase': expectedLocalizedChallenge.toRephrase,
            'has-embed-internal-validation': expectedLocalizedChallenge.hasEmbedInternalValidation,
            'no-validation-needed': expectedLocalizedChallenge.noValidationNeeded,
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
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({ fileIds: ['attachmentId'] });

      const json = {
        data: {
          type: 'localized-challenges',
          id: `${expectedLocalizedChallenge.id}`,
          attributes: {
            'embed-url': expectedLocalizedChallenge.embedUrl,
            locale: expectedLocalizedChallenge.locale,
            geography: expectedLocalizedChallenge.geography,
            status: expectedLocalizedChallenge.status,
            'urls-to-consult': expectedLocalizedChallenge.urlsToConsult,
            'require-gafam-website-access': expectedLocalizedChallenge.requireGafamWebsiteAccess,
            'is-incompatible-ipad-certif': expectedLocalizedChallenge.isIncompatibleIpadCertif,
            'deaf-and-hard-of-hearing': expectedLocalizedChallenge.deafAndHardOfHearing,
            'is-awareness-challenge': expectedLocalizedChallenge.isAwarenessChallenge,
            'to-rephrase': expectedLocalizedChallenge.toRephrase,
            'has-embed-internal-validation': expectedLocalizedChallenge.hasEmbedInternalValidation,
            'no-validation-needed': expectedLocalizedChallenge.noValidationNeeded,
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: expectedLocalizedChallenge.challengeId,
              },
            },
            files: {
              data: [
                {
                  type: 'attachments',
                  id: 'attachmentId',
                },
              ],
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
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({ embedUrl: null });
      const json = {
        data: {
          type: 'localized-challenges',
          id: `${expectedLocalizedChallenge.id}`,
          attributes: {
            'embed-url': '',
            'urls-to-consult': expectedLocalizedChallenge.urlsToConsult,
            locale: expectedLocalizedChallenge.locale,
            geography: expectedLocalizedChallenge.geography,
            status: expectedLocalizedChallenge.status,
            'require-gafam-website-access': expectedLocalizedChallenge.requireGafamWebsiteAccess,
            'is-incompatible-ipad-certif': expectedLocalizedChallenge.isIncompatibleIpadCertif,
            'deaf-and-hard-of-hearing': expectedLocalizedChallenge.deafAndHardOfHearing,
            'is-awareness-challenge': expectedLocalizedChallenge.isAwarenessChallenge,
            'to-rephrase': expectedLocalizedChallenge.toRephrase,
            'has-embed-internal-validation': expectedLocalizedChallenge.hasEmbedInternalValidation,
            'no-validation-needed': expectedLocalizedChallenge.noValidationNeeded,
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
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      const expectedSerializedLocalizedChallenge = {
        data: {
          type: 'localized-challenges',
          id: `${localizedChallenge.id}`,
          attributes: {
            locale: localizedChallenge.locale,
            'embed-url': localizedChallenge.embedUrl,
            'default-embed-url': 'https://example.com/path/to/page.html?lang=en',
            geography: 'BZ',
            'urls-to-consult': localizedChallenge.urlsToConsult,
            status: localizedChallenge.status,
            translations: `/api/challenges/${localizedChallenge.challengeId}/translations/${localizedChallenge.locale}`,
            'require-gafam-website-access': true,
            'is-incompatible-ipad-certif': true,
            'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            'is-awareness-challenge': true,
            'to-rephrase': true,
            'has-embed-internal-validation': true,
            'no-validation-needed': true,
          },
          relationships: {
            challenge: {
              data: {
                id: 'persistant id',
                type: 'challenges',
              },
            },
            attachments: { links: { related: `/api/attachments?filter[localizedChallengeId]=${localizedChallenge.id}` } },
          },
        },
      };

      // When
      const json = serialize(localizedChallenge);

      // Then
      expect(json).to.deep.equal(expectedSerializedLocalizedChallenge);
    });
  });

  describe('#serializeRead', () => {
    it('should serialize one localized challenge read model', async () => {
      // given
      const localizedChallenge = domainBuilder.buildLocalizedChallengeRead({
        id: 'challengeNlId',
        challengeId: 'challengeId',
        locale: 'nl',
        instruction: 'Da Da Da',
        status: LocalizedChallenge.STATUSES.PLAY,
      });
      const expectedSerializedLocalizedChallenge = {
        data: {
          type: 'localized-challenges',
          id: `${localizedChallenge.id}`,
          attributes: {
            locale: localizedChallenge.locale,
            geography: 'AA',
            'default-embed-url': null,
            status: localizedChallenge.status,
            instruction: localizedChallenge.instruction,
            translations: `/api/challenges/${localizedChallenge.challengeId}/translations/${localizedChallenge.locale}`,
          },
          relationships: {
            challenge: {
              data: {
                id: `${localizedChallenge.challengeId}`,
                type: 'challenges',
              },
            },
            attachments: { links: { related: `/api/attachments?filter[localizedChallengeId]=${localizedChallenge.id}` } },
          },
        },
      };

      // When
      const json = serializeRead(localizedChallenge);

      // Then
      expect(json).to.deep.equal(expectedSerializedLocalizedChallenge);
    });

    it('should serialize an array of localized challenge read models', async () => {
      // given
      const localizedChallenge1 = domainBuilder.buildLocalizedChallengeRead({
        id: 'challengeNlId',
        challengeId: 'challengeId',
        locale: 'nl',
        instruction: 'Da Da Da',
        status: LocalizedChallenge.STATUSES.PLAY,
      });
      const localizedChallenge2 = domainBuilder.buildLocalizedChallengeRead({
        id: 'challengeEsId',
        challengeId: 'challengeId',
        locale: 'es',
        instruction: 'SI SI SI',
        status: LocalizedChallenge.STATUSES.PAUSE,
      });
      const expectedSerializedLocalizedChallenges = {
        data: [
          {
            type: 'localized-challenges',
            id: `${localizedChallenge1.id}`,
            attributes: {
              locale: localizedChallenge1.locale,
              geography: 'AA',
              'default-embed-url': null,
              status: localizedChallenge1.status,
              instruction: localizedChallenge1.instruction,
              translations: `/api/challenges/${localizedChallenge1.challengeId}/translations/${localizedChallenge1.locale}`,
            },
            relationships: {
              challenge: {
                data: {
                  id: `${localizedChallenge1.challengeId}`,
                  type: 'challenges',
                },
              },
              attachments: { links: { related: `/api/attachments?filter[localizedChallengeId]=${localizedChallenge1.id}` } },
            },
          },
          {
            type: 'localized-challenges',
            id: `${localizedChallenge2.id}`,
            attributes: {
              locale: localizedChallenge2.locale,
              geography: 'AA',
              'default-embed-url': null,
              status: localizedChallenge2.status,
              instruction: localizedChallenge2.instruction,
              translations: `/api/challenges/${localizedChallenge2.challengeId}/translations/${localizedChallenge2.locale}`,
            },
            relationships: {
              challenge: {
                data: {
                  id: `${localizedChallenge2.challengeId}`,
                  type: 'challenges',
                },
              },
              attachments: { links: { related: `/api/attachments?filter[localizedChallengeId]=${localizedChallenge2.id}` } },
            },
          },
        ],
      };

      // When
      const json = serializeRead([localizedChallenge1, localizedChallenge2]);

      // Then
      expect(json).to.deep.equal(expectedSerializedLocalizedChallenges);
    });
  });
});
