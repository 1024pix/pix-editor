import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Serializer | airtable', function(hooks) {
  setupTest(hooks);
  let store, modelFor;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
    modelFor = store.modelFor;
    store.modelFor = sinon.stub().returns({
      determineRelationshipType() { return 'manyToMany'; },
      attributes: {
        key: 'key',
        has() { return true; },
      },
    });
  });

  hooks.afterEach(function() {
    store.modelFor = modelFor;
  });

  module('#serialize', function() {
    test('it should serialize hasMany relation', function(assert) {
      // given
      const serializer = store.serializerFor('airtable');
      const snapshot = {
        eachAttribute() {},
        eachRelationship(callback) {
          callback('key', { kind: 'hasMany', key: 'key' });
        },
        hasMany() { return [
          {
            id: 1,
            attributes() {return {};},
          },
          {
            id: 2,
            attributes() {return {};},
          },
        ]; },
      };

      // when
      const serialized = serializer.serialize(snapshot, {});

      // then
      assert.deepEqual(serialized, { key: [1, 2] });
    });

    test('it should verify primaryKey to serialise', function(assert) {
      // given
      const serializer = store.serializerFor('airtable');
      const snapshot = {
        eachAttribute() {},
        eachRelationship(callback) {
          callback('key', { kind: 'hasMany', key: 'key' });
        },
        hasMany() { return [{
          id: 'primaryKey',
          attributes() { return { airtableId: 'MyIdea' }; },
        }]; },
      };

      // when
      const serialized = serializer.serialize(snapshot, {});

      // then
      assert.deepEqual(serialized, { key: ['MyIdea'] });
    });
  });
});
