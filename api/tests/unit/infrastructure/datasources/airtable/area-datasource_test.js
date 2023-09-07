const { expect, domainBuilder, airtableBuilder } = require('../../../../test-helper');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/airtable/area-datasource');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | AreaDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Area from the AirtableRecord', () => {
      // given
      const expectedArea = domainBuilder.buildAreaDatasourceObject();
      const airtableArea = airtableBuilder.factory.buildArea(expectedArea);
      const areaRecord = new AirtableRecord('Domaines', airtableArea.id, airtableArea);

      // when
      const area = areaDatasource.fromAirTableObject(areaRecord);

      // then
      expect(area).to.deep.equal(expectedArea);
    });
  });

});
