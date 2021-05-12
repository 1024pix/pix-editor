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
});
