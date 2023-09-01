import { expect, domainBuilder, airtableBuilder } from '../../../../test-helper.js';
import { frameworkDatasource } from '../../../../../lib/infrastructure/datasources/airtable/framework-datasource.js';
import airtable from 'airtable';

const { Record: AirtableRecord } = airtable;

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
