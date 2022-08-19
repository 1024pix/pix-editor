const { expect, domainBuilder, airtableBuilder } = require('../../../../test-helper');
const tubeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tube-datasource');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | TubeDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Tube from the AirtableRecord', () => {
      // given
      const expectedTube = domainBuilder.buildTubeAirtableDataObject();
      const airtableTube = airtableBuilder.factory.buildTube(expectedTube);
      const tubeRecord = new AirtableRecord('Tube', airtableTube.id, airtableTube);

      // when
      const tube = tubeDatasource.fromAirTableObject(tubeRecord);

      // then
      expect(tube).to.deep.equal(expectedTube);
    });
  });
});
