import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | competence/prototypes/single', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence/prototypes/single');
    assert.ok(route);
  });
});
