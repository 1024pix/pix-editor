import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | competence/skills/single/archive', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const controller = this.owner.lookup('controller:authenticated.competence/skills/single/archive');
    assert.ok(controller);
  });
});
