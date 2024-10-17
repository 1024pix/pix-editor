import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer.js';
import { Challenge, LocalizedChallenge } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | JSONAPI | challenge-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a Challenge', () => {
      // Given
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: 'recwWzTquPlvIl4So',
        geography: 'MZ',
        urlsToConsult: ['mylink1', 'mylink2'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
      });
      const challenge = domainBuilder.buildChallenge({
        id: 'recwWzTquPlvIl4So',
        localizedChallenges: [localizedChallenge],
        geography: 'DEPRECATED',
      });
      const alternativeLocales = ['en', 'nl'];
      const expectedSerializedChallenge = {
        data: {
          type: 'challenges',
          id: `${challenge.id}`,
          attributes: {
            'airtable-id': challenge.airtableId,
            instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
            'alternative-instruction': '',
            'illustration-alt': null,
            type: Challenge.TYPES.QCM,
            format: Challenge.FORMATS.MOTS,
            proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
            solution: '1, 5',
            'solution-to-display': '1',
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
            author: ['SPS'],
            declinable: Challenge.DECLINABLES.FACILEMENT,
            version: 1,
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
            preview: '/api/challenges/recwWzTquPlvIl4So/preview',
            timer: 1234,
            'embed-url': localizedChallenge.embedUrl,
            'embed-title': 'Epreuve de selection de dossier',
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: Challenge.ACCESSIBILITY1.OK,
            accessibility2: Challenge.ACCESSIBILITY2.RAS,
            spoil: Challenge.SPOILS.NON_SPOILABLE,
            responsive: Challenge.RESPONSIVES.NON,
            locales: ['fr'],
            'alternative-locales': ['en', 'nl'],
            geography: 'Mozambique',
            'urls-to-consult': ['mylink1', 'mylink2'],
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'contextualized-fields': ['instruction', 'illustration'],
            'require-gafam-website-access': true,
            'is-incompatible-ipad-certif': true,
            'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            'is-awareness-challenge': true,
            'to-rephrase': true,
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills'
              }
            },
            files: {
              data: [{
                type: 'attachments',
                id: 'attachment recordId generated by Airtable',
              }],
            },
            'localized-challenges': {
              data: [{
                type: 'localized-challenges',
                id: challenge.id,
              }],
            }
          }
        }
      };
      // When
      const json = serialize({ ...challenge, alternativeLocales });

      // Then
      expect(json).to.deep.equal(expectedSerializedChallenge);
    });
  });

  describe('#deserialize', () => {
    it('should deserialize a Challenge', async () => {
      // Given
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        geography: 'MD',
        embedUrl: 'https://github.io/page/epreuve.html',
        urlsToConsult: ['mylink1', 'mylink2'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
      });
      const expectedDeserializedChallenge = domainBuilder.buildChallenge({ localizedChallenges: [expectedLocalizedChallenge] }, ['alpha', 'delta', 'skillId']);
      const json = {
        data: {
          type: 'challenges',
          id: `${expectedDeserializedChallenge.id}`,
          attributes: {
            'airtable-id': expectedDeserializedChallenge.airtableId,
            instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
            'alternative-instruction': '',
            type: Challenge.TYPES.QCM,
            format: Challenge.FORMATS.MOTS,
            proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
            solution: '1, 5',
            'solution-to-display': '1',
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
            author: ['SPS'],
            declinable: Challenge.DECLINABLES.FACILEMENT,
            version: 1,
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
            preview: 'http://staging.pix.fr/challenges/recwWzTquPlvIl4So/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Epreuve de selection de dossier',
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: Challenge.ACCESSIBILITY1.OK,
            accessibility2: Challenge.ACCESSIBILITY2.RAS,
            spoil: Challenge.SPOILS.NON_SPOILABLE,
            responsive: Challenge.RESPONSIVES.NON,
            locales: [],
            geography: 'Moldavie',
            'urls-to-consult': ['mylink1', 'mylink2'],
            'auto-reply': false,
            focusable: false,
            competenceId: 'recsvLz0W2ShyfD63',
            'updated-at': '2021-10-04',
            'created-at': '1986-07-14',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            'shuffled': false,
            'contextualizedFields': [Challenge.CONTEXTUALIZED_FIELDS.INSTRUCTION, Challenge.CONTEXTUALIZED_FIELDS.ILLUSTRATION],
            'require-gafam-website-access': true,
            'is-incompatible-ipad-certif': true,
            'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            'is-awareness-challenge': true,
            'to-rephrase': true,
          },
          relationships: {
            skill: {
              data: {
                type: 'skills',
                id: 'recordId generated by Airtable',
              }
            },
            files: {
              data: [{
                type: 'attachments',
                id: 'attachment recordId generated by Airtable',
              }],
            },
            'localized-challenges': {
              data: [
                {
                  type: 'localizedChallenges',
                  'id': `${expectedDeserializedChallenge.id}`,
                }
              ]
            }
          },
        }
      };

      // When
      const challenge = await deserialize(json);

      // Then
      expect(challenge).to.deep.equal(expectedDeserializedChallenge);
    });

    it('should allow empty skill relationships', async function() {
      // Given
      const json = {
        data: {
          type: 'challenges',
          id: 'challengeId',
          attributes: {},
          relationships: {
            skill: {
              data: null
            },
          },
        }
      };

      // When
      const challenge = await deserialize(json);

      // Then
      expect(challenge.skills).to.deep.equal([]);
    });
  });
});
