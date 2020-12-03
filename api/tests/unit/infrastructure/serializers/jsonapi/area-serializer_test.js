const { expect, domainBuilder } = require('../../../../test-helper');
const { buildArea } = domainBuilder;
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/area-serializer');

describe('Unit | Serializer | JSONAPI | area-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a Area', () => {
      // Given
      const areas = [
        buildArea({ id: '1', name: 'Nom du domaine 1', code: '1', competenceAirtableIds: ['recCompetence1', 'recCompetence2'] }),
        buildArea({ id: '2', name: 'Nom du domaine 2', code: '2', competenceAirtableIds: ['recCompetence3', 'recCompetence4'] })
      ];
      const expectedSerializedAreas = {
        data: [{
          type: 'areas',
          id: '1',
          attributes: {
            code: '1',
            name: 'Nom du domaine 1',
          },
          relationships: {
            'competences': {
              data: [
                { id: 'recCompetence1', type: 'competences' },
                { id: 'recCompetence2', type: 'competences' },
              ]
            },
          }
        }, {
          type: 'areas',
          id: '2',
          attributes: {
            code: '2',
            name: 'Nom du domaine 2',
          },
          relationships: {
            'competences': {
              data: [
                { id: 'recCompetence3', type: 'competences' },
                { id: 'recCompetence4', type: 'competences' },
              ]
            },
          }
        }]
      };

      // When
      const json = serializer.serialize(areas);

      // Then
      expect(json).to.deep.equal(expectedSerializedAreas);
    });
  });
});
