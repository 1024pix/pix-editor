import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Serializer | tube', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('tube', {});

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
