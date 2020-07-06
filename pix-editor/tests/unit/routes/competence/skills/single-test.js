import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | competence/skills/single', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence/skills/single');
    assert.ok(route);
  });
});
