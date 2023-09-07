const { expect, domainBuilder, airtableBuilder } = require('../../../../test-helper');
const tutorialDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | TutorialDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Tutorial from the AirtableRecord', () => {
      // given
      const expectedTutorial = domainBuilder.buildTutorialDatasourceObject();
      const airtableTutorial = airtableBuilder.factory.buildTutorial(expectedTutorial);
      const tutorialRecord = new AirtableRecord('Tutorial', airtableTutorial.id, airtableTutorial);

      // when
      const tuto = tutorialDatasource.fromAirTableObject(tutorialRecord);

      // then
      expect(tuto).to.deep.equal(expectedTutorial);
    });
  });
});
