import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | competence/quality/single', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence/quality/single');
    assert.ok(route);
  });
});
