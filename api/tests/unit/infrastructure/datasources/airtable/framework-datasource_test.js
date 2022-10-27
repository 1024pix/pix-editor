const { expect, domainBuilder, airtableBuilder } = require('../../../../test-helper');
const frameworkDatasource = require('../../../../../lib/infrastructure/datasources/airtable/framework-datasource');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | FrameworkDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Framework from the AirtableRecord', () => {
      // given
      const expectedFramework = domainBuilder.buildFrameworkForRelease();
      const airtableFramework = airtableBuilder.factory.buildFramework(expectedFramework);
      const recordFramework = new AirtableRecord('Referentiel', airtableFramework.id, airtableFramework);

      // when
      const framework = frameworkDatasource.fromAirTableObject(recordFramework);

      // then
      expect(framework).to.deep.equal(expectedFramework);
    });
  });

});
