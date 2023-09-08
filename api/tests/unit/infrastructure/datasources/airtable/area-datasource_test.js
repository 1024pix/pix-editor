import { describe, expect, it } from 'vitest';
import { domainBuilder, airtableBuilder } from '../../../../test-helper.js';
import { areaDatasource } from '../../../../../lib/infrastructure/datasources/airtable/area-datasource.js';
import airtable from 'airtable';

const { Record: AirtableRecord } = airtable;

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
