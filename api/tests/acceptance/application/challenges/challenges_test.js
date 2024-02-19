import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import _ from 'lodash';
import {
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  airtableBuilder,
  knex
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import * as config from '../../../../lib/config.js';

const challengeAirtableFields = [
  'id persistant',
  'Compétences (via tube) (id persistant)',
  'Timer',
  'Type d\'épreuve',
  'T1 - Espaces, casse & accents',
  'T2 - Ponctuation',
  'T3 - Distance d\'édition',
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
    if (deleteId) {
      delete body.id;
    }
    return body;
  }

  describe('GET /challenges', () => {
    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
    });

    it('should return challenges', async () => {
      // Given
      const challenge = domainBuilder.buildChallengeDatasourceObject({ id: 'my id' });

      const airtableChallenges = [
        airtableBuilder.factory.buildChallenge(challenge),
      ];
      airtableBuilder.mockList({ tableName: 'Epreuves' })
        .respondsToQuery({
          fields: {
            '': challengeAirtableFields,
          },
          maxRecords: 100,
          sort: [{ field: 'id persistant', direction: 'asc' }],
        })
        .returns(airtableChallenges)
        .activate();

      databaseBuilder.factory.buildTranslation({
        key: 'challenge.my id.instruction',
        locale: 'fr',
        value: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.my id.alternativeInstruction',
        locale: 'fr',
        value: 'Débrouille toi',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.my id.embedTitle',
        locale: 'fr',
        value: 'Epreuve de selection de dossier',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.my id.solution',
        locale: 'fr',
        value: '1, 5',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.my id.solutionToDisplay',
        locale: 'fr',
        value: '1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.my id.proposals',
        locale: 'fr',
        value: '- 1\n- 2\n- 3\n- 4\n- 5',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.my id.instruction',
        locale: 'nl',
        value: 'Hallo',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'my id',
        challengeId: 'my id',
        locale: 'fr',
        embedUrl: 'http://example.com/my_embed.html'
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'my id_nl',
        challengeId: 'my id',
        locale: 'nl'
      });
      await databaseBuilder.commit();

      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges',
        headers: generateAuthorizationHeader(user)
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            type: 'challenges',
            id: 'my id',
            attributes: {
              'airtable-id': challenge.airtableId,
              instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
              'alternative-instruction': 'Débrouille toi',
              type: 'QCM',
              format: 'mots',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
              solution: '1, 5',
              'solution-to-display': '1',
              't1-status': true,
              't2-status': false,
              't3-status': true,
              pedagogy: 'q-situation',
              author: ['SPS'],
              declinable: 'facilement',
              version: 1,
              genealogy: 'Prototype 1',
              status: 'validé',
              preview: '/api/challenges/my id/preview',
              timer: 1234,
              'embed-url': 'http://example.com/my_embed.html',
              'embed-title': 'Epreuve de selection de dossier',
              'embed-height': 500,
              'alternative-version': 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              spoil: 'Non Sp',
              responsive: 'non',
              locales: ['fr'],
              'alternative-locales': ['nl'],
              geography: 'France',
              'auto-reply': false,
              focusable: false,
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
            },
            relationships: {
              skill: {
                data: {
                  type: 'skills',
                  id: challenge.skills[0],
                }
              },
              files: {
                data: [
                  {
                    id: 'attachment recordId generated by Airtable',
                    type: 'attachments'
                  }
                ]
              },
              'localized-challenges': {
                data: [
                  {
                    id: 'my id',
                    type: 'localized-challenges'
                  },
                  {
                    id: 'my id_nl',
                    type: 'localized-challenges'
                  }
                ]
              }
            }
          },
        ],
      });
    });

    it('should filter challenges by id', async () => {
      // Given
      const challenge1 = domainBuilder.buildChallengeDatasourceObject({ id: '1' });
      const challenge2 = domainBuilder.buildChallengeDatasourceObject({ id: '2' });
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeAirtableFields,
          },
          filterByFormula: 'OR(\'1\' = {id persistant},\'2\' = {id persistant})'
        })
        .reply(200, {
          records: [
            airtableBuilder.factory.buildChallenge(challenge1),
            airtableBuilder.factory.buildChallenge(challenge2),
          ]
        });

      databaseBuilder.factory.buildTranslation({
        key: 'challenge.1.instruction',
        locale: 'fr',
        value: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
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
        value: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
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
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.2.proposals',
        locale: 'nl',
        value: '- 1\n- 2\n- 3\n- 4\n- 5',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: '1',
        challengeId: '1',
        locale: 'fr',
        embedUrl: 'http://example.com/my_embed.html',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: '2',
        challengeId: '2',
        locale: 'fr'
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: '2_nl',
        challengeId: '2',
        locale: 'nl'
      });

      await databaseBuilder.commit();

      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges?filter[ids][]=1&filter[ids][]=2',
        headers: generateAuthorizationHeader(user)
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
              instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
              'alternative-instruction': 'Débrouille toi',
              type: 'QCM',
              format: 'mots',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
              solution: '1, 5',
              'solution-to-display': '1',
              't1-status': true,
              't2-status': false,
              't3-status': true,
              pedagogy: 'q-situation',
              author: ['SPS'],
              declinable: 'facilement',
              version: 1,
              genealogy: 'Prototype 1',
              status: 'validé',
              preview: '/api/challenges/1/preview',
              timer: 1234,
              'embed-url': 'http://example.com/my_embed.html',
              'embed-title': 'Epreuve de selection de dossier',
              'embed-height': 500,
              'alternative-version': 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              spoil: 'Non Sp',
              responsive: 'non',
              locales: ['fr'],
              'alternative-locales': [],
              geography: 'France',
              'auto-reply': false,
              focusable: false,
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
            },
            relationships: {
              skill: {
                data: {
                  id: 'recordId generated by Airtable',
                  type: 'skills'
                }
              },
              files: {
                data: [
                  {
                    id: 'attachment recordId generated by Airtable',
                    type: 'attachments'
                  }
                ]
              },
              'localized-challenges': {
                data: [
                  {
                    id: '1',
                    type: 'localized-challenges',
                  }
                ]
              },
            }
          },
          {
            type: 'challenges',
            id: '2',
            attributes: {
              'airtable-id': challenge2.airtableId,
              instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
              'alternative-instruction': 'Débrouille toi encore',
              type: 'QCM',
              format: 'mots',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
              solution: '1, 5',
              'solution-to-display': '1',
              't1-status': true,
              't2-status': false,
              't3-status': true,
              pedagogy: 'q-situation',
              author: ['SPS'],
              declinable: 'facilement',
              version: 1,
              genealogy: 'Prototype 1',
              status: 'validé',
              preview: '/api/challenges/2/preview',
              timer: 1234,
              'embed-url': null,
              'embed-title': 'Epreuve de selection de dossier',
              'embed-height': 500,
              'alternative-version': 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              spoil: 'Non Sp',
              responsive: 'non',
              locales: ['fr'],
              'alternative-locales': ['nl'],
              geography: 'France',
              'auto-reply': false,
              focusable: false,
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
            },
            relationships: {
              skill: {
                data: {
                  id: 'recordId generated by Airtable',
                  type: 'skills'
                }
              },
              files: {
                data: [
                  {
                    id: 'attachment recordId generated by Airtable',
                    type: 'attachments'
                  }
                ]
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
                  }
                ]
              },
            }
          }
        ]
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
          filterByFormula: 'FIND(\'query term\', LOWER(CONCATENATE({Embed URL})))',
        })
        .reply(200, {
          records: []
        });
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges?filter[search]=query term',
        headers: generateAuthorizationHeader(user)
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
          filterByFormula: 'FIND(\'query term\', LOWER(CONCATENATE({Embed URL})))',
          maxRecords: 20,
        })
        .reply(200, {
          records: []
        });
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges?filter[search]=query term&page[size]=20',
        headers: generateAuthorizationHeader(user)
      });

      // Then
      expect(airtableCall.isDone()).to.be.true;
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({ data: [] });
    });
  });

  describe('GET /challenges/:id', () => {
    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
    });

    it('should return given challenge', async () => {
      // Given
      const challenge = domainBuilder.buildChallengeDatasourceObject({
        id: 'recChallengeId1',
        files: [
          { fileId: 'fileId1', localizedChallengeId: 'recChallengeId1' },
          { fileId: 'fileId2', localizedChallengeId: 'recChallengeId2' },
        ],
      });
      const airtableChallenge = airtableBuilder.factory.buildChallenge(challenge);
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeAirtableFields,
          },
          filterByFormula: 'OR(\'recChallengeId1\' = {id persistant})'
        })
        .reply(200, {
          records: [
            airtableChallenge,
          ]
        });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallengeId1',
        challengeId: 'recChallengeId1',
        locale: 'fr',
        embedUrl: 'https://github.io/page/epreuve.html',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId2',
        challengeId: 'recChallengeId1',
        locale: 'nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId1.instruction',
        locale: 'fr',
        value: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
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

      await databaseBuilder.commit();

      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges/recChallengeId1',
        headers: generateAuthorizationHeader(user)
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'challenges',
          id: 'recChallengeId1',
          attributes: {
            'airtable-id': challenge.airtableId,
            instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
            'alternative-instruction': 'Débrouille toi',
            type: 'QCM',
            format: 'mots',
            proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
            solution: '1, 5',
            'solution-to-display': '1',
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: 'q-situation',
            author: ['SPS'],
            declinable: 'facilement',
            version: 1,
            genealogy: 'Prototype 1',
            status: 'validé',
            preview: '/api/challenges/recChallengeId1/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Epreuve de selection de dossier',
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: 'OK',
            accessibility2: 'RAS',
            spoil: 'Non Sp',
            responsive: 'non',
            locales: ['fr'],
            'alternative-locales': ['nl'],
            geography: 'France',
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'contextualized-fields': ['instruction', 'illustration'],
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills'
              }
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
                }
              ]
            },
            files: {
              data: [
                {
                  id: 'fileId1',
                  type: 'attachments'
                }
              ]
            }
          }
        },
      });
      expect(airtableCall.isDone()).to.be.true;
    });

    it('should return a 404 error when the challenge doesn\'t exist', async () => {
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeAirtableFields,
          },
          filterByFormula: 'OR(\'recChallengeId2\' = {id persistant})'
        })
        .reply(200, {
          records: []
        });

      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges/recChallengeId2',
        headers: generateAuthorizationHeader(user)
      });

      // Then
      expect(response.statusCode).to.equal(404);
      expect(airtableCall.isDone()).to.be.true;
    });
  });

  describe('GET /challenges/:id/preview', () => {
    const challengeId = 'challenge123';
    const localizedChallengeId = challengeId + '_nl';
    const locale = 'nl';
    let airtableChallengeScope;
    let airtableAttachmentScope;
    let attachment;

    beforeEach(async function() {
      airtableChallengeScope = airtableBuilder.mockList({ tableName: 'Epreuves' }).returns([
        airtableBuilder.factory.buildChallenge({
          id: challengeId,
          locales: ['fr', 'fr-fr'],
          status: 'validé',
        })
      ]).activate().nockScope;

      attachment = airtableBuilder.factory.buildAttachment({
        challengeId,
        localizedChallengeId,
        type: 'illustration',
      });
      airtableAttachmentScope = airtableBuilder.mockList({ tableName: 'Attachments' }).returns([attachment]).activate().nockScope;

      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.instruction`,
        locale,
        value: 'instruction for nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.alternativeInstruction`,
        locale,
        value: 'alternative instruction for nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.solution`,
        locale,
        value: 'solution for nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.solutionToDisplay`,
        locale,
        value: 'solution to display for nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.proposals`,
        locale,
        value: 'proposals for nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.embedTitle`,
        locale,
        value: 'embed title for nl',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: localizedChallengeId,
        challengeId,
        locale,
        status: 'proposé',
      });

      await databaseBuilder.commit();
    });

    it('should redirect to a staging Pix App preview URL', async () => {
      // given
      const apiToken = 'secret';
      const apiTokenScope = nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': apiToken });
      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch(`/api/cache/challenges/${localizedChallengeId}`,
          {
            id: 'challenge123_nl',
            alpha: null,
            alternativeInstruction: 'alternative instruction for nl',
            autoReply: false,
            competenceId: null,
            delta: null,
            embedUrl: null,
            embedTitle: 'embed title for nl',
            format: 'mots',
            illustrationAlt: attachment.fields.alt,
            illustrationUrl: attachment.fields.url,
            instruction: 'instruction for nl',
            locales: ['nl'],
            proposals: 'proposals for nl',
            solution: 'solution for nl',
            solutionToDisplay: 'solution to display for nl',
            skillId: null,
            t1Status: false,
            t2Status: false,
            t3Status: false,
            status: 'proposé',
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
      expect(response.headers.location).to.equal(`https://app.test.pix.fr/challenges/${localizedChallengeId}/preview`);

      apiTokenScope.done();
      apiCacheScope.done();
      airtableChallengeScope.done();
      airtableAttachmentScope.done();
    });
  });

  describe('POST /challenges', () => {
    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
    });
    afterEach(async function() {
      await knex('translations').truncate();
      await knex('localized_challenges').delete();
    });

    it('should create a challenge', async () => {
      // Given
      const challenge = {
        ...domainBuilder.buildChallengeDatasourceObject({ id: 'challengeId', locales: ['fr'] }),
        instruction: 'consigne',
        alternativeInstruction: 'consigne alternative',
        solution: 'solution',
        solutionToDisplay: 'solution à afficher',
        proposals: 'propositions',
        embedTitle: 'Titre d\'embed',
      };
      const airtableChallenge = airtableBuilder.factory.buildChallenge(challenge);
      const expectedBodyChallenge = _removeReadonlyFields(airtableChallenge, true);
      const expectedBody = { records: [expectedBodyChallenge] };

      const airtableCall = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Epreuves/?', expectedBody)
        .reply(
          200,
          { records: [airtableChallenge] }
        );
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
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
            },
            relationships: {
              skill: {
                data: {
                  type: 'skills',
                  id: challenge.skills[0],
                }
              },
              files: {
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
      expect(response.statusCode).to.equal(201);
      expect(response.result).to.deep.equal({
        data: {
          type: 'challenges',
          id: 'challengeId',
          attributes: {
            'airtable-id': challenge.airtableId,
            instruction: 'consigne',
            'alternative-instruction': 'consigne alternative',
            type: 'QCM',
            format: 'mots',
            proposals: 'propositions',
            solution: 'solution',
            'solution-to-display': 'solution à afficher',
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: 'q-situation',
            author: ['SPS'],
            declinable: 'facilement',
            version: 1,
            genealogy: 'Prototype 1',
            status: 'validé',
            preview: '/api/challenges/challengeId/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Titre d\'embed',
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: 'OK',
            accessibility2: 'RAS',
            spoil: 'Non Sp',
            responsive: 'non',
            'alternative-locales': [],
            locales: ['fr'],
            geography: 'France',
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'contextualized-fields': ['instruction', 'illustration'],
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills'
              }
            },
            files: {
              data: [
                {
                  id: 'attachment recordId generated by Airtable',
                  type: 'attachments'
                }
              ]
            },
            'localized-challenges': {
              data: [{
                id: 'challengeId',
                type: 'localized-challenges',
              }],
            },
          }
        },
      });
      const localizedChallenges = await knex('localized_challenges').select();
      expect(localizedChallenges).to.deep.equal([
        {
          id: 'challengeId',
          challengeId: 'challengeId',
          locale: 'fr',
          embedUrl: challenge.embedUrl,
          status: null,
        }
      ]);
      const translations = await knex('translations').select().orderBy('key');
      expect(translations).to.deep.equal([
        {
          key: 'challenge.challengeId.alternativeInstruction',
          locale: 'fr',
          value: 'consigne alternative'
        },
        {
          key: 'challenge.challengeId.embedTitle',
          locale: 'fr',
          value: challenge.embedTitle,
        },
        {
          key: 'challenge.challengeId.instruction',
          locale: 'fr',
          value: 'consigne'
        },
        {
          key: 'challenge.challengeId.proposals',
          locale: 'fr',
          value: 'propositions'
        },
        {
          key: 'challenge.challengeId.solution',
          locale: 'fr',
          value: 'solution'
        },
        {
          key: 'challenge.challengeId.solutionToDisplay',
          locale: 'fr',
          value: 'solution à afficher'
        }
      ]);

    });

    it('should invalidate the cache on the PIX API', async () => {
      // Given
      const challenge = {
        ...domainBuilder.buildChallengeDatasourceObject({ id: 'recChallengeId', locales: ['fr'] }),
        instruction: 'consigne',
        alternativeInstruction: 'consigne alternative',
        solution: 'solution',
        solutionToDisplay: 'solution à afficher',
        proposals: 'propositions',
        embedTitle: 'Titre d\'embed',
      };
      const airtableChallenge = airtableBuilder.factory.buildChallenge(challenge);
      const airtableAttachment = airtableBuilder.factory.buildAttachment({
        id: 'attachment recordId generated by Airtable',
        challengeId: challenge.id,
        type: 'attachment',
      });
      const expectedBodyChallenge = _removeReadonlyFields(airtableChallenge, true);
      const expectedBody = { records: [expectedBodyChallenge] };

      const expectedChallengeRelease = domainBuilder.buildChallengeForRelease({
        ...challenge,
        illustrationUrl: null,
        illustrationAlt: null,
        attachments: [airtableAttachment.fields.url]
      });

      const token = 'not-a-real-token';

      const attachmentsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments')
        .query({ filterByFormula: '{localizedChallengeId} = \'recChallengeId\'' })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableAttachment] });

      const apiTokenScope = nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': token });

      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/challenges/recChallengeId', { ...expectedChallengeRelease }) // avoid comparing object prototype
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(200);

      const airtableCall = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Epreuves/?', expectedBody)
        .reply(
          200,
          { records: [airtableChallenge] }
        );
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
                }
              },
              files: {
                data: [
                  {
                    id: 'attachment recordId generated by Airtable',
                    type: 'attachments'
                  }
                ]
              }
            },
          },
        },
      });

      // Then
      expect(response).to.have.property('statusCode', 201);
      expect(attachmentsScope.isDone()).to.be.true;
      expect(apiTokenScope.isDone()).to.be.true;
      expect(airtableCall.isDone()).to.be.true;
      expect(apiCacheScope.isDone()).to.be.true;
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

        const airtableCall = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Epreuves/?', expectedBody)
          .reply(
            200,
            { records: [airtableBuilder.factory.buildChallenge(challenge)] }
          );
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
                files: challenge.files,
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
                  }
                },
                files: {
                  data: [
                    {
                      id: 'attachment recordId generated by Airtable',
                      type: 'attachments'
                    }
                  ]
                }
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
    beforeEach(async function() {
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
        embedTitle: 'Titre d\'embed',
      };
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        embedUrl: 'old_url',
        locale,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challenge_localized_nl',
        challengeId,
        embedUrl: 'url_nl',
        locale: 'nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.instruction`,
        locale,
        value: 'Ancienne valeur de l\'instruction',
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

      const airtableChallenge = airtableBuilder.factory.buildChallenge(challenge);
      const expectedBodyChallenge = _removeReadonlyFields(airtableChallenge);
      const expectedBody = { records: [expectedBodyChallenge] };

      const airtableCall = nock('https://api.airtable.com')
        .patch('/v0/airtableBaseValue/Epreuves/?', expectedBody)
        .reply(
          200,
          { records: [airtableChallenge] }
        );
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
              'auto-reply': challenge.autoReply,
              focusable: challenge.focusable,
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
            },
            relationships: {
              skill: {
                data: {
                  type: 'skills',
                  id: challenge.skills[0],
                }
              },
              files: {
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
            type: 'QCM',
            format: 'mots',
            proposals: 'propositions',
            solution: 'solution',
            'solution-to-display': 'solution à afficher',
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: 'q-situation',
            author: ['SPS'],
            declinable: 'facilement',
            version: 1,
            genealogy: 'Prototype 1',
            status: 'validé',
            preview: '/api/challenges/recChallengeId/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Titre d\'embed',
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: 'OK',
            accessibility2: 'RAS',
            spoil: 'Non Sp',
            responsive: 'non',
            'alternative-locales': ['nl'],
            locales: ['fr'],
            geography: 'France',
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'contextualized-fields': ['instruction', 'illustration'],
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills',
              }
            },
            files: {
              data: [
                {
                  id: 'attachment recordId generated by Airtable',
                  type: 'attachments',
                }
              ]
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
                }
              ]
            },
          },
        },
      });
      const localizedChallenge = await knex('localized_challenges').select('embedUrl').where('id', challengeId).pluck('embedUrl');
      expect(localizedChallenge).to.deep.equal([challenge.embedUrl]);
      await expect(knex('translations').orderBy('key').select()).resolves.to.deep.equal([
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

    it('should change challenge\'s primary locale', async () => {
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
        embedTitle: 'Titre d\'embed',
      };
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: originalLocale,
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeId}.instruction`,
        locale: originalLocale,
        value: 'Ancienne valeur de l\'instruction',
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
        .reply(
          200,
          { records: [airtableChallenge] }
        );
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
              'auto-reply': challenge.autoReply,
              focusable: challenge.focusable,
              'updated-at': '2021-10-04',
              'validated-at': '2023-02-02T14:17:30.820Z',
              'archived-at': '2023-03-03T10:47:05.555Z',
              'made-obsolete-at': '2023-04-04T10:47:05.555Z',
              shuffled: false,
              'contextualized-fields': ['instruction', 'illustration'],
            },
            relationships: {
              skill: {
                data: {
                  type: 'skills',
                  id: challenge.skills[0],
                }
              },
              files: {
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
            type: 'QCM',
            format: 'mots',
            proposals: 'propositions',
            solution: 'solution',
            'solution-to-display': 'solution à afficher',
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: 'q-situation',
            author: ['SPS'],
            declinable: 'facilement',
            version: 1,
            genealogy: 'Prototype 1',
            status: 'validé',
            preview: '/api/challenges/recChallengeId/preview',
            timer: 1234,
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Titre d\'embed',
            'embed-height': 500,
            'alternative-version': 2,
            accessibility1: 'OK',
            accessibility2: 'RAS',
            spoil: 'Non Sp',
            responsive: 'non',
            'alternative-locales': [],
            locales: ['fr', 'fr-fr'],
            geography: 'France',
            'auto-reply': false,
            focusable: false,
            'updated-at': '2021-10-04',
            'validated-at': '2023-02-02T14:17:30.820Z',
            'archived-at': '2023-03-03T10:47:05.555Z',
            'made-obsolete-at': '2023-04-04T10:47:05.555Z',
            shuffled: false,
            'contextualized-fields': ['instruction', 'illustration'],
          },
          relationships: {
            skill: {
              data: {
                id: 'recordId generated by Airtable',
                type: 'skills',
              }
            },
            files: {
              data: [
                {
                  id: 'attachment recordId generated by Airtable',
                  type: 'attachments',
                }
              ]
            },
            'localized-challenges': {
              data: [
                {
                  id: challenge.id,
                  type: 'localized-challenges',
                },
              ],
            },
          },
        },
      });
      await expect(knex('localized_challenges').select()).resolves.to.deep.equal([
        {
          id: challengeId,
          challengeId,
          embedUrl: challenge.embedUrl,
          locale: 'fr',
          status: null,
        },
      ]);
      await expect(knex('translations').orderBy('key').select()).resolves.to.deep.equal([
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
