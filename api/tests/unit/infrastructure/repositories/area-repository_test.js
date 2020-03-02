const { expect, sinon, domainBuilder } = require('../../../test-helper');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');

describe('Unit | Repository | area-repository', function () {

  beforeEach(() => {
    sinon.stub(areaDatasource, 'list');

    areaDatasource.list.resolves([
      domainBuilder.buildAreaAirtableDataObject({
        id: 'recDomaine1',
        code: '1',
        title: 'Domaine 1',
        name: '1. Domaine 1',
        color: 'emerald',
      }),
      domainBuilder.buildAreaAirtableDataObject({
        id: 'recDomaine2',
        code: '2',
        title: 'Domaine 2',
        name: '2. Domaine 2',
        color: 'wild-strawberry',
      }),
    ]);
  });

  describe('#list', () => {

    it('should fetch all area records from Airtable "Domaines" table', () => {
      // when
      const fetchedAreas = areaRepository.list();

      // then
      return fetchedAreas.then(() => {
        expect(areaDatasource.list).to.have.been.called;
      });
    });

    it('should return domain Area objects', async () => {
      // given
      const expectedAreas = [{
        id: 'recDomaine1',
        name: '1. Domaine 1',
        code: '1',
        title: 'Domaine 1',
        color: 'emerald',
        competences: []
      }, {
        id: 'recDomaine2',
        name: '2. Domaine 2',
        code: '2',
        title: 'Domaine 2',
        color: 'wild-strawberry',
        competences: []
      }];

      // when
      const fetchedAreas = await areaRepository.list();

      // then
      expect(fetchedAreas).to.deep.equal(expectedAreas);
    });
  });
});
