import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

module('Unit | Route | competence/templates/single/alternatives', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence/templates/single/alternatives');
    assert.ok(route);
  });
});
