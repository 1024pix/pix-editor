import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Serializer | tube', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    const store = this.owner.lookup('service:store');
    const record = run(() => store.createRecord('tube', {}));

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
