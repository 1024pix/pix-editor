const nock = require('nock');
const { expect, databaseBuilder, domainBuilder, generateAuthorizationHeader, airtableBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | challenges-controller', () => {

  describe('GET /challenges', () => {
    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
    });

    it('should return challenges', async () => {
      // Given
      const challenge = domainBuilder.buildChallenge({ id: 'my id' });
      const airtableChallenges = [
        airtableBuilder.factory.buildChallenge(challenge),
      ];
      airtableBuilder.mockList({ tableName: 'Epreuves' })
        .returns(airtableChallenges)
        .activate();

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
              'alternative-instruction': '',
              type: 'QCM',
              format: 'mots',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
              solution: '1, 5',
              'solution-to-display': '1',
              't1-status': 'Activé',
              't2-status': 'Désactivé',
              't3-status': 'Activé',
              pedagogy: 'q-situation',
              author: ['SPS'],
              declinable: 'facilement',
              version: 1,
              genealogy: 'Prototype 1',
              status: 'validé',
              preview: 'http://staging.pix.fr/challenges/recwWzTquPlvIl4So/preview',
              scoring: '1: @outilsTexte2\n2: @outilsTexte4',
              timer: 1234,
              'embed-url': 'https://github.io/page/epreuve.html',
              'embed-title': 'Epreuve de selection de dossier',
              'embed-height': 500,
              'alternative-version': 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              spoil: 'Non Sp',
              responsive:  'non',
              locales: [],
              area: 'France',
              'auto-reply': false,
              focusable: false,
            }
          },
        ],
      });
    });

    it('should filter challenges by id', async () => {
      // Given
      const challenge1 = domainBuilder.buildChallenge({ id: '1' });
      const challenge2 = domainBuilder.buildChallenge({ id: '2' });
      const airtableCall = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': [
              'id persistant',
              'Compétences (via tube) (id persistant)',
              'Timer',
              'Consigne',
              'Propositions',
              'Type d\'épreuve',
              'Bonnes réponses',
              'Bonnes réponses à afficher',
              'T1 - Espaces, casse & accents',
              'T2 - Ponctuation',
              'T3 - Distance d\'édition',
              'Scoring',
              'Statut',
              'Acquix (id persistant)',
              'Embed URL',
              'Embed title',
              'Embed height',
              'Format',
              'Réponse automatique',
              'Langues',
              'Consigne alternative',
              'Focalisée',
              'Record ID',
              'Acquix',
              'Généalogie',
              'Type péda',
              'Auteur',
              'Déclinable',
              'Preview',
              'Version prototype',
              'Version déclinaison',
              'Non voyant',
              'Daltonien',
              'Spoil',
              'Responsive',
              'Géographie'
            ],
          },
          filterByFormula: 'OR(\'1\' = {id persistant},\'2\' = {id persistant})'
        })
        .reply(200, {
          records: [
            airtableBuilder.factory.buildChallenge(challenge1),
            airtableBuilder.factory.buildChallenge(challenge2),
          ]
        });
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/challenges?filter[ids][]=1&filter[ids][]=2',
        headers: generateAuthorizationHeader(user)
      });

      // Then
      airtableCall.isDone();
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            type: 'challenges',
            id: '1',
            attributes: {
              'airtable-id': challenge1.airtableId,
              instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
              'alternative-instruction': '',
              type: 'QCM',
              format: 'mots',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
              solution: '1, 5',
              'solution-to-display': '1',
              't1-status': 'Activé',
              't2-status': 'Désactivé',
              't3-status': 'Activé',
              pedagogy: 'q-situation',
              author: ['SPS'],
              declinable: 'facilement',
              version: 1,
              genealogy: 'Prototype 1',
              status: 'validé',
              preview: 'http://staging.pix.fr/challenges/recwWzTquPlvIl4So/preview',
              scoring: '1: @outilsTexte2\n2: @outilsTexte4',
              timer: 1234,
              'embed-url': 'https://github.io/page/epreuve.html',
              'embed-title': 'Epreuve de selection de dossier',
              'embed-height': 500,
              'alternative-version': 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              spoil: 'Non Sp',
              responsive:  'non',
              locales: [],
              area: 'France',
              'auto-reply': false,
              focusable: false,
            }
          },
          {
            type: 'challenges',
            id: '2',
            attributes: {
              'airtable-id': challenge2.airtableId,
              instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
              'alternative-instruction': '',
              type: 'QCM',
              format: 'mots',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
              solution: '1, 5',
              'solution-to-display': '1',
              't1-status': 'Activé',
              't2-status': 'Désactivé',
              't3-status': 'Activé',
              pedagogy: 'q-situation',
              author: ['SPS'],
              declinable: 'facilement',
              version: 1,
              genealogy: 'Prototype 1',
              status: 'validé',
              preview: 'http://staging.pix.fr/challenges/recwWzTquPlvIl4So/preview',
              scoring: '1: @outilsTexte2\n2: @outilsTexte4',
              timer: 1234,
              'embed-url': 'https://github.io/page/epreuve.html',
              'embed-title': 'Epreuve de selection de dossier',
              'embed-height': 500,
              'alternative-version': 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              spoil: 'Non Sp',
              responsive:  'non',
              locales: [],
              area: 'France',
              'auto-reply': false,
              focusable: false,
            }
          }
        ]
      });
    });

  });

});
