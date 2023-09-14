import { beforeEach, describe, expect, it, vi } from 'vitest';
import { datasource } from '../../../../../lib/infrastructure/datasources/airtable/datasource.js';
import * as airtable from '../../../../../lib/infrastructure/airtable.js';

describe('Unit | Infrastructure | Datasource | Airtable | datasource', () => {

  const someDatasource = datasource.extend({

    modelName: 'AirtableModel',

    tableName: 'Airtable_table',

    usedFields: ['Shi', 'Foo', 'Me'],

    fromAirTableObject: (record) => ({ ...record }),
    toAirTableObject: (model) => ({
      fields: {
        'id persistant': model.id,
      }
    }),
  });

  describe('#list', () => {

    beforeEach(() => {
      vi.spyOn(airtable, 'findRecords').mockImplementation(async (tableName, options) => {
        return [{ id: 1, tableName, ...options }];
      });
    });

    it('should fetch all the records of a given type (table) from Airtable (or its cached copy)', async () => {
      // when
      const record = await someDatasource.list();

      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Me'], sort: [{ direction: 'asc', field: 'id persistant' }] }]);
    });

    it('should correctly manage the `this` context', async () => {
      // given
      const unboundList = someDatasource.list;

      // when
      const record = await unboundList();

      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Me'], sort: [{ direction: 'asc', field: 'id persistant' }] }]);
    });

    it('should get list with limit', async () => {
      // when
      const record = await someDatasource.list({ page: { size: 20 } });
      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Me'], maxRecords: 20, sort: [{ direction: 'asc', field: 'id persistant' }] }]);

    });
  });

  describe('#filter', () => {

    it('should fetch records of a given type and given ids', async () => {
      // given
      vi.spyOn(airtable, 'findRecords').mockImplementation(async (tableName, options) => {
        const returnValue = [{ id: 1, tableName, ...options }];
        return returnValue;
      });

      // when
      await someDatasource.filter({ filter: { ids: ['1', '2'] } });

      // then
      expect(airtable.findRecords).toHaveBeenCalledWith(
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
      vi.spyOn(airtable, 'createRecord').mockImplementation(async (tableName, options) => {
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
