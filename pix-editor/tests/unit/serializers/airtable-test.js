import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | airtable', function(hooks) {
  setupTest(hooks);

  module('#serialize', function() {
    test('it should serialize hasMany relation', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const serializer = store.serializerFor('airtable');
      const snapshot = {
        eachAttribute() {},
        eachRelationship(callback) {
          callback('key', { kind: 'hasMany', key: 'key' });
        },
        hasMany() { return [
          {
            id: 1,
            attributes() {return {};}
          },
          {
            id: 2,
            attributes() {return {};}
          }
        ]; },
        type: {
          determineRelationshipType() { return 'manyToMany'; },
          attributes: {
            key: 'key',
            has() { return true; }
          }
        }
      };

      // when
      const serialized = serializer.serialize(snapshot, {});

      // then
      assert.deepEqual(serialized, { key: [1, 2] });
    });

    test('it should verify primaryKey to serialise', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const serializer = store.serializerFor('airtable');
      const snapshot = {
        eachAttribute() {},
        eachRelationship(callback) {
          callback('key', { kind: 'hasMany', key: 'key' });
        },
        hasMany() { return [{
          id: 'primaryKey',
          attributes() { return { airtableId: 'MyIdea' }; }
        }]; },
        type: {
          determineRelationshipType() { return 'manyToMany'; },
          attributes: {
            key: 'key',
            has() { return true; }
          }
        }
      };

      // when
      const serialized = serializer.serialize(snapshot, {});

      // then
      assert.deepEqual(serialized, { key: ['MyIdea'] });
    });
  });
});
