import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

module('Unit | Adapter | competence', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const adapter = this.owner.lookup('adapter:competence');
    assert.ok(adapter);
  });
});
