import { expect, domainBuilder, airtableBuilder } from '../../../../test-helper.js';
import { tutorialDatasource } from '../../../../../lib/infrastructure/datasources/airtable/tutorial-datasource.js';
import airtable from 'airtable';

const { Record: AirtableRecord } = airtable;

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
