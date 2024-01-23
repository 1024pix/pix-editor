import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | competence', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('competence', {});

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
