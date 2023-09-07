const { expect, domainBuilder, airtableBuilder } = require('../../../../test-helper');
const thematicDatasource = require('../../../../../lib/infrastructure/datasources/airtable/thematic-datasource');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | ThematicDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Thematic from the AirtableRecord', () => {
      // given
      const expectedThematic = domainBuilder.buildThematicDatasourceObject();
      const airtableThematic = airtableBuilder.factory.buildThematic(expectedThematic);
      const thematicRecord = new AirtableRecord('Thematic', airtableThematic.id, airtableThematic);

      // when
      const thematic = thematicDatasource.fromAirTableObject(thematicRecord);

      // then
      expect(thematic).to.deep.equal(expectedThematic);
    });
  });
});
