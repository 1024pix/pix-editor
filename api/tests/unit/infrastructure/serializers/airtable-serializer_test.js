import { describe, expect, it } from 'vitest';
import { airtableBuilder, domainBuilder } from '../../../test-helper.js';
import { serialize } from '../../../../lib/infrastructure/serializers/airtable-serializer.js';

describe('Unit | Infrastructure | Serializers | Airtable Serializer', () => {
  describe('#serialize', () => {

    it('should create a Area from the AirtableRecord', () => {
      // given
      const expectedArea = domainBuilder.buildAreaDatasourceObject();
      const airtableObject = airtableBuilder.factory.buildArea(expectedArea);
      const tableName = 'Domaines';

      // when
      const { updatedRecord, model } = serialize({ airtableObject, tableName });

      // then
      expect(updatedRecord).to.deep.equal(expectedArea);
      expect(model).to.deep.equal('areas');
    });
  });
});
