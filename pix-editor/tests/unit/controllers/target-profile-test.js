import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

module('Unit | Controller | target-profile', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const controller = this.owner.lookup('controller:target-profile');
    assert.ok(controller);
  });
});
