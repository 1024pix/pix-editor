import { describe, expect, it } from 'vitest';
import { domainBuilder, airtableBuilder } from '../../../../test-helper.js';
import { thematicDatasource } from '../../../../../lib/infrastructure/datasources/airtable/thematic-datasource.js';
import airtable from 'airtable';

const { Record: AirtableRecord } = airtable;

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
