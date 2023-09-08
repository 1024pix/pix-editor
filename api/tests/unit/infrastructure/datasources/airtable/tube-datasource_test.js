import { describe, expect, it } from 'vitest';
import { domainBuilder, airtableBuilder } from '../../../../test-helper.js';
import { tubeDatasource } from '../../../../../lib/infrastructure/datasources/airtable/tube-datasource.js';
import airtable from 'airtable';

const { Record: AirtableRecord } = airtable;

describe('Unit | Infrastructure | Datasource | Airtable | TubeDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Tube from the AirtableRecord', () => {
      // given
      const expectedTube = domainBuilder.buildTubeDatasourceObject();
      const airtableTube = airtableBuilder.factory.buildTube(expectedTube);
      const tubeRecord = new AirtableRecord('Tube', airtableTube.id, airtableTube);

      // when
      const tube = tubeDatasource.fromAirTableObject(tubeRecord);

      // then
      expect(tube).to.deep.equal(expectedTube);
    });
  });
});
