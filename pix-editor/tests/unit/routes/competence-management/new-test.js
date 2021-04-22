import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | competence-management/new', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence-management/new');
    assert.ok(route);
  });
});
