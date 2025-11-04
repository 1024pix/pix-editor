import { beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import _ from 'lodash';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import * as config from '../../../../lib/config.js';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';

const challengeAirtableFields = [
  'id persistant',
  'Compétences (via tube) (id persistant)',
  'Timer',
  "Type d'épreuve",
  'T1 - Espaces, casse & accents',
  'T2 - Ponctuation',
  "T3 - Distance d'édition",
  'Statut',
  'Acquix (id persistant)',
  'Embed URL',
  'Embed height',
  'Format',
  'files',
  'filesLocalizedChallengeIds',
  'Réponse automatique',
  'Langues',
  'Focalisée',
  'Record ID',
  'Acquix',
  'Généalogie',
  'Type péda',
  'Auteur',
  'Déclinable',
  'Version prototype',
  'Version déclinaison',
  'Non voyant',
  'Daltonien',
  'Spoil',
  'Responsive',
  'Géographie',
  'Difficulté calculée',
  'Discrimination calculée',
  'updated_at',
  'created_at',
  'validated_at',
  'archived_at',
  'made_obsolete_at',
  'shuffled',
  'contextualizedFields',
];

describe('Acceptance | Controller | challenges-controller', () => {
  function _removeReadonlyFields(airtableChallengeBody, deleteId) {
    const body = _.cloneDeep(airtableChallengeBody);
    delete body.fields['Record ID'];
    delete body.fields['Compétences (via tube) (id persistant)'];
    delete body.fields['Acquix (id persistant)'];
    delete body.fields['Discrimination calculée'];
    delete body.fields['Difficulté calculée'];
    delete body.fields['updated_at'];
    delete body.fields['created_at'];
    delete body.fields['filesLocalizedChallengeIds'];
    delete body.fields.files;
    if (deleteId) {
      delete body.id;
    }
    return body;
  }

  describe('GET /challenges', () => {
    let user;
    beforeEach(async function () {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
    });

    it('should filter challenges by id', async () => {
      // Given
      const challenge1 = domainBuilder.buildChallengeDatasourceObject({
        id: '1',
        geography: 'XX',
        files: [],
        competenceId: 'competence1',
      });
      const challenge2 = domainBuilder.buildChallengeDatasourceObject({
        id: '2',
        geography: 'XX',
        files: [],
        competenceId: 'competence1',
      });
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeAirtableFields,
          },
          filterByFormula: 'OR("1" = {id persistant},"2" = {id persistant})',
        })
        .reply(200, {
          records: [
            airtableBuilder.factory.buildChallenge(challenge1),
            airtableBuilder.factory.buildChallenge(challenge2),
          ],
        });

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challenge1.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challenge1);
      databaseBuilder.factory.buildChallenge(challenge2);

      databaseBuilder.factory.buildTranslation({
        key: 'challenge.1.instruction',
        locale: 'fr',
        value:
          "Les moteurs de recherche affichent certains liens en raison d'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?",
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.1.alternativeInstruction',
        locale: 'fr',
        value: 'Débrouille toi',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.1.embedTitle',
        locale: 'fr',
        value: 'Epreuve de selection de dossier',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.1.illustrationAlt',
        locale: 'fr',
        value: 'La belle image',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.1.solution',
        locale: 'fr',
        value: '1, 5',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.1.solutionToDisplay',
        locale: 'fr',
        value: '1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.1.proposals',
        locale: 'fr',
        value: '- 1\n- 2\n- 3\n- 4\n- 5',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.2.instruction',
        locale: 'fr',
        value:
          "Les moteurs de recherche affichent certains liens en raison d'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?",
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.2.alternativeInstruction',
        locale: 'fr',
        value: 'Débrouille toi encore',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.2.embedTitle',
        locale: 'fr',
        value: 'Epreuve de selection de dossier',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.2.illustrationAlt',
        locale: 'fr',
        value: 'Une autre image',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.2.solution',
        locale: 'fr',
        value: '1, 5',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.2.solutionToDisplay',
        locale: 'fr',
        value: '1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.2.proposals',
        locale: 'fr',
        value: '- 1\n- 2\n- 3\n- 4\n- 5',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: '1',
        challengeId: '1',
        locale: 'fr',
        embedUrl: 'http://example.com/my_embed.html',
        geography: 'BR',
        urlsToConsult: ['truc.fr'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: '2',
        challengeId: '2',
        locale: 'fr',
        geography: 'PH',
        urlsToConsult: ['truc2.fr'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: true,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: '2_nl',
        challengeId: '2',
        locale: 'nl',
        geography: null,
        urlsToConsult: ['truc2.nl'],
      });

      await databaseBuilder.commit();

      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges?filter[ids][]=1&filter[ids][]=2',
        headers: generateAuthorizationHeader(user),
      });

      // Then
      expect(airtableCall.isDone()).to.be.true;

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            type: 'challenges',
            id: '1',
            attributes: {
              'airtable-id': challenge1.airtableId,
              instruction:
                "Les moteurs de recherche affichent certains liens en raison d'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?",
              'alternative-instruction': 'Débrouille toi',
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
              preview: '/api/challenges/1/preview',
              timer: 1234,
              'embed-url': 'http://example.com/my_embed.html',
              'embed-title': 'Epreuve de selection de dossier',
              'embed-height': 500,
              'alternative-version': 2,
              accessibility1: Challenge.ACCESSIBILITY1.OK,
              accessibility2: Challenge.ACCESSIBILITY2.RAS,
              spoil: Challenge.SPOILS.NON_SPOILABLE,
              responsive: Challenge.RESPONSIVES.NON,
              locales: ['fr'],
              'alternative-locales': [],
              geography: 'BR',
              'urls-to-consult': ['truc.fr'],
              'auto-reply': false,
              focusable: false,
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
              'illustration-alt': 'La belle image',
              'require-gafam-website-access': true,
              'is-incompatible-ipad-certif': true,
              'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
              'is-awareness-challenge': true,
              'to-rephrase': true,
              'has-embed-internal-validation': true,
              'no-validation-needed': true,
            },
            relationships: {
              skill: {
                data: {
                  id: 'recordId generated by Airtable',
                  type: 'skills',
                },
              },
              'localized-challenges': {
                data: [
                  {
                    id: '1',
                    type: 'localized-challenges',
                  },
                ],
              },
              attachments: {
                links: {
                  related: '/api/attachments?filter[localizedChallengeId]=1',
                },
              },
              'challenge-locales': {
                data: [
                  {
                    id: '1-en',
                    type: 'challenge-locales',
                  },
                  {
                    id: '1-es',
                    type: 'challenge-locales',
                  },
                  {
                    id: '1-es-419',
                    type: 'challenge-locales',
                  },
                  {
                    id: '1-fr',
                    type: 'challenge-locales',
                  },
                  {
                    id: '1-fr-BE',
                    type: 'challenge-locales',
                  },
                  {
                    id: '1-fr-FR',
                    type: 'challenge-locales',
                  },
                  {
                    id: '1-nl-BE',
                    type: 'challenge-locales',
                  },
                  {
                    id: '1-nl',
                    type: 'challenge-locales',
                  },
                ],
              },
            },
          },
          {
            type: 'challenges',
            id: '2',
            attributes: {
              'airtable-id': challenge2.airtableId,
              instruction:
                "Les moteurs de recherche affichent certains liens en raison d'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?",
              'alternative-instruction': 'Débrouille toi encore',
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
              preview: '/api/challenges/2/preview',
              timer: 1234,
              'embed-url': null,
              'embed-title': 'Epreuve de selection de dossier',
              'embed-height': 500,
              'alternative-version': 2,
              accessibility1: Challenge.ACCESSIBILITY1.OK,
              accessibility2: Challenge.ACCESSIBILITY2.RAS,
              spoil: Challenge.SPOILS.NON_SPOILABLE,
              responsive: Challenge.RESPONSIVES.NON,
              locales: ['fr'],
              'alternative-locales': ['nl'],
              geography: 'PH',
              'urls-to-consult': ['truc2.fr'],
              'auto-reply': false,
              focusable: false,
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
              'illustration-alt': 'Une autre image',
              'require-gafam-website-access': false,
              'is-incompatible-ipad-certif': true,
              'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
              'is-awareness-challenge': true,
              'to-rephrase': false,
              'has-embed-internal-validation': false,
              'no-validation-needed': false,
            },
            relationships: {
              skill: {
                data: {
                  id: 'recordId generated by Airtable',
                  type: 'skills',
                },
              },
              'localized-challenges': {
                data: [
                  {
                    id: '2',
                    type: 'localized-challenges',
                  },
                  {
                    id: '2_nl',
                    type: 'localized-challenges',
                  },
                ],
              },
              attachments: {
                links: {
                  related: '/api/attachments?filter[localizedChallengeId]=2',
                },
              },
              'challenge-locales': {
                data: [
                  {
                    id: '2-en',
                    type: 'challenge-locales',
                  },
                  {
                    id: '2-es',
                    type: 'challenge-locales',
                  },
                  {
                    id: '2-es-419',
                    type: 'challenge-locales',
                  },
                  {
                    id: '2-fr',
                    type: 'challenge-locales',
                  },
                  {
                    id: '2-fr-BE',
                    type: 'challenge-locales',
                  },
                  {
                    id: '2-fr-FR',
                    type: 'challenge-locales',
                  },
                  {
                    id: '2-nl-BE',
                    type: 'challenge-locales',
                  },
                  {
                    id: '2-nl',
                    type: 'challenge-locales',
                  },
                ],
              },
            },
          },
        ],
        included: [
          {
            attributes: {
              locale: 'en',
            },
            id: '1-en',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es',
            },
            id: '1-es',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es-419',
            },
            id: '1-es-419',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr',
            },
            id: '1-fr',
            relationships: {
              'localized-challenge': {
                data: {
                  id: '1',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-BE',
            },
            id: '1-fr-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-FR',
            },
            id: '1-fr-FR',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl-BE',
            },
            id: '1-nl-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl',
            },
            id: '1-nl',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'en',
            },
            id: '2-en',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es',
            },
            id: '2-es',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es-419',
            },
            id: '2-es-419',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr',
            },
            id: '2-fr',
            relationships: {
              'localized-challenge': {
                data: {
                  id: '2',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-BE',
            },
            id: '2-fr-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-FR',
            },
            id: '2-fr-FR',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl-BE',
            },
            id: '2-nl-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl',
            },
            id: '2-nl',
            relationships: {
              'localized-challenge': {
                data: {
                  id: '2_nl',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
        ],
      });
    });

    it('should search challenges', async () => {
      // Given
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeAirtableFields,
          },
          maxRecords: 100,
          filterByFormula: 'FIND("query term", LOWER(CONCATENATE({Embed URL})))',
          sort: [{ field: 'updated_at', direction: 'desc' }],
        })
        .reply(200, {
          records: [],
        });
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges?filter[search]=query term',
        headers: generateAuthorizationHeader(user),
      });

      // Then
      expect(airtableCall.isDone()).to.be.true;
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({ data: [] });
    });

    it('should search challenges with limit', async () => {
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeAirtableFields,
          },
          filterByFormula: 'FIND("query term", LOWER(CONCATENATE({Embed URL})))',
          maxRecords: 20,
          sort: [{ field: 'updated_at', direction: 'desc' }],
        })
        .reply(200, {
          records: [],
        });
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges?filter[search]=query term&page[size]=20',
        headers: generateAuthorizationHeader(user),
      });

      // Then
      expect(airtableCall.isDone()).to.be.true;
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({ data: [] });
    });
  });

  describe('GET /challenges/:id', () => {
    let user;
    beforeEach(async function () {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
    });

    it('should return given challenge', async () => {
      // Given
      const challenge = domainBuilder.buildChallengeDatasourceObject({
        id: 'recChallengeId1',
        files: [
          { fileId: 'fileId1', localizedChallengeId: 'recChallengeId1' },
          { fileId: 'fileId2', localizedChallengeId: 'localizedChallengeId2' },
        ],
        geography: 'XX',
        competenceId: 'competence1',
      });

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challenge.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challenge);

      const airtableChallenge = airtableBuilder.factory.buildChallenge(challenge);
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          filterByFormula: '{id persistant} = "recChallengeId1"',
          maxRecords: 1,
        })
        .reply(200, {
          records: [airtableChallenge],
        });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallengeId1',
        challengeId: 'recChallengeId1',
        locale: 'fr',
        embedUrl: 'https://github.io/page/epreuve.html',
        geography: 'BR',
        urlsToConsult: ['truc.fr'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId2',
        challengeId: 'recChallengeId1',
        locale: 'nl',
        geography: null,
        urlsToConsult: ['truc.nl'],
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId1.instruction',
        locale: 'fr',
        value:
          "Les moteurs de recherche affichent certains liens en raison d'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?",
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId1.alternativeInstruction',
        locale: 'fr',
        value: 'Débrouille toi',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId1.embedTitle',
        locale: 'fr',
        value: 'Epreuve de selection de dossier',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId1.solution',
        locale: 'fr',
        value: '1, 5',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId1.solutionToDisplay',
        locale: 'fr',
        value: '1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId1.proposals',
        locale: 'fr',
        value: '- 1\n- 2\n- 3\n- 4\n- 5',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId1.proposals',
        locale: 'nl',
        value: '- 1\n- 2\n- 3\n- 4\n- 5',
      });

      challenge.files.forEach((file) =>
        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: file.fileId,
            challengeId: challenge.id,
            localizedChallengeId: file.localizedChallengeId,
          }),
        ),
      );

      await databaseBuilder.commit();

      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges/recChallengeId1',
        headers: generateAuthorizationHeader(user),
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'challenges',
          id: 'recChallengeId1',
          attributes: {
            'airtable-id': challenge.airtableId,
            instruction:
              "Les moteurs de recherche affichent certains liens en raison d'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?",
            'alternative-instruction': 'Débrouille toi',
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
            preview: '/api/challenges/recChallengeId1/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Epreuve de selection de dossier',
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: Challenge.ACCESSIBILITY1.OK,
            accessibility2: Challenge.ACCESSIBILITY2.RAS,
            spoil: Challenge.SPOILS.NON_SPOILABLE,
            responsive: Challenge.RESPONSIVES.NON,
            locales: ['fr'],
            'alternative-locales': ['nl'],
            geography: 'BR',
            'urls-to-consult': ['truc.fr'],
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'illustration-alt': null,
            'contextualized-fields': ['instruction', 'illustration'],
            'require-gafam-website-access': true,
            'is-incompatible-ipad-certif': true,
            'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            'is-awareness-challenge': true,
            'to-rephrase': true,
            'has-embed-internal-validation': true,
            'no-validation-needed': true,
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills',
              },
            },
            'localized-challenges': {
              data: [
                {
                  id: 'recChallengeId1',
                  type: 'localized-challenges',
                },
                {
                  id: 'localizedChallengeId2',
                  type: 'localized-challenges',
                },
              ],
            },
            attachments: {
              links: {
                related: '/api/attachments?filter[localizedChallengeId]=recChallengeId1',
              },
            },
            'challenge-locales': {
              data: [
                {
                  id: 'recChallengeId1-en',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId1-es',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId1-es-419',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId1-fr',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId1-fr-BE',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId1-fr-FR',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId1-nl-BE',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId1-nl',
                  type: 'challenge-locales',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              locale: 'en',
            },
            id: 'recChallengeId1-en',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es',
            },
            id: 'recChallengeId1-es',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es-419',
            },
            id: 'recChallengeId1-es-419',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr',
            },
            id: 'recChallengeId1-fr',
            relationships: {
              'localized-challenge': {
                data: {
                  id: 'recChallengeId1',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-BE',
            },
            id: 'recChallengeId1-fr-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-FR',
            },
            id: 'recChallengeId1-fr-FR',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl-BE',
            },
            id: 'recChallengeId1-nl-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl',
            },
            id: 'recChallengeId1-nl',
            relationships: {
              'localized-challenge': {
                data: {
                  id: 'localizedChallengeId2',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
        ],
      });
      expect(airtableCall.isDone()).to.be.true;
    });

    it("should return a 404 error when the challenge doesn't exist", async () => {
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          filterByFormula: '{id persistant} = "recChallengeId2"',
          maxRecords: 1,
        })
        .reply(200, {
          records: [],
        });

      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges/recChallengeId2',
        headers: generateAuthorizationHeader(user),
      });

      // Then
      expect(response.statusCode).to.equal(404);
      expect(airtableCall.isDone()).to.be.true;
    });
  });

  describe('GET /challenges/:id/preview', () => {
    const challengeId = 'challenge123';
    const localizedChallengeId = challengeId + '_es-419';
    const locale = 'es-419';
    let airtableChallengeScope;
    let airtableAttachmentScope;
    let challenge;
    let primaryLocalizedChallenge;

    beforeEach(async function () {
      challenge = domainBuilder.buildChallengeDatasourceObject({
        id: challengeId,
        locales: ['fr', 'fr-fr'],
        status: Challenge.STATUSES.VALIDE,
        competenceId: 'competence1',
        files: [{ fileId: 'fileId', localizedChallengeId }],
      });

      airtableChallengeScope = airtableBuilder
        .mockList({ tableName: 'Epreuves' })
        .returns([airtableBuilder.factory.buildChallenge(challenge)])
        .activate().nockScope;

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challenge.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challenge);

      const attachment = domainBuilder.buildAttachmentDatasourceObject({
        id: 'fileId',
        challengeId,
        localizedChallengeId,
        type: 'illustration',
        url: 'illustration url',
      });
      const airtableAttachment = airtableBuilder.factory.buildAttachment(attachment);
      airtableAttachmentScope = airtableBuilder
        .mockList({ tableName: 'Attachments' })
        .returns([airtableAttachment])
        .activate().nockScope;

      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.instruction`,
        locale,
        value: 'instruction for es',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.alternativeInstruction`,
        locale,
        value: 'alternative instruction for es',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.solution`,
        locale,
        value: 'solution for es',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.solutionToDisplay`,
        locale,
        value: 'solution to display for es',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.proposals`,
        locale,
        value: 'proposals for es',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.embedTitle`,
        locale,
        value: 'embed title for es',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.illustrationAlt`,
        locale,
        value: 'illustration alt for es',
      });

      primaryLocalizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
        geography: 'BR',
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: false,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: localizedChallengeId,
        challengeId,
        locale,
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: null,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      });

      databaseBuilder.factory.buildAttachment(attachment);

      await databaseBuilder.commit();
    });

    it('should redirect to a staging Pix App preview URL', async () => {
      // given
      const apiToken = 'secret';
      const apiTokenScope = nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { access_token: apiToken });
      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch(`/api/cache/challenges/${localizedChallengeId}`, {
          id: 'challenge123_es-419',
          alpha: challenge.alpha,
          alternativeInstruction: 'alternative instruction for es',
          autoReply: challenge.autoReply,
          competenceId: 'competence1',
          delta: challenge.delta,
          embedUrl: null,
          embedTitle: 'embed title for es',
          embedHeight: challenge.embedHeight,
          focusable: challenge.focusable,
          format: challenge.format,
          genealogy: challenge.genealogy,
          illustrationAlt: 'illustration alt for es',
          illustrationUrl: 'illustration url',
          instruction: 'instruction for es',
          locales: ['es-419'],
          proposals: 'proposals for es',
          responsive: challenge.responsive,
          solution: 'solution for es',
          solutionToDisplay: 'solution to display for es',
          status: 'proposé',
          skillId: challenge.skillId,
          t1Status: challenge.t1Status,
          t2Status: challenge.t2Status,
          t3Status: challenge.t3Status,
          timer: challenge.timer,
          type: challenge.type,
          shuffled: challenge.shuffled,
          alternativeVersion: challenge.alternativeVersion,
          accessibility1: challenge.accessibility1,
          accessibility2: challenge.accessibility2,
          requireGafamWebsiteAccess: primaryLocalizedChallenge.requireGafamWebsiteAccess,
          isIncompatibleIpadCertif: primaryLocalizedChallenge.isIncompatibleIpadCertif,
          deafAndHardOfHearing: primaryLocalizedChallenge.deafAndHardOfHearing,
          isAwarenessChallenge: primaryLocalizedChallenge.isAwarenessChallenge,
          toRephrase: primaryLocalizedChallenge.toRephrase,
          hasEmbedInternalValidation: primaryLocalizedChallenge.hasEmbedInternalValidation,
          noValidationNeeded: primaryLocalizedChallenge.noValidationNeeded,
        })
        .matchHeader('Authorization', `Bearer ${apiToken}`)
        .reply(200);

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/challenges/${challengeId}/preview?locale=${locale}`,
      });

      // then
      expect(response.statusCode).to.equal(302);
      expect(response.headers.location).to.equal(
        `https://app.test.pix.org/challenges/${localizedChallengeId}/preview?lang=${locale}`,
      );

      apiTokenScope.done();
      apiCacheScope.done();
      airtableChallengeScope.done();
      airtableAttachmentScope.done();
    });
  });

  describe('GET /challenges/:id/translations/:locale/framework-name/:frameworkName/area-code/:code', () => {
    it('should redirect to the phrase project corresponding to area code', async () => {
      // given
      vi.spyOn(config.phrase, 'projects', 'get').mockReturnValue([
        { areaCode: 2, projectId: 'PHRASE_PROJECT_ID_AREA_3', frameworkName: 'Pix+' },
        { areaCode: 1, projectId: 'PHRASE_PROJECT_ID_AREA_1', frameworkName: 'Pix' },
        { areaCode: 2, projectId: 'PHRASE_PROJECT_ID_AREA_2', frameworkName: 'Pix' },
      ]);
      const challengeId = 'challenge123';
      const locale = 'nl';

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({ id: challengeId, skillId: 'skill1' }),
      );

      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge123_nl',
        challengeId,
        locale,
      });

      await databaseBuilder.commit();

      const phraseAccountsApiScope = nock('https://api.phrase.com')
        .get('/v2/accounts')
        .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
        .query({ page: 1 })
        .reply(200, [
          {
            id: 'pixAccountId',
            name: 'Pix',
          },
        ]);

      const phraseLocalesApiScope = nock('https://api.phrase.com')
        .get('/v2/projects/PHRASE_PROJECT_ID_AREA_2/locales')
        .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
        .reply(200, [
          {
            id: 'frLocaleId',
            name: 'fr',
            code: 'fr',
            default: true,
          },
          {
            id: 'enLocaleId',
            name: 'en',
            code: 'en',
            default: false,
          },
          {
            id: 'nlLocaleId',
            name: 'nl',
            code: 'nl',
            default: false,
          },
        ]);

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/challenges/${challengeId}/translations/${locale}/framework-name/Pix/area-code/2`,
      });

      // then
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(
        `https://app.phrase.com/editor/v4/accounts/pixAccountId/projects/PHRASE_PROJECT_ID_AREA_2?search=keyNameQuery%3Achallenge.${challengeId}&locales=%27frLocaleId%27%2C%27nlLocaleId%27`,
      );

      expect(phraseAccountsApiScope.isDone()).toBe(true);
      expect(phraseLocalesApiScope.isDone()).toBe(true);
    });
  });

  describe('POST /challenges', () => {
    let user;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
    });

    it('should create a challenge', async () => {
      // Given
      const challengeData = {
        ...domainBuilder.buildChallengeDatasourceObject({ id: 'challengeId', locales: ['fr'] }),
        geography: 'MZ',
        instruction: 'consigne',
        alternativeInstruction: 'consigne alternative',
        solution: 'solution',
        solutionToDisplay: 'solution à afficher',
        proposals: 'propositions',
        embedTitle: "Titre d'embed",
      };
      const airtableChallenge = airtableBuilder.factory.buildChallenge(challengeData);
      const expectedBodyChallenge = _removeReadonlyFields(airtableChallenge, true);
      const expectedBody = { records: [expectedBodyChallenge] };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challengeData.skillId, tubeId: 'tube1' });
      await databaseBuilder.commit();

      const airtableCall = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Epreuves/?', expectedBody)
        .reply(200, { records: [airtableChallenge] });
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/challenges',
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'challenges',
            id: challengeData.id,
            attributes: {
              instruction: challengeData.instruction,
              'alternative-instruction': challengeData.alternativeInstruction,
              type: challengeData.type,
              format: challengeData.format,
              proposals: challengeData.proposals,
              solution: challengeData.solution,
              'solution-to-display': challengeData.solutionToDisplay,
              't1-status': challengeData.t1Status,
              't2-status': challengeData.t2Status,
              't3-status': challengeData.t3Status,
              pedagogy: challengeData.pedagogy,
              author: challengeData.author,
              declinable: challengeData.declinable,
              version: challengeData.version,
              genealogy: challengeData.genealogy,
              status: challengeData.status,
              preview: challengeData.preview,
              timer: challengeData.timer,
              'embed-url': challengeData.embedUrl,
              'embed-title': challengeData.embedTitle,
              'embed-height': challengeData.embedHeight,
              'alternative-version': challengeData.alternativeVersion,
              accessibility1: challengeData.accessibility1,
              accessibility2: challengeData.accessibility2,
              spoil: challengeData.spoil,
              responsive: challengeData.responsive,
              locales: challengeData.locales,
              geography: challengeData.geography,
              'urls-to-consult': ['firstLink', 'secondLink'],
              'auto-reply': challengeData.autoReply,
              focusable: challengeData.focusable,
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
              'has-embed-internal-validation': true,
              'no-validation-needed': true,
            },
            relationships: {
              skill: {
                data: {
                  type: 'skills',
                  id: challengeData.skills[0],
                },
              },
              attachments: {
                data: challengeData.files.map(({ fileId }) => {
                  return {
                    type: 'attachments',
                    id: fileId,
                  };
                }),
              },
            },
          },
        },
      });

      // Then
      expect(airtableCall.isDone()).to.be.true;
      expect(response.statusCode).to.equal(201);
      expect(response.result).to.deep.equal({
        data: {
          type: 'challenges',
          id: 'challengeId',
          attributes: {
            'airtable-id': challengeData.airtableId,
            instruction: 'consigne',
            'alternative-instruction': 'consigne alternative',
            type: Challenge.TYPES.QCM,
            format: Challenge.FORMATS.MOTS,
            proposals: 'propositions',
            solution: 'solution',
            'solution-to-display': 'solution à afficher',
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
            author: ['SPS'],
            declinable: Challenge.DECLINABLES.FACILEMENT,
            version: 1,
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
            preview: '/api/challenges/challengeId/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': "Titre d'embed",
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: Challenge.ACCESSIBILITY1.OK,
            accessibility2: Challenge.ACCESSIBILITY2.RAS,
            spoil: Challenge.SPOILS.NON_SPOILABLE,
            responsive: Challenge.RESPONSIVES.NON,
            'alternative-locales': [],
            locales: ['fr'],
            geography: 'MZ',
            'urls-to-consult': ['firstLink', 'secondLink'],
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'illustration-alt': null,
            'contextualized-fields': ['instruction', 'illustration'],
            'require-gafam-website-access': true,
            'is-incompatible-ipad-certif': true,
            'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            'is-awareness-challenge': true,
            'to-rephrase': true,
            'has-embed-internal-validation': true,
            'no-validation-needed': true,
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills',
              },
            },
            'localized-challenges': {
              data: [
                {
                  id: 'challengeId',
                  type: 'localized-challenges',
                },
              ],
            },
            attachments: {
              links: {
                related: '/api/attachments?filter[localizedChallengeId]=challengeId',
              },
            },
            'challenge-locales': {
              data: [
                {
                  id: 'challengeId-en',
                  type: 'challenge-locales',
                },
                {
                  id: 'challengeId-es',
                  type: 'challenge-locales',
                },
                {
                  id: 'challengeId-es-419',
                  type: 'challenge-locales',
                },
                {
                  id: 'challengeId-fr',
                  type: 'challenge-locales',
                },
                {
                  id: 'challengeId-fr-BE',
                  type: 'challenge-locales',
                },
                {
                  id: 'challengeId-fr-FR',
                  type: 'challenge-locales',
                },
                {
                  id: 'challengeId-nl-BE',
                  type: 'challenge-locales',
                },
                {
                  id: 'challengeId-nl',
                  type: 'challenge-locales',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              locale: 'en',
            },
            id: 'challengeId-en',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es',
            },
            id: 'challengeId-es',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es-419',
            },
            id: 'challengeId-es-419',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr',
            },
            id: 'challengeId-fr',
            relationships: {
              'localized-challenge': {
                data: {
                  id: 'challengeId',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-BE',
            },
            id: 'challengeId-fr-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-FR',
            },
            id: 'challengeId-fr-FR',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl-BE',
            },
            id: 'challengeId-nl-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl',
            },
            id: 'challengeId-nl',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
        ],
      });
      await expect(knex.select('*').from('challenges')).resolves.toStrictEqual([
        {
          accessibility1: challengeData.accessibility1,
          accessibility2: challengeData.accessibility2,
          alternativeVersion: challengeData.alternativeVersion,
          alpha: null,
          archivedAt: null,
          author: challengeData.author,
          autoReply: challengeData.autoReply,
          contextualizedFields: challengeData.contextualizedFields,
          createdAt: expect.any(Date),
          declinable: challengeData.declinable,
          delta: null,
          embedHeight: challengeData.embedHeight,
          focusable: challengeData.focusable,
          format: challengeData.format,
          genealogy: challengeData.genealogy,
          id: challengeData.id,
          locales: challengeData.locales,
          madeObsoleteAt: null,
          pedagogy: challengeData.pedagogy,
          responsive: challengeData.responsive,
          shuffled: challengeData.shuffled,
          skillId: challengeData.skillId,
          spoil: challengeData.spoil,
          status: challengeData.status,
          t1Status: challengeData.t1Status,
          t2Status: challengeData.t2Status,
          t3Status: challengeData.t3Status,
          timer: challengeData.timer,
          type: challengeData.type,
          updatedAt: expect.any(Date),
          validatedAt: null,
          version: challengeData.version,
        },
      ]);
      await expect(knex('localized_challenges').select()).resolves.toStrictEqual([
        {
          id: 'challengeId',
          challengeId: 'challengeId',
          locale: 'fr',
          embedUrl: challengeData.embedUrl,
          status: null,
          geography: 'MZ',
          urlsToConsult: ['firstLink', 'secondLink'],
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
          validatedAt: null,
        },
      ]);
      await expect(knex('translations').select('key', 'locale', 'value').orderBy('key')).resolves.toStrictEqual([
        {
          key: 'challenge.challengeId.alternativeInstruction',
          locale: 'fr',
          value: 'consigne alternative',
        },
        {
          key: 'challenge.challengeId.embedTitle',
          locale: 'fr',
          value: challengeData.embedTitle,
        },
        {
          key: 'challenge.challengeId.instruction',
          locale: 'fr',
          value: 'consigne',
        },
        {
          key: 'challenge.challengeId.proposals',
          locale: 'fr',
          value: 'propositions',
        },
        {
          key: 'challenge.challengeId.solution',
          locale: 'fr',
          value: 'solution',
        },
        {
          key: 'challenge.challengeId.solutionToDisplay',
          locale: 'fr',
          value: 'solution à afficher',
        },
      ]);
    });

    it('should NOT patch the cache on PIX API', async () => {
      // Given
      const challenge = {
        ...domainBuilder.buildChallengeDatasourceObject({ id: 'recChallengeId', locales: ['fr'] }),
        instruction: 'consigne',
        alternativeInstruction: 'consigne alternative',
        solution: 'solution',
        solutionToDisplay: 'solution à afficher',
        proposals: 'propositions',
        embedTitle: "Titre d'embed",
      };
      const airtableChallenge = airtableBuilder.factory.buildChallenge(challenge);
      const expectedBodyChallenge = _removeReadonlyFields(airtableChallenge, true);
      const expectedBody = { records: [expectedBodyChallenge] };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challenge.skillId, tubeId: 'tube1' });
      await databaseBuilder.commit();

      const airtableCall = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Epreuves/?', expectedBody)
        .reply(200, { records: [airtableChallenge] });

      const attachmentsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments')
        .query(() => true)
        .reply(200, { records: [] });

      const apiScope = nock('https://api.test.pix.fr')
        .post(/.*/, () => true)
        .reply(401)
        .patch(/.*/, () => true)
        .reply(401);

      const server = await createServer();
      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/challenges',
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'challenges',
            id: challenge.id,
            attributes: {
              instruction: challenge.instruction,
              'alternative-instruction': challenge.alternativeInstruction,
              type: challenge.type,
              format: challenge.format,
              proposals: challenge.proposals,
              solution: challenge.solution,
              'solution-to-display': challenge.solutionToDisplay,
              't1-status': challenge.t1Status,
              't2-status': challenge.t2Status,
              't3-status': challenge.t3Status,
              pedagogy: challenge.pedagogy,
              author: challenge.author,
              declinable: challenge.declinable,
              version: challenge.version,
              genealogy: challenge.genealogy,
              status: challenge.status,
              preview: challenge.preview,
              timer: challenge.timer,
              'embed-url': challenge.embedUrl,
              'embed-title': challenge.embedTitle,
              'embed-height': challenge.embedHeight,
              'alternative-version': challenge.alternativeVersion,
              accessibility1: challenge.accessibility1,
              accessibility2: challenge.accessibility2,
              spoil: challenge.spoil,
              responsive: challenge.responsive,
              locales: challenge.locales,
              geography: challenge.geography,
              'auto-reply': challenge.autoReply,
              focusable: challenge.focusable,
              'validated-at': challenge.validatedAt,
              'archived-at': challenge.archivedAt,
              'made-obsolete-at': challenge.madeObsoleteAt,
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
            },
            relationships: {
              skill: {
                data: {
                  type: 'skills',
                  id: challenge.skills[0],
                },
              },
              attachments: {
                data: [
                  {
                    id: 'attachment recordId generated by Airtable',
                    type: 'attachments',
                  },
                ],
              },
            },
          },
        },
      });

      // Then
      expect(response).to.have.property('statusCode', 201);
      expect(airtableCall.isDone()).to.be.true;
      expect(attachmentsScope.isDone()).to.be.false;
      expect(apiScope.isDone()).to.be.false;
    });

    describe('when no base URL is defined for Pix API', () => {
      beforeEach(() => {
        vi.spyOn(config.pixApi, 'baseUrl', 'get').mockReturnValue(undefined);
      });

      it('should NOT invalidate the cache on the PIX API', async () => {
        // Given
        const challenge = domainBuilder.buildChallengeDatasourceObject({ id: 'recChallengeId', locales: ['fr'] });
        const expectedBodyChallenge = _removeReadonlyFields(airtableBuilder.factory.buildChallenge(challenge), true);
        const expectedBody = { records: [expectedBodyChallenge] };

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
        databaseBuilder.factory.buildSkill({ id: challenge.skillId, tubeId: 'tube1' });
        await databaseBuilder.commit();

        const airtableCall = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Epreuves/?', expectedBody)
          .reply(200, { records: [airtableBuilder.factory.buildChallenge(challenge)] });
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/challenges',
          headers: generateAuthorizationHeader(user),
          payload: {
            data: {
              type: 'challenges',
              id: challenge.id,
              attributes: {
                instruction: challenge.instruction,
                'alternative-instruction': challenge.alternativeInstruction,
                type: challenge.type,
                format: challenge.format,
                proposals: challenge.proposals,
                solution: challenge.solution,
                'solution-to-display': challenge.solutionToDisplay,
                't1-status': challenge.t1Status,
                't2-status': challenge.t2Status,
                't3-status': challenge.t3Status,
                pedagogy: challenge.pedagogy,
                author: challenge.author,
                declinable: challenge.declinable,
                version: challenge.version,
                genealogy: challenge.genealogy,
                status: challenge.status,
                preview: challenge.preview,
                timer: challenge.timer,
                'embed-url': challenge.embedUrl,
                'embed-title': challenge.embedTitle,
                'embed-height': challenge.embedHeight,
                'alternative-version': challenge.alternativeVersion,
                accessibility1: challenge.accessibility1,
                accessibility2: challenge.accessibility2,
                spoil: challenge.spoil,
                responsive: challenge.responsive,
                locales: challenge.locales,
                geography: challenge.geography,
                'auto-reply': challenge.autoReply,
                focusable: challenge.focusable,
                'validated-at': challenge.validatedAt,
                'archived-at': challenge.archivedAt,
                'made-obsolete-at': challenge.madeObsoleteAt,
                shuffled: false,
                'contextualized-fields': ['instruction', 'illustration'],
              },
              relationships: {
                skill: {
                  data: {
                    type: 'skills',
                    id: challenge.skills[0],
                  },
                },
                attachments: {
                  data: [
                    {
                      type: 'attachments',
                      id: 'attachment recordId generated by Airtable',
                    },
                  ],
                },
              },
            },
          },
        });

        // Then
        expect(response).to.have.property('statusCode', 201);
        expect(airtableCall.isDone()).to.be.true;
      });
    });
  });

  describe('PATCH /challenge', () => {
    let user;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildAdminUser();
    });

    it('should update a challenge', async () => {
      // Given
      const challengeId = 'recChallengeId';
      const locale = 'fr';
      const challenge = {
        ...domainBuilder.buildChallengeDatasourceObject({ id: challengeId, locales: [locale] }),
        instruction: 'consigne',
        alternativeInstruction: 'consigne alternative',
        solution: 'solution',
        solutionToDisplay: 'solution à afficher',
        proposals: 'propositions',
        embedTitle: "Titre d'embed",
        geography: 'NL',
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challenge.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challenge);

      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        embedUrl: 'old_url',
        urlsToConsult: ['pouet'],
        locale,
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge_localized_nl',
        challengeId,
        embedUrl: 'url_nl',
        urlsToConsult: ['toot'],
        locale: 'nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.instruction`,
        locale,
        value: "Ancienne valeur de l'instruction",
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.alternativeInstruction`,
        locale,
        value: challenge.alternativeInstruction,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.solution`,
        locale,
        value: challenge.solution,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.solutionToDisplay`,
        locale,
        value: challenge.solutionToDisplay,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.proposals`,
        locale,
        value: challenge.proposals,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.embedTitle`,
        locale,
        value: challenge.embedTitle,
      });
      await databaseBuilder.commit();

      const newChallenge = {
        ...challenge,
        type: Challenge.TYPES.QCU,
        author: [...challenge.author, 'NIC'],
        t1Status: false,
        t2Status: true,
        t3Status: false,
      };

      const airtableChallenge = airtableBuilder.factory.buildChallenge(newChallenge);
      const expectedBodyChallenge = _removeReadonlyFields(airtableChallenge);
      const expectedBody = { records: [expectedBodyChallenge] };

      const airtableCall = nock('https://api.airtable.com')
        .patch('/v0/airtableBaseValue/Epreuves/?', expectedBody)
        .reply(200, { records: [airtableChallenge] });
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/challenges/${challenge.id}`,
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'challenges',
            id: newChallenge.id,
            attributes: {
              'airtable-id': newChallenge.airtableId,
              instruction: newChallenge.instruction,
              'alternative-instruction': newChallenge.alternativeInstruction,
              type: newChallenge.type,
              format: newChallenge.format,
              proposals: newChallenge.proposals,
              solution: newChallenge.solution,
              'solution-to-display': newChallenge.solutionToDisplay,
              't1-status': newChallenge.t1Status,
              't2-status': newChallenge.t2Status,
              't3-status': newChallenge.t3Status,
              pedagogy: newChallenge.pedagogy,
              author: newChallenge.author,
              declinable: newChallenge.declinable,
              version: newChallenge.version,
              genealogy: newChallenge.genealogy,
              status: newChallenge.status,
              preview: newChallenge.preview,
              timer: newChallenge.timer,
              'embed-url': newChallenge.embedUrl,
              'embed-title': newChallenge.embedTitle,
              'embed-height': newChallenge.embedHeight,
              'alternative-version': newChallenge.alternativeVersion,
              accessibility1: newChallenge.accessibility1,
              accessibility2: newChallenge.accessibility2,
              spoil: newChallenge.spoil,
              responsive: newChallenge.responsive,
              locales: newChallenge.locales,
              geography: newChallenge.geography,
              'urls-to-consult': ['pouet.com'],
              'auto-reply': newChallenge.autoReply,
              focusable: newChallenge.focusable,
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
              'require-gafam-website-access': false,
              'is-incompatible-ipad-certif': false,
              'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
              'is-awareness-challenge': false,
              'to-rephrase': false,
              'has-embed-internal-validation': true,
              'no-validation-needed': true,
            },
            relationships: {
              skill: {
                data: {
                  type: 'skills',
                  id: challenge.skills[0],
                },
              },
              attachments: {
                data: challenge.files.map(({ fileId }) => {
                  return {
                    type: 'attachments',
                    id: fileId,
                  };
                }),
              },
            },
          },
        },
      });

      // Then
      expect(airtableCall.isDone()).to.be.true;
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'challenges',
          id: 'recChallengeId',
          attributes: {
            'airtable-id': challenge.airtableId,
            instruction: 'consigne',
            'alternative-instruction': 'consigne alternative',
            type: Challenge.TYPES.QCU,
            format: Challenge.FORMATS.MOTS,
            proposals: 'propositions',
            solution: 'solution',
            'solution-to-display': 'solution à afficher',
            't1-status': false,
            't2-status': true,
            't3-status': false,
            pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
            author: ['SPS', 'NIC'],
            declinable: Challenge.DECLINABLES.FACILEMENT,
            version: 1,
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
            preview: '/api/challenges/recChallengeId/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': "Titre d'embed",
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: Challenge.ACCESSIBILITY1.OK,
            accessibility2: Challenge.ACCESSIBILITY2.RAS,
            spoil: Challenge.SPOILS.NON_SPOILABLE,
            responsive: Challenge.RESPONSIVES.NON,
            'alternative-locales': ['nl'],
            locales: ['fr'],
            geography: 'NL',
            'urls-to-consult': ['pouet.com'],
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'illustration-alt': null,
            'contextualized-fields': ['instruction', 'illustration'],
            'require-gafam-website-access': false,
            'is-incompatible-ipad-certif': false,
            'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
            'is-awareness-challenge': false,
            'to-rephrase': false,
            'has-embed-internal-validation': true,
            'no-validation-needed': true,
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills',
              },
            },
            'localized-challenges': {
              data: [
                {
                  id: 'recChallengeId',
                  type: 'localized-challenges',
                },
                {
                  id: 'challenge_localized_nl',
                  type: 'localized-challenges',
                },
              ],
            },
            attachments: {
              links: {
                related: '/api/attachments?filter[localizedChallengeId]=recChallengeId',
              },
            },
            'challenge-locales': {
              data: [
                {
                  id: 'recChallengeId-en',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-es',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-es-419',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-fr',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-fr-BE',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-fr-FR',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-nl-BE',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-nl',
                  type: 'challenge-locales',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              locale: 'en',
            },
            id: 'recChallengeId-en',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es',
            },
            id: 'recChallengeId-es',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es-419',
            },
            id: 'recChallengeId-es-419',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr',
            },
            id: 'recChallengeId-fr',
            relationships: {
              'localized-challenge': {
                data: {
                  id: 'recChallengeId',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-BE',
            },
            id: 'recChallengeId-fr-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-FR',
            },
            id: 'recChallengeId-fr-FR',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl-BE',
            },
            id: 'recChallengeId-nl-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl',
            },
            id: 'recChallengeId-nl',
            relationships: {
              'localized-challenge': {
                data: {
                  id: 'challenge_localized_nl',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
        ],
      });

      await expect(knex('challenges').select()).resolves.toStrictEqual([
        {
          accessibility1: newChallenge.accessibility1,
          accessibility2: newChallenge.accessibility2,
          alternativeVersion: newChallenge.alternativeVersion,
          alpha: newChallenge.alpha,
          archivedAt: new Date(newChallenge.archivedAt),
          author: newChallenge.author,
          autoReply: newChallenge.autoReply,
          contextualizedFields: newChallenge.contextualizedFields,
          createdAt: new Date(newChallenge.createdAt),
          declinable: newChallenge.declinable,
          delta: newChallenge.delta,
          embedHeight: newChallenge.embedHeight,
          focusable: newChallenge.focusable,
          format: newChallenge.format,
          genealogy: newChallenge.genealogy,
          id: newChallenge.id,
          locales: newChallenge.locales,
          madeObsoleteAt: new Date(newChallenge.madeObsoleteAt),
          pedagogy: newChallenge.pedagogy,
          responsive: newChallenge.responsive,
          shuffled: newChallenge.shuffled,
          skillId: newChallenge.skillId,
          spoil: newChallenge.spoil,
          status: newChallenge.status,
          t1Status: newChallenge.t1Status,
          t2Status: newChallenge.t2Status,
          t3Status: newChallenge.t3Status,
          timer: newChallenge.timer,
          type: newChallenge.type,
          updatedAt: expect.any(Date),
          validatedAt: new Date(newChallenge.validatedAt),
          version: newChallenge.version,
        },
      ]);

      await expect(knex('localized_challenges').select().where('id', challengeId).first()).resolves.to.deep.include({
        embedUrl: challenge.embedUrl,
        urlsToConsult: ['pouet.com'],
        geography: 'NL',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });

      await expect(knex('translations').orderBy('key').select('key', 'locale', 'value')).resolves.to.deep.equal([
        {
          key: 'challenge.recChallengeId.alternativeInstruction',
          locale: 'fr',
          value: challenge.alternativeInstruction,
        },
        {
          key: 'challenge.recChallengeId.embedTitle',
          locale: 'fr',
          value: challenge.embedTitle,
        },
        {
          key: 'challenge.recChallengeId.instruction',
          locale: 'fr',
          value: challenge.instruction,
        },
        {
          key: 'challenge.recChallengeId.proposals',
          locale: 'fr',
          value: challenge.proposals,
        },
        {
          key: 'challenge.recChallengeId.solution',
          locale: 'fr',
          value: challenge.solution,
        },
        {
          key: 'challenge.recChallengeId.solutionToDisplay',
          locale: 'fr',
          value: challenge.solutionToDisplay,
        },
      ]);
    });

    it('should change challenge’s primary locale', async () => {
      // Given
      const challengeId = 'recChallengeId';
      const originalLocale = 'fr-fr';
      const newLocales = ['fr', 'fr-fr'];

      const challenge = {
        ...domainBuilder.buildChallengeDatasourceObject({ id: challengeId, locales: newLocales }),
        instruction: 'consigne',
        alternativeInstruction: 'consigne alternative',
        solution: 'solution',
        solutionToDisplay: 'solution à afficher',
        proposals: 'propositions',
        embedTitle: "Titre d'embed",
        geography: 'JM',
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challenge.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge({ ...challenge, locales: [originalLocale] });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: originalLocale,
        geography: 'BR',
        urlsToConsult: ['truc'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.instruction`,
        locale: originalLocale,
        value: "Ancienne valeur de l'instruction",
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.alternativeInstruction`,
        locale: originalLocale,
        value: challenge.alternativeInstruction,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.solution`,
        locale: originalLocale,
        value: challenge.solution,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.solutionToDisplay`,
        locale: originalLocale,
        value: challenge.solutionToDisplay,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.proposals`,
        locale: originalLocale,
        value: challenge.proposals,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.embedTitle`,
        locale: originalLocale,
        value: challenge.embedTitle,
      });
      await databaseBuilder.commit();

      const airtableChallenge = airtableBuilder.factory.buildChallenge(challenge);
      const expectedBodyChallenge = _removeReadonlyFields(airtableChallenge);
      const expectedBody = { records: [expectedBodyChallenge] };

      const airtableCall = nock('https://api.airtable.com')
        .patch('/v0/airtableBaseValue/Epreuves/?', expectedBody)
        .reply(200, { records: [airtableChallenge] });
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/challenges/${challenge.id}`,
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'challenges',
            id: challenge.id,
            attributes: {
              'airtable-id': challenge.airtableId,
              instruction: challenge.instruction,
              'alternative-instruction': challenge.alternativeInstruction,
              type: challenge.type,
              format: challenge.format,
              proposals: challenge.proposals,
              solution: challenge.solution,
              'solution-to-display': challenge.solutionToDisplay,
              't1-status': challenge.t1Status,
              't2-status': challenge.t2Status,
              't3-status': challenge.t3Status,
              pedagogy: challenge.pedagogy,
              author: challenge.author,
              declinable: challenge.declinable,
              version: challenge.version,
              genealogy: challenge.genealogy,
              status: challenge.status,
              preview: challenge.preview,
              timer: challenge.timer,
              'embed-url': challenge.embedUrl,
              'embed-title': challenge.embedTitle,
              'embed-height': challenge.embedHeight,
              'alternative-version': challenge.alternativeVersion,
              accessibility1: challenge.accessibility1,
              accessibility2: challenge.accessibility2,
              spoil: challenge.spoil,
              responsive: challenge.responsive,
              locales: challenge.locales,
              geography: challenge.geography,
              'urls-to-consult': ['truc'],
              'auto-reply': challenge.autoReply,
              focusable: challenge.focusable,
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
              'has-embed-internal-validation': false,
              'no-validation-needed': false,
            },
            relationships: {
              skill: {
                data: {
                  type: 'skills',
                  id: challenge.skills[0],
                },
              },
              attachments: {
                data: challenge.files.map(({ fileId }) => {
                  return {
                    type: 'attachments',
                    id: fileId,
                  };
                }),
              },
            },
          },
        },
      });

      // Then
      expect(airtableCall.isDone()).to.be.true;
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'challenges',
          id: 'recChallengeId',
          attributes: {
            'airtable-id': challenge.airtableId,
            instruction: 'consigne',
            'alternative-instruction': 'consigne alternative',
            type: Challenge.TYPES.QCM,
            format: Challenge.FORMATS.MOTS,
            proposals: 'propositions',
            solution: 'solution',
            'solution-to-display': 'solution à afficher',
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
            author: ['SPS'],
            declinable: Challenge.DECLINABLES.FACILEMENT,
            version: 1,
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
            preview: '/api/challenges/recChallengeId/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': "Titre d'embed",
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: Challenge.ACCESSIBILITY1.OK,
            accessibility2: Challenge.ACCESSIBILITY2.RAS,
            spoil: Challenge.SPOILS.NON_SPOILABLE,
            responsive: Challenge.RESPONSIVES.NON,
            'alternative-locales': [],
            locales: ['fr', 'fr-fr'],
            geography: 'JM',
            'urls-to-consult': ['truc'],
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'illustration-alt': null,
            'contextualized-fields': ['instruction', 'illustration'],
            'require-gafam-website-access': true,
            'is-incompatible-ipad-certif': true,
            'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            'is-awareness-challenge': true,
            'to-rephrase': true,
            'has-embed-internal-validation': false,
            'no-validation-needed': false,
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills',
              },
            },
            'localized-challenges': {
              data: [
                {
                  id: challenge.id,
                  type: 'localized-challenges',
                },
              ],
            },
            attachments: {
              links: {
                related: '/api/attachments?filter[localizedChallengeId]=recChallengeId',
              },
            },
            'challenge-locales': {
              data: [
                {
                  id: 'recChallengeId-en',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-es',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-es-419',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-fr',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-fr-BE',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-fr-FR',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-nl-BE',
                  type: 'challenge-locales',
                },
                {
                  id: 'recChallengeId-nl',
                  type: 'challenge-locales',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              locale: 'en',
            },
            id: 'recChallengeId-en',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es',
            },
            id: 'recChallengeId-es',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'es-419',
            },
            id: 'recChallengeId-es-419',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr',
            },
            id: 'recChallengeId-fr',
            relationships: {
              'localized-challenge': {
                data: {
                  id: 'recChallengeId',
                  type: 'localized-challenges',
                },
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-BE',
            },
            id: 'recChallengeId-fr-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'fr-FR',
            },
            id: 'recChallengeId-fr-FR',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl-BE',
            },
            id: 'recChallengeId-nl-BE',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
          {
            attributes: {
              locale: 'nl',
            },
            id: 'recChallengeId-nl',
            relationships: {
              'localized-challenge': {
                data: null,
              },
            },
            type: 'challenge-locales',
          },
        ],
      });

      await expect(knex('challenges').select()).resolves.toStrictEqual([
        {
          accessibility1: challenge.accessibility1,
          accessibility2: challenge.accessibility2,
          alternativeVersion: challenge.alternativeVersion,
          alpha: challenge.alpha,
          archivedAt: new Date(challenge.archivedAt),
          author: challenge.author,
          autoReply: challenge.autoReply,
          contextualizedFields: challenge.contextualizedFields,
          createdAt: new Date(challenge.createdAt),
          declinable: challenge.declinable,
          delta: challenge.delta,
          embedHeight: challenge.embedHeight,
          focusable: challenge.focusable,
          format: challenge.format,
          genealogy: challenge.genealogy,
          id: challenge.id,
          locales: challenge.locales,
          madeObsoleteAt: new Date(challenge.madeObsoleteAt),
          pedagogy: challenge.pedagogy,
          responsive: challenge.responsive,
          shuffled: challenge.shuffled,
          skillId: challenge.skillId,
          spoil: challenge.spoil,
          status: challenge.status,
          t1Status: challenge.t1Status,
          t2Status: challenge.t2Status,
          t3Status: challenge.t3Status,
          timer: challenge.timer,
          type: challenge.type,
          updatedAt: expect.any(Date),
          validatedAt: new Date(challenge.validatedAt),
          version: challenge.version,
        },
      ]);

      await expect(knex('localized_challenges').select()).resolves.to.deep.equal([
        {
          id: challengeId,
          challengeId,
          embedUrl: challenge.embedUrl,
          locale: 'fr',
          status: null,
          geography: 'JM',
          urlsToConsult: ['truc'],
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: false,
          noValidationNeeded: false,
          validatedAt: null,
        },
      ]);

      await expect(knex('translations').orderBy('key').select('key', 'locale', 'value')).resolves.to.deep.equal([
        {
          key: 'challenge.recChallengeId.alternativeInstruction',
          locale: 'fr',
          value: challenge.alternativeInstruction,
        },
        {
          key: 'challenge.recChallengeId.embedTitle',
          locale: 'fr',
          value: challenge.embedTitle,
        },
        {
          key: 'challenge.recChallengeId.instruction',
          locale: 'fr',
          value: challenge.instruction,
        },
        {
          key: 'challenge.recChallengeId.proposals',
          locale: 'fr',
          value: challenge.proposals,
        },
        {
          key: 'challenge.recChallengeId.solution',
          locale: 'fr',
          value: challenge.solution,
        },
        {
          key: 'challenge.recChallengeId.solutionToDisplay',
          locale: 'fr',
          value: challenge.solutionToDisplay,
        },
      ]);
    });
  });
});
