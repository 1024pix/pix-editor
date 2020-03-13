const { expect, sinon } = require('../../../../test-helper');
const dataSource = require('../../../../../lib/infrastructure/datasources/airtable/datasource');
const airtable = require('../../../../../lib/infrastructure/airtable');

describe('Unit | Infrastructure | Datasource | Airtable | datasource', () => {

  const someDatasource = dataSource.extend({

    modelName: 'AirtableModel',

    tableName: 'Airtable_table',

    usedFields: ['Shi', 'Foo', 'Bar'],

    fromAirTableObject: (record) => ({
      id: record.id,
      tableName: record.tableName,
      fields: record.fields
    }),
  });

  describe('#list', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords').callsFake(async (tableName, usedFields) => {
        return [{ id: 1, tableName, fields: usedFields }];
      });
    });

    it('should fetch all the records of a given type (table) from Airtable (or its cached copy)', async () => {
      // when
      const record = await someDatasource.list();

      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Bar'] }]);
    });

    it('should correctly manage the `this` context', async () => {
      // given
      const unboundList = someDatasource.list;

      // when
      const record = await unboundList();

      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Bar'] }]);
    });
  });
});
