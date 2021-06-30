const { expect, sinon } = require('../../../../test-helper');
const dataSource = require('../../../../../lib/infrastructure/datasources/airtable/datasource');
const airtable = require('../../../../../lib/infrastructure/airtable');

describe('Unit | Infrastructure | Datasource | Airtable | datasource', () => {

  const someDatasource = dataSource.extend({

    modelName: 'AirtableModel',

    tableName: 'Airtable_table',

    usedFields: ['Shi', 'Foo', 'Me'],

    fromAirTableObject: (record) => ({
      id: record.id,
      tableName: record.tableName,
      fields: record.fields
    }),
    toAirTableObject: (model) => ({
      fields: {
        'id persistant': model.id,
      }
    }),
  });

  describe('#list', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords').callsFake(async (tableName, options) => {
        return [{ id: 1, tableName, ...options }];
      });
    });

    it('should fetch all the records of a given type (table) from Airtable (or its cached copy)', async () => {
      // when
      const record = await someDatasource.list();

      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Me'] }]);
    });

    it('should correctly manage the `this` context', async () => {
      // given
      const unboundList = someDatasource.list;

      // when
      const record = await unboundList();

      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Me'] }]);
    });
  });

  describe('#filter', () => {

    it('should fetch records of a given type and given ids', async () => {
      // given
      sinon.stub(airtable, 'findRecords').callsFake(async (tableName, options) => {
        const returnValue = [{ id: 1, tableName, ...options }];
        return returnValue;
      });

      // when
      await someDatasource.filter({ ids: ['1', '2'] });

      // then
      expect(airtable.findRecords).to.have.been.calledWith(
        'Airtable_table',
        {
          fields: ['Shi', 'Foo', 'Me'],
          filterByFormula: 'OR(\'1\' = {id persistant},\'2\' = {id persistant})',
        }
      );
    });
  });

  describe('#create', () => {

    it('should create record', async () => {
      // given
      sinon.stub(airtable, 'createRecord').callsFake(async (tableName, options) => {
        const returnValue = { id: 1, tableName, ...options };
        return returnValue;
      });

      // when
      const createdChallenge = await someDatasource.create({ id: 'created-record-id' });

      // then
      expect(createdChallenge).to.deep.equal({
        id: 1,
        tableName: 'Airtable_table',
        fields: { 'id persistant': 'created-record-id' },
      });

    });
  });
});
