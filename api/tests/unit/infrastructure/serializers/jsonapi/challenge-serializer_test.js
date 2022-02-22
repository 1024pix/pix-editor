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
            't1-status': true,
            't2-status': false,
            't3-status': true,
            pedagogy: 'q-situation',
            author: ['SPS'],
            declinable: 'facilement',
            version: 1,
            genealogy: 'Prototype 1',
            status: 'validé',
            preview: 'http://staging.pix.fr/challenges/recwWzTquPlvIl4So/preview',
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
            'updated-at': '2021-10-04'
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
          }
        }
      };

      // When
      const json = serializer.serialize(challenge);

      // Then
      expect(json).to.deep.equal(expectedSerializedChallenge);
    });
  });

  describe('#deserialize', () => {
    it('should deserialize a Challenge', async () => {
      // Given
      const expectedDeserializedChallenge = domainBuilder.buildChallenge();
      delete expectedDeserializedChallenge.skillIds;
      delete expectedDeserializedChallenge.skillId;
      delete expectedDeserializedChallenge.delta;
      delete expectedDeserializedChallenge.alpha;
      const json = {
        data: {
          type: 'challenges',
          id: `${expectedDeserializedChallenge.id}`,
          attributes: {
            'airtable-id': expectedDeserializedChallenge.airtableId,
            instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
            'alternative-instruction': '',
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
            preview: 'http://staging.pix.fr/challenges/recwWzTquPlvIl4So/preview',
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
            competenceId: 'recsvLz0W2ShyfD63',
            'updated-at': '2021-10-04',
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
          },
        }
      };

      // When
      const challenge = await serializer.deserialize(json);

      // Then
      expect(challenge).to.deep.equal(expectedDeserializedChallenge);
    });
  });
});
