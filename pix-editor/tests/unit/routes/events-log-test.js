import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | events-log', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:events-log');
    assert.ok(route);
  });
});
