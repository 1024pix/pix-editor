import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Serializer | competence', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    const store = this.owner.lookup('service:store');
    const record = run(() => store.createRecord('competence', {}));

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
