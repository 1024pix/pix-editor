const { expect } = require('../../../../test-helper');
const tubeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tube-datasource');
const tubeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/tubeRawAirTableFixture');
const tubeAirtableDataModelFixture = require('../../../../tooling/fixtures/infrastructure/tubeAirtableDataObjectFixture');

describe('Unit | Infrastructure | Datasource | Airtable | TubeDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Tube from the AirtableRecord', () => {
      // given
      const expectedTube = tubeAirtableDataModelFixture();

      // when
      const tube = tubeDatasource.fromAirTableObject(tubeRawAirTableFixture());

      // then
      expect(tube).to.deep.equal(expectedTube);
    });
  });
});
