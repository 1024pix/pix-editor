const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer');

describe('Unit | Serializer | JSONAPI | challenge-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a Challenge', () => {
      // Given
      const challenge = domainBuilder.buildChallenge();
      const expectedSerializedChallenge = {
        data: {
          type: 'challenges',
          id: `${challenge.id}`,
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
        }
      };

      // When
      const json = serializer.serialize(challenge);

      // Then
      expect(json).to.deep.equal(expectedSerializedChallenge);
    });
  });
});
