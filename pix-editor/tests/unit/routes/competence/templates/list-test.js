import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

module('Unit | Route | competence/templates/list', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence/templates/list');
    assert.ok(route);
  });
});
