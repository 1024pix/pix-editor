import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Serializer | tutorial', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('tutorial', {});

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
