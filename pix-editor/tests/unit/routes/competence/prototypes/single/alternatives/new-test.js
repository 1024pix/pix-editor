import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | competence/prototypes/single/alternatives/new', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence/prototypes/single/alternatives/new');
    assert.ok(route);
  });
});
