import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | airtable', function(hooks) {
  setupTest(hooks);

  module('#updateRecord', function() {
    test('when the primaryKey is the record id, it uses the id', function(assert) {
      const adapter = this.owner.lookup('adapter:airtable');
      const serializer = {
        primaryKey: 'Record ID',
        serializeIntoHash() {},
      };
      const store = {
        serializerFor() {
          return serializer;
        },
      };
      const type = {
        modelName: 'TestTable'
      };
      const snapshot = {
        id: '1',
        attributes() {
          return {
            airtableId: 'myAirtableId',
          };
        },
      };

      adapter.ajax = sinon.stub();
      adapter.updateRecord(store, type, snapshot);

      assert.ok(adapter.ajax.called);
      assert.ok(adapter.ajax.calledWith('/api/airtable/content/testTables/1', 'PATCH', { data: {} }));
    });

    test('when the primaryKey is the persistant id, it uses the record id', function(assert) {
      const adapter = this.owner.lookup('adapter:airtable');
      const serializer = {
        primaryKey: 'id persistant',
        serializeIntoHash() {},
      };
      const store = {
        serializerFor() {
          return serializer;
        },
      };
      const type = {
        modelName: 'TestTable'
      };
      const snapshot = {
        id: '1',
        attributes() {
          return {
            airtableId: 'myAirtableId',
          };
        },
      };

      adapter.ajax = sinon.stub();
      adapter.updateRecord(store, type, snapshot);

      assert.ok(adapter.ajax.called);
      assert.ok(adapter.ajax.calledWith('/api/airtable/content/testTables/myAirtableId', 'PATCH', { data: {} }));
    });

    test('when the primaryKey is set but the airtableId is null, it POST to create the record', function(assert) {
      const adapter = this.owner.lookup('adapter:airtable');
      const serializer = {
        primaryKey: 'id persistant',
        serializeIntoHash() {},
      };
      const store = {
        serializerFor() {
          return serializer;
        },
      };
      const type = {
        modelName: 'TestTable'
      };
      const snapshot = {
        id: '1',
        attributes() {
          return {
            airtableId: undefined,
          };
        },
      };

      adapter.ajax = sinon.stub();
      adapter.updateRecord(store, type, snapshot);

      assert.ok(adapter.ajax.called);
      assert.ok(adapter.ajax.calledWith('/api/airtable/content/testTables', 'POST', { data: {} }));
    });
  });

  module('#findMany', function() {
    const MAX_IDS = 3;

    test('call ajax with the right parameter', function(assert) {
      const adapter = this.owner.lookup('adapter:airtable');
      const serializer = {
        primaryKey: 'id persistant',
      };
      const store = {
        serializerFor() {
          return serializer;
        },
      };
      const type = {
        modelName: 'TestTable'
      };
      adapter.ajax = sinon.stub();

      adapter.findMany(store, type, [1, 2, 3], [], MAX_IDS);

      assert.ok(adapter.ajax.called);
      assert.ok(adapter.ajax.calledWith('/api/airtable/content/testTables', 'GET', { data: { filterByFormula: 'OR({id persistant} = \'1\',{id persistant} = \'2\',{id persistant} = \'3\')' } }));
    });

    test('split the ajax calls', function(assert) {
      const adapter = this.owner.lookup('adapter:airtable');
      const serializer = {
        primaryKey: 'id persistant',
      };
      const store = {
        serializerFor() {
          return serializer;
        },
      };
      const type = {
        modelName: 'TestTable'
      };
      adapter.ajax = sinon.stub().resolves({ records: ['data'] });

      adapter.findMany(store, type, [1, 2, 3, 4], [], MAX_IDS);

      assert.ok(adapter.ajax.calledTwice);
      assert.ok(adapter.ajax.getCalls()[0].calledWith('/api/airtable/content/testTables', 'GET', { data: { filterByFormula: 'OR({id persistant} = \'1\',{id persistant} = \'2\',{id persistant} = \'3\')' } }));
      assert.ok(adapter.ajax.getCalls()[1].calledWith('/api/airtable/content/testTables', 'GET', { data: { filterByFormula: 'OR({id persistant} = \'4\')' } }));
    });

    test('returns response from ajax call', async function(assert) {
      const adapter = this.owner.lookup('adapter:airtable');
      const serializer = {
        primaryKey: 'id persistant',
      };
      const store = {
        serializerFor() {
          return serializer;
        },
      };
      const type = {
        modelName: 'TestTable'
      };
      adapter.ajax = sinon.stub().resolves({ records: ['data'] });

      const response = await adapter.findMany(store, type, [1, 2, 3], [], MAX_IDS);

      assert.deepEqual(response, { records: ['data'] });
    });

    test('merges responses from splitted ajax calls', async function(assert) {
      const adapter = this.owner.lookup('adapter:airtable');
      const serializer = {
        primaryKey: 'id persistant',
      };
      const store = {
        serializerFor() {
          return serializer;
        },
      };
      const type = {
        modelName: 'TestTable'
      };
      adapter.ajax = sinon.stub()
        .onFirstCall().resolves({ records: ['data'] })
        .onSecondCall().resolves({ records: ['data2'] });

      const response = await adapter.findMany(store, type, [1, 2, 3, 4], [], MAX_IDS);

      assert.deepEqual(response, { records: ['data', 'data2'] });
    });
  });
});
