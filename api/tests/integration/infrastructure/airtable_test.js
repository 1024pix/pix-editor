const AirtableRecord = require('airtable').Record;
const { airtableBuilder, expect } = require('../../test-helper');
const airtable = require('../../../lib/infrastructure/airtable');

function assertAirtableRecordToEqualExpectedJson(actualRecord, expectedRecordJson) {
  expect(actualRecord).to.be.an.instanceOf(AirtableRecord);
  expect(actualRecord.fields).to.deep.equal(expectedRecordJson.fields);
  expect(actualRecord._rawJson).to.deep.equal(expectedRecordJson);
}

describe('Integration | Infrastructure | airtable', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
  });

  describe('#findRecords', () => {

    const tableName = 'Tests';
    const airtableRecordsJson = [{
      id: 'recId1',
      fields: {
        foo: 'bar',
        titi: 'toto',
        toto: 'titi'
      }
    }, {
      id: 'recId2',
      fields: {
        foo: 'bar',
        titi: 'toto',
        toto: 'titi'
      }
    }];

    const airtableRecordsJsonWithSpecificFields = [{
      id: 'recId1',
      fields: {
        titi: 'toto',
        toto: 'titi'
      }
    }, {
      id: 'recId2',
      fields: {
        titi: 'toto',
        toto: 'titi'
      }
    }];

    beforeEach(() => {
      airtableBuilder
        .mockList({ tableName })
        .respondsToQuery({})
        .returns(airtableRecordsJson)
        .activate();

      airtableBuilder
        .mockList({ tableName })
        .respondsToQuery({
          'fields[]': ['titi', 'toto']
        })
        .returns(airtableRecordsJsonWithSpecificFields)
        .activate();
    });

    it('should query for records', async () => {
      // when
      const records = await airtable.findRecords(tableName);

      // then
      records.forEach((record, index) => {
        const expectedRecord = airtableRecordsJson[index];
        assertAirtableRecordToEqualExpectedJson(record, expectedRecord);
      });
    });

    it('should allow query for records with specific fields', async () => {
      // when
      const records = await airtable.findRecords(tableName, ['titi', 'toto']);

      // then
      records.forEach((record, index) => {
        const expectedRecord = airtableRecordsJsonWithSpecificFields[index];
        assertAirtableRecordToEqualExpectedJson(record, expectedRecord);
      });
    });
  });

});
