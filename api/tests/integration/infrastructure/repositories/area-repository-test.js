const { airtableBuilder, expect } = require('../../../test-helper');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');
const Area = require('../../../../lib/domain/models/Area');

describe('Integration | Repository | area-repository', function() {
  afterEach(() => {
    return airtableBuilder.cleanAll();
  });

  it('should return Areas (Domaines) sorted by code', async function() {
    // Given
    const area0 = {
      id: 'recArea0',
      code: '0',
      name: 'area0name',
      competenceIds: ['recCompetence1', 'recCompetence2'],
      competenceAirtableIds: ['recCompetence1', 'recCompetence2'],
    };
    const area1 = {
      id: 'recArea1',
      code: '1',
      name: 'area1name',
      competenceIds: ['recCompetence3', 'recCompetence4'],
      competenceAirtableIds: ['recCompetence3', 'recCompetence4'],
    };
    airtableBuilder.mockList({ tableName: 'Domaines' })
      .returns([
        airtableBuilder.factory.buildArea(area1),
        airtableBuilder.factory.buildArea(area0),
      ])
      .activate();

    // When
    const areas = await areaRepository.get();

    // Then
    expect(areas).to.have.lengthOf(2);
    expect(areas[0]).to.be.instanceof(Area);
    expect(areas).to.be.deep.equal([
      { id: area0.id, code: area0.code, name: area0.name, competenceIds: area0.competenceIds, competenceAirtableIds: area0.competenceAirtableIds },
      { id: area1.id, code: area1.code, name: area1.name, competenceIds: area1.competenceIds, competenceAirtableIds: area1.competenceAirtableIds },
    ]);
  });
});

