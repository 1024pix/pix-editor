const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getAreas = require('../../../../lib/domain/usecases/get-areas');
const { buildArea } = domainBuilder;

describe('Unit | UseCase | get-areas', function() {

  it('should return Areas (Domaines)', async function() {
    // Given
    const expectedAreas = [buildArea({ id: '1', name: 'Nom du domaine 1', code: '1' })];
    const areaRepositoryGetStub = sinon.stub();
    const areaRepository = { get: areaRepositoryGetStub };
    areaRepositoryGetStub.withArgs().resolves(expectedAreas);

    // When
    const areas = await getAreas({ areaRepository });

    // Then
    expect(areas).to.deep.equal(expectedAreas);
  });

});

