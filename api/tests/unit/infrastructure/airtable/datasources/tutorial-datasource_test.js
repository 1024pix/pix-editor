const { expect } = require('../../../../test-helper');
const tutorialDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const tutorialAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/tutorialAirtableDataObjectFixture');
const tutorialRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/tutorialRawAirtableFixture');

describe('Unit | Infrastructure | Datasource | Airtable | TutorialDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Tutorial from the AirtableRecord', () => {
      // given
      const expectedTuto = tutorialAirtableDataObjectFixture();

      // when
      const tuto = tutorialDatasource.fromAirTableObject(tutorialRawAirTableFixture());

      // then
      expect(tuto).to.deep.equal(expectedTuto);
    });
  });
});
