import { describe, expect, it } from 'vitest';
import { airtableBuilder, domainBuilder } from '../../../../test-helper.js';
import { tubeDatasource } from '../../../../../lib/infrastructure/datasources/airtable/index.js';
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

    it('should create a Tube from the AirtableRecord even when Tube has no skills', () => {
      // given
      const expectedTube = domainBuilder.buildTubeDatasourceObject({
        skillAirtableIds: [],
        skillIds: [],
      });
      const airtableTube = airtableBuilder.factory.buildTube({
        ...expectedTube,
        skillAirtableIds: null,
        skillIds: null,
      });
      const tubeRecord = new AirtableRecord('Tube', airtableTube.id, airtableTube);

      // when
      const tube = tubeDatasource.fromAirTableObject(tubeRecord);

      // then
      expect(tube).to.deep.equal(expectedTube);
    });
  });
});
